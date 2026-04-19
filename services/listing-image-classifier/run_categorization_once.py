from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional

try:
    import requests
except Exception as exc:
    requests = None
    _REQUESTS_IMPORT_ERROR = exc
else:
    _REQUESTS_IMPORT_ERROR = None

try:
    from dotenv import load_dotenv
except Exception:
    def load_dotenv(*_args: Any, **_kwargs: Any) -> bool:
        return False

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent

load_dotenv(REPO_ROOT / ".env.local")
load_dotenv(SCRIPT_DIR / ".env")
load_dotenv()

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

try:
    from listing_image_classifier.enhanced_categorization import perform_categorization
except Exception as exc:
    perform_categorization = None
    _CLASSIFIER_IMPORT_ERROR = exc
else:
    _CLASSIFIER_IMPORT_ERROR = None


class ClassifierError(Exception):
    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = int(status)
        self.message = message


def _emit(payload: Dict[str, Any]) -> None:
    # Keep stdout strictly ASCII-escaped to avoid Windows console charmap failures.
    print(json.dumps(payload, ensure_ascii=True))


def _mls_detail_endpoint() -> str:
    base = (
        os.getenv("RE_API_BASE_URL")
        or os.getenv("RE_API_BASE")
        or "https://api.realestateapi.com/v2"
    ).rstrip("/")
    if base.endswith("/v2"):
        return f"{base}/MLSDetail"
    return f"{base}/v2/MLSDetail"


def _resolve_api_key() -> str:
    api_key = (
        os.getenv("MLS_API_KEY")
        or os.getenv("RE_API_KEY")
        or os.getenv("REALESTATE_API_KEY")
    )
    if not api_key:
        raise ClassifierError(
            503,
            "MLS API key missing. Set one of MLS_API_KEY, RE_API_KEY, or REALESTATE_API_KEY.",
        )
    return str(api_key)


def _fetch_mls_data(listing_id: int) -> Dict[str, Any]:
    if requests is None:
        raise ClassifierError(
            500,
            f"Python dependency missing: {_REQUESTS_IMPORT_ERROR}. "
            f"Install service dependencies from services/listing-image-classifier/requirements.txt",
        )

    endpoint = _mls_detail_endpoint()
    payload = {"listing_id": str(listing_id)}
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": _resolve_api_key(),
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=40)
    except Exception as exc:
        raise ClassifierError(502, f"MLS request failed: {exc}") from exc

    if response.status_code == 404:
        raise ClassifierError(404, f"Listing {listing_id} not found")

    if response.status_code != 200:
        raise ClassifierError(
            502,
            f"MLS API error: {response.status_code} {response.text[:300]}",
        )

    try:
        data = response.json()
    except Exception as exc:
        raise ClassifierError(502, f"Invalid MLS response JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise ClassifierError(502, "Invalid MLS response payload")

    return data


def _parse_input() -> Dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ClassifierError(400, f"Invalid JSON input: {exc}") from exc
    if not isinstance(payload, dict):
        raise ClassifierError(400, "Input payload must be a JSON object")
    return payload


def _listing_id_from_payload(payload: Dict[str, Any]) -> int:
    raw = payload.get("listingId", payload.get("listing_id"))
    if raw is None or raw == "":
        raise ClassifierError(400, "listingId is required")
    try:
        return int(raw)
    except Exception as exc:
        raise ClassifierError(400, "listingId must be an integer") from exc


async def _run(payload: Dict[str, Any]) -> Dict[str, Any]:
    if perform_categorization is None:
        raise ClassifierError(
            500,
            f"Classifier dependency import failed: {_CLASSIFIER_IMPORT_ERROR}. "
            f"Install service dependencies from services/listing-image-classifier/requirements.txt",
        )

    listing_id = _listing_id_from_payload(payload)
    property_id = payload.get("propertyId", payload.get("property_id"))
    mls_data = payload.get("mlsData")
    if not isinstance(mls_data, dict):
        mls_data = _fetch_mls_data(listing_id)

    categorization = await perform_categorization(str(listing_id), mls_data)
    if not isinstance(categorization, dict):
        raise ClassifierError(500, "Image categorization returned no result")

    return {
        "listingId": listing_id,
        "propertyId": property_id,
        "status": "done",
        "categorization": categorization,
        "cacheUsed": False,
        "categorizationCacheUsed": False,
    }


def main() -> int:
    try:
        payload = _parse_input()
        result = asyncio.run(_run(payload))
        _emit({"ok": True, "status": 200, "data": result})
        return 0
    except ClassifierError as exc:
        _emit({"ok": False, "status": exc.status, "error": exc.message})
        return 0
    except Exception as exc:
        _emit({"ok": False, "status": 500, "error": str(exc)})
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
