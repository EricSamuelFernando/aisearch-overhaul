# providers.py
import os
import asyncio
import random
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from urllib.parse import urlsplit, urlunsplit

from dotenv import load_dotenv
import httpx

# Load .env near this file
# ENV_PATH = Path(__file__).with_name(".env")
# load_dotenv(dotenv_path=ENV_PATH, override=False)
load_dotenv()

RE_API_BASE = os.getenv("RE_API_BASE_URL")           # e.g. https://api.realestateapi.com
RE_API_KEY = os.getenv("RE_API_KEY")             # your x-api-key

if not RE_API_BASE:
    raise RuntimeError("RE_API_BASE is not set")
if not RE_API_KEY:
    raise RuntimeError("RE_API_KEY is not set")

HEADERS = {
    "accept": "application/json",
    "content-type": "application/json",
    "x-api-key": RE_API_KEY,
}

# ---------- helpers ----------

def _parse_place(place: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    if not place:
        return None, None, None
    s = place.strip()
    if s.isdigit() and len(s) in (5, 9):
        return None, None, s
    if "," in s:
        parts = [p.strip() for p in s.split(",") if p.strip()]
        if len(parts) >= 2:
            return parts[0], parts[1][:2], None
    parts = s.split()
    if len(parts) >= 2 and len(parts[-1]) == 2:
        return " ".join(parts[:-1]), parts[-1], None
    return s, None, None

def _first(*vals):
    for v in vals:
        if v not in (None, "", [], {}):
            return v
    return None

def _extract_photos_list(obj: Dict[str, Any]) -> List[str]:
    listing = obj.get("listing") or {}
    media = listing.get("media") or {}
    photos = media.get("photosList") or []
    urls: List[str] = []
    for p in photos:
        if isinstance(p, dict):
            url = _first(p.get("highRes"), p.get("midRes"), p.get("lowRes"))
            if url:
                urls.append(url)
    primary = media.get("primaryListingImageUrl")
    if not urls and primary:
        urls.append(primary)
    return urls

def _derive_series_from_primary(primary_url: str, count: int) -> List[str]:
    try:
        sp = urlsplit(primary_url)
        path = sp.path
        if "/" not in path:
            return []
        head, tail = path.rsplit("/", 1)
        if "." not in tail:
            return []
        name, ext = tail.rsplit(".", 1)
        query = sp.query
        urls = []
        for i in range(1, max(1, count) + 1):
            new_tail = f"{i}.{ext}"
            new_path = f"{head}/{new_tail}"
            urls.append(urlunsplit((sp.scheme, sp.netloc, new_path, query, sp.fragment)))
        return urls
    except Exception:
        return []

def _fallback_photos(obj: Dict[str, Any]) -> List[str]:
    listing = obj.get("listing") or {}
    media = listing.get("media") or {}
    primary = media.get("primaryListingImageUrl")
    count_raw = _first(media.get("photosCount"))
    try:
        count = int(str(count_raw))
    except Exception:
        count = 0

    urls: List[str] = []
    if primary and count > 0:
        urls = _derive_series_from_primary(primary, count)
    if urls:
        return urls

    listing_id = str(_first(obj.get("listingId"), obj.get("id")) or "")
    if listing_id and count > 0:
        base = f"https://imagecdn.realty.com/photos/bluestack/{listing_id}"
        return [f"{base}/{i}.jpg" for i in range(1, count + 1)]
    return [primary] if primary else []

def _retryable(status: int) -> bool:
    return status in (429, 500, 502, 503, 504)

# ---------- client ----------

class RealEstateAPI:
    """
    Uses RealEstateAPI /v2/MLSSearch.
    - Keeps a card cache (address/price/beds/baths + photos) from 'search_listings'
      so we can fall back when details intermittently fails.
    - Retries 5xx/429 with jittered backoff.
    """
    def __init__(self, base: str | None = None):
        self.base = base or RE_API_BASE
        self._photos_cache: Dict[str, List[str]] = {}
        self._details_cache: Dict[str, Dict[str, Any]] = {}
        self._cards_map: Dict[str, Dict[str, Any]] = {}   # minimal card info by listingId

    async def _mls_search(self, body: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base}/v2/MLSSearch"
        # 3 retries: ~0.5s, ~1.2s, ~2.5s (jittered)
        backoffs = [0.5, 1.2, 2.5]
        last_exc: Optional[Exception] = None
        async with httpx.AsyncClient(timeout=httpx.Timeout(40.0, connect=10.0, read=30.0)) as client:
            for attempt in range(len(backoffs) + 1):
                try:
                    r = await client.post(url, headers=HEADERS, json=body)
                    if _retryable(r.status_code):
                        raise httpx.HTTPStatusError("retryable", request=r.request, response=r)
                    r.raise_for_status()
                    return r.json()
                except (httpx.HTTPError, httpx.ReadTimeout) as exc:
                    last_exc = exc
                    if attempt == len(backoffs):
                        break
                    await asyncio.sleep(backoffs[attempt] + random.random() * 0.3)
        # surface the final exception
        if last_exc:
            raise last_exc
        return {}

    # --- public API ---

    async def search_listings(self, *, place: str, status: str = "for_sale", limit: int = 24) -> List[Dict[str, Any]]:
        city, state, zip_code = _parse_place(place)
        active = status != "sold"
        sold = status == "sold"

        body: Dict[str, Any] = {
            "include_photos": True,
            "active": active,
            "sold": sold,
            "size": limit,
        }
        if zip_code:
            body["zip"] = zip_code
        elif city:
            body["city"] = city
        if state:
            body["state"] = state

        data = await self._mls_search(body)
        items = data.get("data") or []

        results: List[Dict[str, Any]] = []
        for it in items:
            listing = it.get("listing") or {}
            address = listing.get("address") or {}
            prop    = listing.get("property") or {}
            lead    = listing.get("leadTypes") or {}
            media   = listing.get("media") or {}

            listing_id = str(_first(it.get("listingId"), it.get("id")) or "")

            photos = _extract_photos_list(it)
            if len(photos) <= 1:
                alt = _fallback_photos(it)
                if alt:
                    photos = alt

            if listing_id and photos:
                self._photos_cache[listing_id] = photos

            card = {
                "id": listing_id,
                "address": _first(address.get("unparsedAddress"), address.get("address")),
                "city": address.get("city"),
                "state": address.get("stateOrProvince"),
                "zip": address.get("zipCode"),
                "price": _first(lead.get("mlsListingPrice"), listing.get("listPriceLow")),
                "beds": prop.get("bedroomsTotal"),
                "baths": prop.get("bathroomsTotal"),
                "thumb": _first(media.get("primaryListingImageUrl"), photos[0] if photos else None),
                "photos": photos,
            }
            self._cards_map[listing_id] = card

            results.append({
                "id": card["id"],
                "address": card["address"],
                "city": card["city"],
                "price": card["price"],
                "beds": card["beds"],
                "baths": card["baths"],
                "thumb": card["thumb"],
            })
        return results

    def get_cached_card(self, listing_id: str) -> Optional[Dict[str, Any]]:
        return self._cards_map.get(str(listing_id))

    async def get_listing_details(self, listing_id: str, force_fresh: bool = False) -> Dict[str, Any]:
        lid = str(listing_id)
        
        # Check cache unless force_fresh is True
        if not force_fresh and lid in self._details_cache:
            return self._details_cache[lid]

        # Try live details first (with retries)
        try:
            body = {"include_photos": True, "size": 1, "listingId": lid}
            data = await self._mls_search(body)
            items = data.get("data") or []
            if items:
                it = items[0]
                listing = it.get("listing") or {}
                address = listing.get("address") or {}
                prop    = listing.get("property") or {}
                lead    = listing.get("leadTypes") or {}
                media   = listing.get("media") or {}

                photos = _extract_photos_list(it)
                if len(photos) <= 1:
                    alt = _fallback_photos(it)
                    if alt:
                        photos = alt
                if photos:
                    self._photos_cache[lid] = photos

                detail = {
                    "id": str(_first(it.get("listingId"), it.get("id")) or ""),
                    "url": listing.get("url"),
                    "address": _first(address.get("unparsedAddress"), address.get("address")),
                    "city": address.get("city"),
                    "state": address.get("stateOrProvince"),
                    "zip": address.get("zipCode"),
                    "price": _first(lead.get("mlsListingPrice"), listing.get("listPriceLow")),
                    "beds": prop.get("bedroomsTotal"),
                    "baths": prop.get("bathroomsTotal"),
                    "area_sqft": prop.get("livingArea"),
                    "year_built": prop.get("yearBuilt"),
                    "remarks": listing.get("publicRemarks"),
                    "photos": photos,
                }
                self._details_cache[lid] = detail
                return detail
        except Exception:
            # fall back below
            pass

        # Fallback to cached card (from search) so the modal still has data
        card = self._cards_map.get(lid, {})
        if card:
            photos = self._photos_cache.get(lid) or card.get("photos") or []
            detail = {
                "id": lid,
                "url": None,
                "address": card.get("address"),
                "city": card.get("city"),
                "state": card.get("state"),
                "zip": card.get("zip"),
                "price": card.get("price"),
                "beds": card.get("beds"),
                "baths": card.get("baths"),
                "area_sqft": None,
                "year_built": None,
                "remarks": None,
                "photos": photos,
            }
            self._details_cache[lid] = detail
            if photos:
                self._photos_cache[lid] = photos
            return detail

        # Nothing cached either
        return {}

    async def get_listing_photos(self, listing_id: str, force_fresh: bool = False) -> List[str]:
        lid = str(listing_id)
        
        # Check cache unless force_fresh is True
        if not force_fresh:
            cached = self._photos_cache.get(lid)
            if cached:
                return cached
        
        # Try to get from card first (if not forcing fresh)
        if not force_fresh:
            card = self._cards_map.get(lid)
            if card and card.get("photos"):
                self._photos_cache[lid] = list(card["photos"])
                return list(card["photos"])
        
        # Get from details (with force_fresh option)
        detail = await self.get_listing_details(lid, force_fresh=force_fresh)
        return detail.get("photos", []) if detail else []
