# Listing Image Classifier

This folder contains only the listing image classification functionality extracted from the AI search backend.

## Overhaul Branch Wiring

In this branch, the frontend uses `http://localhost:8001/api/image_categorization`.
The Next.js API route now proxies to this always-on Python service by default (`http://127.0.0.1:8010`),
which keeps OpenCLIP warm and removes per-request Python process cold starts.

## Endpoints

- `GET /api/health`
- `POST /api/image_categorization`
- `POST /api/image_categorization/prefetch`
- `GET /api/image_categorization/status/{listing_id}`

The primary endpoint keeps the same response shape the frontend modal already expects:

- request: `{ "listingId": 123456 }`
- response: `{ "listingId": 123456, "status": "done", "categorization": { ... } }`

## Required Environment Variables

- `MLS_API_KEY` or `RE_API_KEY` (or `REALESTATE_API_KEY` for compatibility)
- Optional: `RE_API_BASE_URL` (defaults to `https://api.realestateapi.com/v2`)

## Optional Environment Variables

- `PORT` (default: `8010`)
- `IMAGE_CATEGORIZATION_PREWARM_ON_STARTUP` (default: `true`)
- `IMAGE_CATEGORIZATION_CACHE_HOURS` (default: `12`)
- `OPENCLIP_MODEL_NAME` (default: `ViT-B-32`)
- `OPENCLIP_PRETRAINED` (default: `laion2b_s34b_b79k`)
- `OPENCLIP_CACHE_DIR`
- `IMAGE_CLASSIFIER_SERVICE_URL` (Next.js server-side proxy target, default: `http://127.0.0.1:8010`)
- `IMAGE_CLASSIFIER_AUTOSTART` (`true`/`false`) controls whether `npm run start` auto-launches this service locally
- `IMAGE_CLASSIFIER_ALLOW_FALLBACK` (`true`/`false`) allows Next.js to fall back to legacy in-process classification if service proxy is unavailable

## Run Locally

```bash
cd services/listing-image-classifier
pip install -r requirements.txt
python run_server.py
```

Or from repository root:

```bash
npm run start
```

`npm run start` now launches this classifier service first (for local URLs), waits for `/api/health`, then starts Next.js.

## Optional Standalone Service Mode

If your Next.js app is running separately, set:

```bash
IMAGE_CLASSIFIER_SERVICE_URL=http://localhost:8010
```
