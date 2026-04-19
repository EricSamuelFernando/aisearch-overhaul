from dotenv import load_dotenv
from datetime import datetime, timezone
import os
import logging
import time

from typing import Dict, Any, Optional, List

from .utils import fetch_images
from .classifier import categorize_images, analyze_property_conditions

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Speed-first defaults: callers can still override via env.
_FETCH_VARIANT = str(os.getenv("IMAGE_CATEGORIZATION_FETCH_VARIANT", "low")).strip().lower()
if _FETCH_VARIANT not in {"high", "mid", "low"}:
    _FETCH_VARIANT = "low"

# Cap photo count by default for predictable latency under concurrency.
_MAX_PHOTOS = int(os.getenv("IMAGE_CATEGORIZATION_MAX_PHOTOS", "24"))


def _preferred_fetch_url(photo: Dict[str, Any]) -> str:
    high = str(photo.get("highRes") or "").strip()
    mid = str(photo.get("midRes") or "").strip()
    low = str(photo.get("lowRes") or "").strip()
    if _FETCH_VARIANT == "low":
        return low or mid or high
    if _FETCH_VARIANT == "high":
        return high or mid or low
    return mid or high or low


def _build_image_refs_from_mls_data(mls_data: Dict[str, Any]) -> List[Dict[str, str]]:
    refs: List[Dict[str, str]] = []
    seen_display: set[str] = set()
    try:
        data = mls_data.get("data", {})
        if not isinstance(data, dict):
            return refs
        media = data.get("media", {})
        if not isinstance(media, dict):
            return refs

        photos_list = media.get("photosList", [])
        if photos_list:
            logger.info(f"[DEBUG] media keys: {list(media.keys())}")
            logger.info(f"[DEBUG] first photo entry: {photos_list[0] if photos_list else 'empty'}")

        for photo in photos_list:
            if not isinstance(photo, dict):
                continue
            display_url = (
                str(photo.get("highRes") or "").strip()
                or str(photo.get("midRes") or "").strip()
                or str(photo.get("lowRes") or "").strip()
            )
            fetch_url = _preferred_fetch_url(photo).strip()
            if not display_url or not fetch_url:
                continue
            if display_url in seen_display:
                continue
            refs.append({"display_url": display_url, "fetch_url": fetch_url})
            seen_display.add(display_url)

        if not refs:
            primary_url = str(media.get("primaryListingImageUrl") or "").strip()
            if primary_url:
                refs.append({"display_url": primary_url, "fetch_url": primary_url})

        return refs
    except Exception as e:
        logger.error(f"Error extracting image refs from MLS data: {str(e)}")
        return []


def _limit_refs_for_speed(image_refs: List[Dict[str, str]]) -> List[Dict[str, str]]:
    if _MAX_PHOTOS <= 0 or len(image_refs) <= _MAX_PHOTOS:
        return image_refs

    head = max(8, _MAX_PHOTOS // 2)
    tail = max(4, _MAX_PHOTOS - head)
    keep_idx: set[int] = set(range(min(head, len(image_refs))))
    tail_start = max(0, len(image_refs) - tail)
    keep_idx.update(range(tail_start, len(image_refs)))

    if len(keep_idx) < _MAX_PHOTOS:
        remaining = [i for i in range(len(image_refs)) if i not in keep_idx]
        needed = _MAX_PHOTOS - len(keep_idx)
        step = max(1, len(remaining) // max(1, needed))
        keep_idx.update(remaining[::step][:needed])

    limited = [image_refs[i] for i in sorted(keep_idx)]
    logger.info(
        f"[Categorization] Speed cap enabled: selected {len(limited)}/{len(image_refs)} photos (max={_MAX_PHOTOS})"
    )
    return limited


def extract_image_urls_from_mls_data(mls_data: Dict[str, Any]) -> List[str]:
    """
    Extract image URLs from MLS data structure.
    
    Args:
        mls_data: Complete MLS response data
        
    Returns:
        List of image URLs
    """
    try:
        image_urls = [ref["display_url"] for ref in _build_image_refs_from_mls_data(mls_data)]
        logger.info(f"Extracted {len(image_urls)} image URLs from MLS data")
        return image_urls
    except Exception as e:
        logger.error(f"Error extracting image URLs from MLS data: {str(e)}")
        return []


async def perform_categorization(listing_id: str, mls_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Perform image categorization and condition analysis.
    
    Args:
        listing_id: Property listing identifier
        mls_data: MLS data containing image URLs
        
    Returns:
        Categorization results or None if failed
    """
    try:
        started_at = time.perf_counter()
        logger.info(f"Starting categorization for listing {listing_id}")

        image_refs = _build_image_refs_from_mls_data(mls_data)
        if not image_refs:
            logger.warning(f"No images found for listing {listing_id}")
            return {
                "categorized_images": {},
                "condition_analysis": None,
                "statistics": {
                    "total_images": 0,
                    "by_category": {},
                    "message": "No photos available for this listing"
                },
                "summary": "No photos available for categorization",
                "timestamp": datetime.utcnow().isoformat()
            }

        selected_refs = _limit_refs_for_speed(image_refs)
        fetch_urls = [ref["fetch_url"] for ref in selected_refs]

        t_download = time.perf_counter()
        logger.info(
            f"Downloading {len(fetch_urls)} images for listing {listing_id} "
            f"(variant={_FETCH_VARIANT})"
        )
        image_pairs = await fetch_images(fetch_urls)
        logger.info(
            f"[Timing] listing={listing_id} stage=download_images ms="
            f"{int((time.perf_counter() - t_download) * 1000)}"
        )

        if not image_pairs:
            logger.warning(f"Failed to download images for listing {listing_id}")
            return {
                "categorized_images": {},
                "condition_analysis": None,
                "statistics": {
                    "total_images": len(selected_refs),
                    "by_category": {},
                    "message": "Failed to download images"
                },
                "summary": "Image download failed",
                "timestamp": datetime.utcnow().isoformat()
            }

        # Keep high-res display URLs for the UI while fetching smaller URLs for inference.
        valid_pairs = []
        for idx, (_, img) in enumerate(image_pairs):
            if img is None or idx >= len(selected_refs):
                continue
            valid_pairs.append((selected_refs[idx]["display_url"], img))
        logger.info(f"Successfully downloaded {len(valid_pairs)} out of {len(image_pairs)} images")

        if not valid_pairs:
            return {
                "categorized_images": {},
                "condition_analysis": None,
                "statistics": {
                    "total_images": len(image_pairs),
                    "by_category": {},
                    "message": "No valid images downloaded"
                },
                "summary": "No valid images for categorization",
                "timestamp": datetime.utcnow().isoformat()
            }

        # Categorize images by room type
        t_classify = time.perf_counter()
        logger.info(f"Categorizing {len(valid_pairs)} images for listing {listing_id}")
        grouped_images, image_features = categorize_images(
            valid_pairs,
            return_features=True
        )
        logger.info(
            f"[Timing] listing={listing_id} stage=categorize_images ms="
            f"{int((time.perf_counter() - t_classify) * 1000)}"
        )

        # Analyze property conditions
        condition_analysis = None
        try:
            t_conditions = time.perf_counter()
            logger.info(f"Analyzing property conditions for listing {listing_id}")
            
            # Extract listing metadata from MLS data for condition analysis
            listing_meta = extract_listing_metadata(mls_data)
            
            condition_analysis = analyze_property_conditions(
                valid_pairs,
                grouped_images,
                image_features=image_features,
                listing_meta=listing_meta,
            )
            logger.info(
                f"[Timing] listing={listing_id} stage=condition_analysis ms="
                f"{int((time.perf_counter() - t_conditions) * 1000)}"
            )
        except Exception as analysis_error:
            logger.error(f"Condition analysis failed for listing {listing_id}: {str(analysis_error)}")
            condition_analysis = None
        
        # Calculate statistics
        stats = calculate_categorization_statistics(grouped_images, condition_analysis)
        
        # Generate summary
        summary = generate_categorization_summary(grouped_images, condition_analysis, stats)
        
        # Format condition analysis for JSON serialization
        if condition_analysis:
            if hasattr(condition_analysis, 'model_dump'):
                # It's a Pydantic model
                condition_analysis_dict = condition_analysis.model_dump()
            elif isinstance(condition_analysis, dict):
                # It's already a dict
                condition_analysis_dict = condition_analysis
            else:
                # Fallback: try to convert to dict
                condition_analysis_dict = dict(condition_analysis) if condition_analysis else None
        else:
            condition_analysis_dict = None
        
        result = {
            "categorized_images": grouped_images,
            "condition_analysis": condition_analysis_dict,
            "statistics": stats,
            "summary": summary,
            "diagnostics": {
                "fetch_variant": _FETCH_VARIANT,
                "requested_images": len(image_refs),
                "processed_images": len(selected_refs),
            },
            "timestamp": datetime.utcnow().isoformat()
        }

        logger.info(
            f"Categorization completed successfully for listing {listing_id} "
            f"in {int((time.perf_counter() - started_at) * 1000)}ms"
        )
        return result
        
    except Exception as e:
        logger.error(f"Categorization failed for listing {listing_id}: {str(e)}")
        return None


def extract_listing_metadata(mls_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract metadata from MLS data for condition analysis.
    
    Args:
        mls_data: MLS data dictionary
        
    Returns:
        Dictionary with extracted metadata
    """
    try:
        data = mls_data.get('data', {})
        if not isinstance(data, dict):
            return {}
        
        # Extract property information
        property_info = data.get('property', {})
        address_info = data.get('address', {})
        
        return {
            "address": address_info.get('unparsedAddress') or address_info.get('address'),
            "city": address_info.get('city'),
            "state": address_info.get('stateOrProvince'),
            "zip": address_info.get('zipCode'),
            "beds": property_info.get('bedroomsTotal'),
            "baths": property_info.get('bathroomsTotal'),
            "area_sqft": property_info.get('livingArea'),
            "year_built": property_info.get('yearBuilt'),
        }
    except Exception as e:
        logger.error(f"Error extracting listing metadata: {str(e)}")
        return {}


def calculate_categorization_statistics(
    categorized_images: Dict[str, list],
    analysis: Optional[Any]
) -> Dict[str, Any]:
    """
    Calculate categorization statistics.
    
    Args:
        categorized_images: Images grouped by room type
        analysis: Property condition analysis
    
    Returns:
        Dictionary with statistics
    """
    stats = {
        "total_images": sum(len(images) for images in categorized_images.values()),
        "categories_found": len(categorized_images),
        "by_category": {},
    }
    
    # Count images per category
    for category, images in categorized_images.items():
        stats["by_category"][category] = len(images)
    
    # Add condition analysis stats if available
    if analysis:
        # Handle both dict and object
        if isinstance(analysis, dict):
            rooms = analysis.get("rooms", {})
            positive_insights = analysis.get("positive_insights", [])
        else:
            rooms = getattr(analysis, "rooms", {})
            positive_insights = getattr(analysis, "positive_insights", [])
        
        stats["rooms_analyzed"] = len(rooms) if rooms else 0
        stats["positive_insights"] = len(positive_insights) if positive_insights else 0
        
        # Count issues by severity
        issue_counts = {"high": 0, "medium": 0, "low": 0, "opportunity": 0}
        if rooms:
            for room_report in rooms.values():
                # Handle both dict and object for room_report
                if isinstance(room_report, dict):
                    issues = room_report.get("issues", [])
                else:
                    issues = getattr(room_report, "issues", [])
                
                for issue in issues:
                    # Handle both dict and object for issue
                    if isinstance(issue, dict):
                        severity = issue.get("severity", "").lower()
                    else:
                        severity = getattr(issue, "severity", "").lower()
                    
                    if severity in issue_counts:
                        issue_counts[severity] += 1
        stats["issues_by_severity"] = issue_counts
    
    return stats


def generate_categorization_summary(
    categorized_images: Dict[str, list],
    analysis: Optional[Any],
    stats: Dict[str, Any]
) -> str:
    """
    Generate a human-readable summary of the categorization.
    
    Args:
        categorized_images: Images grouped by room type
        analysis: Property condition analysis
        stats: Categorization statistics
    
    Returns:
        Summary text
    """
    parts = []
    
    # Image categorization summary
    total = stats.get("total_images", 0)
    categories = stats.get("categories_found", 0)
    parts.append(f"Analyzed {total} images across {categories} room categories.")
    
    # Top categories
    if categorized_images:
        top_categories = sorted(
            categorized_images.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )[:3]
        top_list = ", ".join(
            f"{cat.replace('_', ' ')} ({len(images)})"
            for cat, images in top_categories
        )
        parts.append(f"Most photographed: {top_list}.")
    
    # Condition analysis summary
    if analysis:
        issues = stats.get("issues_by_severity", {})
        high_issues = issues.get("high", 0)
        medium_issues = issues.get("medium", 0)
        
        if high_issues > 0:
            parts.append(f"⚠️ {high_issues} high-priority items detected.")
        if medium_issues > 0:
            parts.append(f"📋 {medium_issues} medium-priority items to review.")
        
        positive_count = stats.get("positive_insights", 0)
        if positive_count > 0:
            parts.append(f"✨ {positive_count} positive features identified.")
    
    return " ".join(parts) if parts else "Categorization completed."


# @app.route('/api/get_data', methods=['POST'])
# def enhanced_property_data():
#     """
#     Enhanced property data endpoint with categorization.
    
#     Request Body:
#     {
#         "listingId": int,                    # Required
#         "propertyId": int                    # Optional  
#     }
    
#     Response:
#     {
#         # Original fields (MLS data, property details, nearby homes)
#         "data": {...},
#         "property_detail": {...},
#         "nearbyHomes": [...],
#         "listing_id": int,
#         "property_id": int,
        
#         # Categorization field (always included)
#         "categorization": {
#             "categorized_images": {...},
#             "condition_analysis": {...},
#             "statistics": {...},
#             "summary": str,
#             "timestamp": str
#         }
#     }
#     """
#     try:
#         # Log the request
#         logger.info("Enhanced property data request received")
        
#         # Validate request data
#         data = request.json
#         if not data or 'listingId' not in data:
#             return jsonify({"error": "Missing property listingId in request"}), 400

#         listing_id = data['listingId']
#         property_id = data.get('propertyId')  # Optional

#         # Validate parameter types
#         if not isinstance(listing_id, int):
#             return jsonify({"error": "listingId must be an integer"}), 400
#         if property_id is not None and not isinstance(property_id, int):
#             return jsonify({"error": "propertyId must be an integer if provided"}), 400

#         logger.info(f"Processing request for listing {listing_id}, property {property_id}")

#         # Initialize FetchResult for original data fetching
#         property_result = FetchResult(REALESTATE_API_KEY, MLS_SNAPHOMZ_API)

#         # Always fetch MLS data
#         def fetch_mls_data():
#             return property_result.findResult("", listing_id)

#         mls_future = executor.submit(fetch_mls_data)

#         # Conditionally fetch property details if property_id is provided
#         property_detail_future = None
#         if property_id is not None:
#             def fetch_property_detail():
#                 return property_result.get_property_detail(property_id)
#             property_detail_future = executor.submit(fetch_property_detail)

#         # Wait for MLS data
#         mls_data = mls_future.result()

#         if mls_data.get('error'):
#             return jsonify(mls_data), 404 if "not found" in mls_data['error'].lower() else 500

#         # Build the original response structure
#         combined_data = {
#             **mls_data,
#             "listing_id": listing_id
#         }

#         # If property detail was requested, include it
#         if property_detail_future is not None:
#             property_detail = property_detail_future.result()
#             if property_detail.get('error'):
#                 combined_data['warning'] = f"Property detail not available: {property_detail['error']}"
#             else:
#                 combined_data.update({
#                     "property_detail": property_detail,
#                     "property_id": property_id
#                 })

#         # Get nearby homes (original functionality)
#         try:
#             latitude = combined_data["data"]["property"]["latitude"]
#             longitude = combined_data["data"]["property"]["longitude"]
#             nearbyHomes = get_nearby_homes_lat_long(latitude, longitude)
#             combined_data["nearbyHomes"] = nearbyHomes
#         except Exception as e:
#             logger.error(f"Error fetching nearby homes: {str(e)}")
#             combined_data["nearbyHomes"] = []

#         # Always perform categorization
#         logger.info(f"Performing categorization for listing {listing_id}")
        
#         try:
#             # Run categorization in async context
#             loop = asyncio.new_event_loop()
#             asyncio.set_event_loop(loop)
#             try:
#                 categorization_result = loop.run_until_complete(
#                     perform_categorization(str(listing_id), mls_data)
#                 )
#             finally:
#                 loop.close()
            
#             if categorization_result:
#                 combined_data["categorization"] = categorization_result
#                 logger.info(f"Categorization completed successfully for listing {listing_id}")
#             else:
#                 # Categorization failed, but continue with original data
#                 logger.warning(f"Categorization failed for listing {listing_id}, continuing with original data")
#                 combined_data["categorization_warning"] = "Categorization failed but property data is available"
                
#         except Exception as e:
#             logger.error(f"Categorization error for listing {listing_id}: {str(e)}")
#             # Don't fail the entire request if categorization fails
#             combined_data["categorization_warning"] = f"Categorization unavailable: {str(e)}"

#         logger.info(f"Request completed successfully for listing {listing_id}")
#         return jsonify(combined_data)

#     except Exception as e:
#         logger.error(f"Enhanced property data error: {str(e)}")
#         return jsonify({"error": str(e)}), 500


# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=9000)
