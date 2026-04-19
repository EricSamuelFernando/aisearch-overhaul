# utils.py
import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from typing import List, Optional, Tuple
from PIL import Image
import requests
from dotenv import load_dotenv

try:
    import cloudscraper
except Exception:
    cloudscraper = None


# load .env
load_dotenv()

CONCURRENCY = max(4, min(24, int(os.getenv("IMAGE_CATEGORIZATION_FETCH_CONCURRENCY", "10"))))
FETCH_TIMEOUT_SEC = max(3.0, float(os.getenv("IMAGE_CATEGORIZATION_IMAGE_TIMEOUT_SEC", "8")))
_pool = ThreadPoolExecutor(max_workers=CONCURRENCY)

# Create a scraper session when cloudscraper is available; otherwise use requests.
if cloudscraper is not None:
    _scraper = cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "windows", "mobile": False}
    )
else:
    _scraper = requests.Session()


def _fetch_one_sync(url: str, api_key: Optional[str] = None) -> Tuple[str, Image.Image | None]:
    """Download a single image, bypassing Cloudflare bot protection."""
    try:
        headers = {}
        if api_key:
            headers["x-api-key"] = api_key
        r = _scraper.get(url, headers=headers, timeout=FETCH_TIMEOUT_SEC, allow_redirects=True)
        r.raise_for_status()
        ctype = r.headers.get("Content-Type", "")
        if "image" not in ctype:
            print(f"[fetch_images] Non-image content-type for {url}: {ctype}")
            return (url, None)
        img = Image.open(BytesIO(r.content)).convert("RGB")
        img.load()
        return (url, img)
    except Exception as e:
        print(f"[fetch_images] Failed to download {url}: {e}")
        return (url, None)


async def fetch_images(urls: List[str], api_key: Optional[str] = None) -> List[Tuple[str, Image.Image | None]]:
    if api_key is None:
        api_key = os.getenv("MLS_API_KEY") or os.getenv("RE_API_KEY")
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(_pool, _fetch_one_sync, url, api_key)
        for url in urls
    ]
    return await asyncio.gather(*tasks)
