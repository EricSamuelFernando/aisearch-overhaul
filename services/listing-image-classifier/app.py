from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import threading
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from listing_image_classifier.classifier import prewarm_openclip_model
from listing_image_classifier.enhanced_categorization import perform_categorization

load_dotenv()

logger = logging.getLogger("listing_image_classifier_api")
if not logging.getLogger().handlers:
    logging.basicConfig(level=logging.INFO)
else:
    logging.getLogger().setLevel(logging.INFO)

app = FastAPI(title="Snaphomz Listing Image Classifier", version="1.0.0")

_CACHE_TTL_SECONDS = max(60, int(os.getenv("IMAGE_CATEGORIZATION_CACHE_HOURS", "12")) * 3600)
_PREWARM_ON_STARTUP = os.getenv("IMAGE_CATEGORIZATION_PREWARM_ON_STARTUP", "true").lower() in {
    "1",
    "true",
    "yes",
    "on",
}

_cache_lock = threading.Lock()
_cache: Dict[str, Dict[str, Any]] = {}

_jobs_lock = threading.Lock()
_jobs: Dict[int, Dict[str, Any]] = {}


class ImageCategorizationRequest(BaseModel):
    listingId: int = Field(..., description="MLS listing ID")
    propertyId: Optional[int] = Field(None, description="Optional property ID for compatibility")
    asyncMode: bool = Field(False, description="Queue classification in background")
    waitTimeoutMs: Optional[int] = Field(None, description="Optional wait timeout for async mode")


class ImageCategorizationPrefetchRequest(BaseModel):
    listingId: int = Field(..., description="MLS listing ID")
    propertyId: Optional[int] = Field(None, description="Optional property ID for compatibility")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _mls_detail_endpoint() -> str:
    base = (
        os.getenv("RE_API_BASE_URL")
        or os.getenv("RE_API_BASE")
        or "https://api.realestateapi.com/v2"
    ).rstrip("/")
    if base.endswith("/v2"):
        return f"{base}/MLSDetail"
    return f"{base}/v2/MLSDetail"


def _resolve_mls_api_key() -> Optional[str]:
    # Keep parity with legacy Node-side compatibility mapping.
    # Some environments provide only REALESTATE_API_KEY.
    return (
        os.getenv("MLS_API_KEY")
        or os.getenv("RE_API_KEY")
        or os.getenv("REALESTATE_API_KEY")
    )


def _fetch_mls_data(listing_id: int) -> Dict[str, Any]:
    api_key = _resolve_mls_api_key()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="MLS_API_KEY or RE_API_KEY (or REALESTATE_API_KEY) is required for image categorization",
        )

    endpoint = _mls_detail_endpoint()
    payload = {"listing_id": str(listing_id)}
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": api_key,
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"MLS request failed: {exc}") from exc

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Listing {listing_id} not found")
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"MLS API error: {response.status_code} {response.text[:300]}",
        )

    try:
        data = response.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Invalid MLS response JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="Invalid MLS response payload")
    return data


def _cache_key_for_listing(listing_id: int, mls_data: Dict[str, Any]) -> str:
    try:
        payload = mls_data.get("data", {}) if isinstance(mls_data, dict) else {}
        media = payload.get("media", {}) if isinstance(payload, dict) else {}
        photos = media.get("photosList", []) if isinstance(media, dict) else []
        photo_urls = []
        if isinstance(photos, list):
            for photo in photos:
                if not isinstance(photo, dict):
                    continue
                url = (
                    str(photo.get("highRes") or "").strip()
                    or str(photo.get("midRes") or "").strip()
                    or str(photo.get("lowRes") or "").strip()
                )
                if url:
                    photo_urls.append(url)
        if not photo_urls:
            primary = str(media.get("primaryListingImageUrl") or "").strip()
            if primary:
                photo_urls.append(primary)

        seed = {
            "listingId": int(listing_id),
            "photosCount": len(photo_urls),
            "firstPhoto": photo_urls[0] if photo_urls else None,
            "lastPhoto": photo_urls[-1] if photo_urls else None,
            "rev": os.getenv("IMAGE_CATEGORIZATION_CACHE_REV", "v1"),
        }
        digest = hashlib.sha256(json.dumps(seed, sort_keys=True).encode("utf-8")).hexdigest()
        return f"image_cat:{digest}"
    except Exception:
        return f"image_cat:listing:{listing_id}"


def _cache_get(key: str) -> Optional[Dict[str, Any]]:
    now = time.time()
    with _cache_lock:
        entry = _cache.get(key)
        if not entry:
            return None
        expires_at = float(entry.get("expires_at", 0))
        if expires_at <= now:
            _cache.pop(key, None)
            return None
        value = entry.get("value")
        return value if isinstance(value, dict) else None


def _cache_set(key: str, value: Dict[str, Any]) -> None:
    with _cache_lock:
        _cache[key] = {
            "value": value,
            "expires_at": time.time() + _CACHE_TTL_SECONDS,
        }


def _set_job(listing_id: int, **fields: Any) -> Dict[str, Any]:
    with _jobs_lock:
        state = dict(_jobs.get(listing_id) or {"listingId": listing_id})
        state.update(fields)
        state["updatedAt"] = _now_iso()
        _jobs[listing_id] = state
        return dict(state)


def _get_job(listing_id: int) -> Optional[Dict[str, Any]]:
    with _jobs_lock:
        state = _jobs.get(listing_id)
        return dict(state) if state else None


async def _run_categorization(listing_id: int, mls_data: Dict[str, Any]) -> Tuple[Dict[str, Any], bool, str]:
    cache_key = _cache_key_for_listing(listing_id, mls_data)
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached, True, cache_key

    result = await perform_categorization(str(listing_id), mls_data)
    if not isinstance(result, dict):
        raise HTTPException(status_code=500, detail="Image categorization returned no result")

    _cache_set(cache_key, result)
    return result, False, cache_key


async def _prefetch_worker(listing_id: int) -> None:
    _set_job(listing_id, status="running", startedAt=_now_iso(), error=None)
    try:
        mls_data = _fetch_mls_data(listing_id)
        _, _, cache_key = await _run_categorization(listing_id, mls_data)
        _set_job(
            listing_id,
            status="done",
            completedAt=_now_iso(),
            cacheKey=cache_key,
            categorizationReady=True,
        )
    except Exception as exc:
        _set_job(
            listing_id,
            status="failed",
            completedAt=_now_iso(),
            error=str(exc),
            categorizationReady=False,
        )


@app.on_event("startup")
def startup() -> None:
    if not _PREWARM_ON_STARTUP:
        logger.info("[ImageCategorization] OpenCLIP prewarm disabled by env")
        return
    try:
        info = prewarm_openclip_model()
        logger.info(
            "[ImageCategorization] OpenCLIP pre-warmed model=%s/%s device=%s",
            info.get("model_name"),
            info.get("pretrained"),
            info.get("device"),
        )
    except Exception as exc:
        logger.warning("[ImageCategorization] OpenCLIP prewarm skipped: %s", exc)


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/image_categorization/prefetch")
async def image_categorization_prefetch(req: ImageCategorizationPrefetchRequest) -> JSONResponse:
    listing_id = int(req.listingId)
    existing = _get_job(listing_id)
    if existing and str(existing.get("status", "")).lower() in {"queued", "running"}:
        return JSONResponse(
            content={
                "listingId": listing_id,
                "status": existing.get("status"),
                "scheduled": False,
                "deduped": True,
                "job": existing,
            }
        )

    _set_job(listing_id, status="queued", queuedAt=_now_iso(), error=None, categorizationReady=False)
    asyncio.create_task(_prefetch_worker(listing_id))

    return JSONResponse(
        content={
            "listingId": listing_id,
            "status": "queued",
            "scheduled": True,
            "deduped": False,
            "job": _get_job(listing_id),
        }
    )


@app.get("/api/image_categorization/status/{listing_id}")
def image_categorization_status(listing_id: int) -> JSONResponse:
    job = _get_job(int(listing_id))
    if not job:
        return JSONResponse(
            content={
                "listingId": int(listing_id),
                "status": "not_started",
                "categorizationReady": False,
            }
        )
    return JSONResponse(
        content={
            "listingId": int(listing_id),
            "status": job.get("status", "unknown"),
            "categorizationReady": bool(job.get("categorizationReady")),
            "job": job,
        }
    )


@app.post("/api/image_categorization")
async def image_categorization(req: ImageCategorizationRequest) -> JSONResponse:
    listing_id = int(req.listingId)

    if req.asyncMode:
        # Reuse prefetch semantics for async requests.
        await image_categorization_prefetch(
            ImageCategorizationPrefetchRequest(listingId=listing_id, propertyId=req.propertyId)
        )
        return JSONResponse(
            status_code=202,
            content={
                "listingId": listing_id,
                "status": "queued",
                "jobQueued": True,
                "cacheUsed": False,
                "categorizationCacheUsed": False,
                "job": _get_job(listing_id),
            },
        )

    mls_data = _fetch_mls_data(listing_id)
    started = time.perf_counter()
    categorization, from_cache, cache_key = await _run_categorization(listing_id, mls_data)
    elapsed_ms = int((time.perf_counter() - started) * 1000)

    _set_job(
        listing_id,
        status="done",
        cacheKey=cache_key,
        completedAt=_now_iso(),
        categorizationReady=True,
    )
    logger.info(
        "[ImageCategorization] listing=%s from_cache=%s elapsed_ms=%s",
        listing_id,
        from_cache,
        elapsed_ms,
    )

    return JSONResponse(
        content={
            "listingId": listing_id,
            "status": "done",
            "categorization": categorization,
            "cacheUsed": False,
            "categorizationCacheUsed": from_cache,
        }
    )
