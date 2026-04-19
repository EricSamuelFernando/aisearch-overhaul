from __future__ import annotations

import os
import re
import time
import threading
from collections import defaultdict
from typing import Callable, Dict, List, Tuple, Optional

import open_clip
import torch
from PIL import Image

# Set cache directory for Lambda/containerized environments
_DEFAULT_HF_CACHE_DIR = os.path.abspath(
    os.getenv("HF_HOME") or os.path.join(os.path.dirname(__file__), "..", ".cache", "huggingface")
)
_HF_CACHE_DIR = os.path.abspath(os.getenv("OPENCLIP_CACHE_DIR", _DEFAULT_HF_CACHE_DIR))
os.makedirs(_HF_CACHE_DIR, exist_ok=True)
os.environ['TRANSFORMERS_CACHE'] = _HF_CACHE_DIR
os.environ['HF_HOME'] = _HF_CACHE_DIR

# Default to a faster OpenCLIP backbone; override from .env when needed.
OPENCLIP_MODEL_NAME = os.getenv("OPENCLIP_MODEL_NAME", "ViT-B-32")
OPENCLIP_PRETRAINED = os.getenv("OPENCLIP_PRETRAINED", "laion2b_s34b_b79k")

# keep CPU threads sane on Windows
torch.set_num_threads(min(8, os.cpu_count() or 8))

DEFAULT_ROOM_DEFINITIONS: List[Tuple[str, str]] = [
    ("exterior", "a high quality real estate listing photo showing the front exterior of a home"),
    ("front_yard_driveway", "a real estate listing photo of a front yard, driveway, or curb appeal landscaping"),
    ("backyard_garden", "a real estate listing photo of a backyard, garden, or outdoor lawn behind a home"),
    ("balcony_patio", "a real estate listing photo of a patio, deck, or balcony with outdoor seating"),
    ("pool", "a real estate listing photo of a home with a swimming pool or spa"),
    ("view", "a real estate listing photo highlighting a scenic view from the property"),
    ("living_room", "a staged real estate listing photo of a living room with sofas or seating"),
    ("family_room", "a real estate listing photo of a family room or den with entertainment furniture"),
    ("dining", "a real estate listing photo of a dining room with a dining table and chairs"),
    ("kitchen", "a real estate listing photo of a kitchen with appliances, cabinetry, and countertops"),
    ("bedroom", "a real estate listing photo of a bedroom with a bed, nightstands, or dressers"),
    ("kids_room", "a real estate listing photo of a kids bedroom or nursery with children's furniture or toys"),
    ("bathroom", "a real estate listing photo of a bathroom with vanity, shower, or bathtub"),
    ("laundry_room", "a real estate listing photo of a laundry room with washer, dryer, and storage"),
    ("home_office", "a real estate listing photo of a home office or study with a desk or computer"),
    ("media_room", "a real estate listing photo of a media room, theater, or entertainment room with a large screen"),
    ("home_gym", "a real estate listing photo of a home gym or exercise room with fitness equipment"),
    ("basement", "a real estate listing photo of a finished basement or recreation room"),
    ("garage", "a real estate listing photo of a garage interior or workshop space"),
    ("hallway", "a real estate listing photo of an interior hallway or corridor"),
    ("staircase", "a real estate listing photo highlighting an interior staircase"),
    ("walk_in_closet", "a real estate listing photo of a walk-in closet with shelving and storage"),
    ("other", "a miscellaneous real estate listing photo that does not match the other categories"),
]

_env_labels = os.getenv("ROOM_LABELS")
if _env_labels:
    seen = set()
    env_labels: List[str] = []
    for raw in _env_labels.split(","):
        label = raw.strip()
        if label and label not in seen:
            env_labels.append(label)
            seen.add(label)
    ROOM_LABELS: List[str] = env_labels or [label for label, _ in DEFAULT_ROOM_DEFINITIONS]
    PROMPTS: List[str] = [
        f"a real estate listing photo of a {label.replace('_', ' ')}"
        for label in ROOM_LABELS
    ]
    if "other" not in seen:
        ROOM_LABELS.append("other")
        PROMPTS.append("a miscellaneous real estate listing photo that does not match the other categories")
else:
    ROOM_LABELS = [label for label, _ in DEFAULT_ROOM_DEFINITIONS]
    PROMPTS = [prompt for _, prompt in DEFAULT_ROOM_DEFINITIONS]

PROMPTS = [p.strip() for p in PROMPTS]
FALLBACK_LABEL = "other" if "other" in ROOM_LABELS else ROOM_LABELS[-1]
OTHER_LABEL = "other"
OTHER_RECOVERY_MARGIN = float(os.getenv("OTHER_RECOVERY_MARGIN", "0.12"))
OTHER_RECOVERY_MIN_CONF = float(os.getenv("OTHER_RECOVERY_MIN_CONF", "0.15"))
OTHER_STRONG_CONF = float(os.getenv("OTHER_STRONG_CONF", "0.42"))
OTHER_LOGIT_PENALTY = float(os.getenv("OTHER_LOGIT_PENALTY", "0.16"))
if OTHER_LABEL in ROOM_LABELS:
    OTHER_LABEL_INDEX = ROOM_LABELS.index(OTHER_LABEL)
else:
    OTHER_LABEL_INDEX = None

CONDITION_SCENARIOS: List[Dict[str, object]] = [
    {
        "key": "water_damage",
        "title": "Possible moisture staining",
        "prompt": "a real estate interior photo that clearly shows water damage, moisture stains, mold, or bubbling paint",
        "severity": "high",
        "category": "repair",
        "threshold": 0.39,
        "min_support_images": 2,
        "description": "Possible moisture staining in the {area}. Recommend checking for plumbing or roof leaks.",
        "recommendation": "Inspect the area for leaks, mold, and ventilation issues.",
        "impact": "Moisture intrusion can rot finishes and framing while encouraging mold growth if left unaddressed.",
        "areas": None,
    },
    {
        "key": "surface_cracking",
        "title": "Cracks or peeling surfaces",
        "prompt": "a home interior photo with visibly cracked drywall, peeling paint, or damaged trim",
        "severity": "medium",
        "category": "potential",
        "threshold": 0.35,
        "description": "Cracking or peeling finishes spotted around the {area}.",
        "recommendation": "Plan for patching, skim coating, and repainting to prevent further deterioration.",
        "impact": "Cracked drywall or peeling paint can spread and may signal movement or humidity issues.",
        "areas": None,
    },
    {
        "key": "flooring_wear",
        "title": "Worn flooring",
        "prompt": "a home photo highlighting worn or damaged flooring, such as scratched hardwood or stained carpet",
        "severity": "medium",
        "category": "potential",
        "threshold": 0.34,
        "description": "Flooring looks worn in the {area}.",
        "recommendation": "Budget for refinishing or replacement to refresh the room.",
        "impact": "Damaged flooring affects daily use and presentation and often needs refinishing or replacement.",
        "areas": None,
    },
    {
        "key": "clutter_damage",
        "title": "Cluttered or dirty surfaces",
        "prompt": "a messy or cluttered real estate listing photo showing maintenance neglect or heavy wear",
        "severity": "low",
        "category": "potential",
        "threshold": 0.34,
        "description": "Clutter or visible grime suggests deferred cleaning in the {area}.",
        "recommendation": "Deep clean and declutter before showings.",
        "impact": "Deferred cleaning can hide wear, create odors, and lowers buyer confidence in overall upkeep.",
        "areas": None,
    },
    {
        "key": "exterior_wear",
        "title": "Exterior wear",
        "prompt": "a home exterior photo with peeling paint, damaged siding, or visible rot",
        "severity": "high",
        "category": "repair",
        "threshold": 0.38,
        "min_support_images": 2,
        "description": "Exterior surfaces show wear in the {area}.",
        "recommendation": "Schedule scraping, repainting, or siding repair.",
        "impact": "Peeling paint or damaged siding leaves materials exposed to moisture and speeds deterioration.",
        "areas": ["exterior", "front_yard_driveway", "backyard_garden", "balcony_patio", "pool", "view"],
    },
    {
        "key": "roof_or_gutter",
        "title": "Roof or gutter wear",
        "prompt": "a property exterior photo that highlights roof damage, missing shingles, or sagging gutters",
        "severity": "high",
        "category": "repair",
        "threshold": 0.40,
        "min_support_images": 2,
        "description": "Roofline or gutter wear is visible near the {area}.",
        "recommendation": "Have a roofer review shingles, flashing, and drainage.",
        "impact": "Roof or gutter failures invite leaks that can damage interiors and structure.",
        "areas": ["exterior", "front_yard_driveway", "backyard_garden", "balcony_patio", "view"],
    },
    {
        "key": "landscape_neglect",
        "title": "Landscape maintenance needed",
        "prompt": "a property exterior photo showing overgrown grass, weeds, or unmaintained landscaping",
        "severity": "low",
        "category": "potential",
        "threshold": 0.35,
        "description": "Landscaping appears overgrown near the {area}.",
        "recommendation": "Plan for trimming, fresh mulch, or reseeding bare spots.",
        "impact": "Overgrown landscaping hurts curb appeal and can trap moisture against the home.",
        "areas": ["exterior", "front_yard_driveway", "backyard_garden", "balcony_patio", "pool"],
    },
    {
        "key": "dated_finishes",
        "title": "Dated finishes (renovation opportunity)",
        "prompt": "an outdated kitchen or bathroom photo with old cabinetry, tile, or fixtures that look ready for renovation",
        "severity": "opportunity",
        "category": "upgrade",
        "threshold": 0.33,
        "description": "Finishes look dated in the {area}, presenting a renovation opportunity.",
        "recommendation": "Consider countertop, cabinet, lighting, or fixture upgrades.",
        "impact": "Dated finishes lower perceived value but present a clear modernization opportunity.",
        "areas": ["kitchen", "bathroom", "laundry_room", "dining"],
    },
]

SCENARIO_BY_KEY: Dict[str, Dict[str, object]] = {
    str(item["key"]): item for item in CONDITION_SCENARIOS
}

POSITIVE_CATEGORY_ORDER = [
    "Windows & Light",
    "Storage",
    "Space & Layout",
    "Condition & Finish",
]

INTERIOR_AREAS = [
    "living_room",
    "family_room",
    "dining",
    "kitchen",
    "bedroom",
    "kids_room",
    "bathroom",
    "laundry_room",
    "home_office",
    "media_room",
    "home_gym",
    "basement",
    "hallway",
    "staircase",
    "walk_in_closet",
    "other",
]

POSITIVE_MIN_IMAGE_COUNT = 2
POSITIVE_SINGLE_IMAGE_THRESHOLD = 0.55
DEFAULT_CONDITION_MARGIN = 0.02
DEFAULT_POSITIVE_MARGIN = 0.015
LOW_CLARITY_MARGIN = 0.05
POSITIVE_AGENT_TEMPLATES = {
    "large_windows": "Sunlit {area_text} keeps the living spaces bright and uplifting.",
    "multi_light_sources": "Layered lighting in {area_text} creates a relaxed, easygoing atmosphere day or night.",
    "built_in_storage": "{area_text} includes tidy built-ins that make everyday living feel effortless.",
    "organized_wardrobe": "Thoughtfully organized storage in {area_text} helps the home stay calm and clutter-free.",
    "open_flow": "{area_text} flow together comfortably so gatherings feel natural and connected.",
    "clear_paths": "Generous walkways around {area_text} keep the layout feeling open and comfortable.",
    "updated_finishes": "Refreshed finishes in {area_text} add a polished feel throughout the home.",
    "consistent_flooring": "Continuous flooring ties {area_text} together with a cohesive, move-in-ready vibe.",
}


def _score_exceeds_threshold(score: float, threshold: float, base_margin: float, is_low_clarity: bool) -> bool:
    margin = base_margin + (LOW_CLARITY_MARGIN if is_low_clarity else 0.0)
    return score >= (threshold + margin)


def _split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [part.strip() for part in parts if part.strip()]


SUMMARY_BANNED_TERMS = {
    "photo",
    "photos",
    "image",
    "images",
    "analysis",
    "insight",
    "insights",
    "condition",
    "conditions",
    "evidence",
    "vibe",
}
SUMMARY_FORBIDDEN_PHRASES = {
    "thoughtfully arranged layout",
    "natural flow throughout the home",
    "appealing opportunity",
    "supports modern living",
    "leans into",
    "way of living",
}
SUMMARY_CATEGORY_STATEMENTS = {
    "Windows & Light": [
        "Interior spaces receive balanced daylight without feeling overstated",
        "Daylight moves evenly through the interiors, keeping glare in check",
    ],
    "Storage": [
        "Storage stays discreet so surfaces remain orderly",
        "Built-in storage keeps the presentation restrained and tidy",
    ],
    "Space & Layout": [
        "Circulation remains even and intuitive from zone to zone",
        "The plan carries a measured flow between living areas",
    ],
    "Condition & Finish": [
        "Finishes read composed and well-edited throughout",
        "Materials stay consistent, lending a composed character",
    ],
}
SUMMARY_GENERAL_STATEMENTS = [
    "Interior spaces remain balanced and composed for everyday life",
    "The plan stays calm, clear, and easy to understand",
    "Daily living moves smoothly without excess detail",
    "Each area maintains a measured sense of scale",
]


def _normalize_sentence(text: str) -> str:
    normalized = text.strip()
    if normalized and normalized[-1] not in ".!?":
        normalized = f"{normalized}."
    return normalized


def _choose_stable_option(options: List[str], seed: str) -> str:
    if not options:
        return ""
    if not seed:
        return options[0]
    total = sum(ord(ch) for ch in seed)
    return options[total % len(options)]


def _format_count(value: object) -> Optional[str]:
    if value in (None, "", [], {}):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if number == int(number):
        return str(int(number))
    return str(round(number, 1)).rstrip("0").rstrip(".")


def _format_count_word(value: object) -> Optional[str]:
    if value in (None, "", [], {}):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if abs(number - int(number)) > 1e-6:
        return str(round(number, 1)).rstrip("0").rstrip(".")
    integer = int(number)
    words = {
        0: "zero",
        1: "one",
        2: "two",
        3: "three",
        4: "four",
        5: "five",
        6: "six",
        7: "seven",
        8: "eight",
        9: "nine",
        10: "ten",
        11: "eleven",
        12: "twelve",
    }
    return words.get(integer, str(integer))


def _format_home_descriptor(meta: Optional[Dict[str, object]]) -> str:
    if not meta:
        return ""
    beds = _format_count_word(meta.get("beds"))
    baths = _format_count_word(meta.get("baths"))
    parts: List[str] = []
    if beds:
        parts.append(f"{beds}-bedroom")
    if baths:
        parts.append(f"{baths}-bath")
    return ", ".join(parts)


def _format_city_state(meta: Optional[Dict[str, object]]) -> str:
    if not meta:
        return ""
    city = str(meta.get("city") or "").strip()
    state = str(meta.get("state") or "").strip()
    if city and state:
        return f"{city}, {state}"
    return city or state


def _format_location_phrase(meta: Optional[Dict[str, object]]) -> str:
    if not meta:
        return ""
    address = str(meta.get("address") or "").strip()
    city_state = _format_city_state(meta)
    if address and city_state:
        return f"{address} in {city_state}"
    if address:
        return address
    if city_state:
        return city_state
    zip_code = str(meta.get("zip") or "").strip()
    return zip_code


def _remove_city_from_address(address: str, meta: Optional[Dict[str, object]]) -> str:
    if not address or not meta:
        return address
    candidates = []
    city = str(meta.get("city") or "").strip()
    state = str(meta.get("state") or "").strip()
    if city and state:
        candidates.append(f"{city}, {state}")
    if city:
        candidates.append(city)
    for needle in candidates:
        lowered = address.lower()
        needle_lower = needle.lower()
        if lowered.endswith(needle_lower):
            trimmed = address[: -len(needle)].rstrip(", ").rstrip()
            address = trimmed
    return address


def _primary_address_line(meta: Optional[Dict[str, object]]) -> str:
    if not meta:
        return ""
    address = str(meta.get("address") or "").strip()
    cleaned = _remove_city_from_address(address, meta)
    return cleaned


def _sanitize_summary_sentence(text: str) -> str:
    candidate = (text or "").strip()
    if not candidate:
        return ""
    lowered = candidate.lower()
    if any(term in lowered for term in SUMMARY_BANNED_TERMS):
        return ""
    if any(phrase in lowered for phrase in SUMMARY_FORBIDDEN_PHRASES):
        return ""
    return candidate


def _build_opening_sentence(listing_meta: Optional[Dict[str, object]]) -> str:
    descriptor = _format_home_descriptor(listing_meta)
    subject = f"this {descriptor} residence" if descriptor else "this residence"
    address = _primary_address_line(listing_meta)
    city_state = _format_city_state(listing_meta)
    if address and city_state:
        prefix = f"Set along {address} in {city_state}, "
    elif address:
        prefix = f"Set along {address}, "
    elif city_state:
        prefix = f"Located in {city_state}, "
    else:
        prefix = "Set within a calm enclave, "
    seed = f"{address}|{city_state}|{descriptor}"
    endings = [
        "offers a calm, balanced setting for daily living",
        "maintains a composed setting suited to everyday life",
        "keeps day-to-day living measured and orderly",
    ]
    ending = _choose_stable_option(endings, seed) or endings[0]
    return f"{prefix}{subject} {ending}."


def _build_interior_sentence(positive_insights: List[Dict[str, object]]) -> str:
    statements: List[str] = []
    seen: set[str] = set()
    for insight in positive_insights:
        category = str(insight.get("category") or "")
        if category in seen:
            continue
        options = SUMMARY_CATEGORY_STATEMENTS.get(category)
        if not options:
            continue
        seed = f"{category}|{len(statements)}"
        phrase = _choose_stable_option(options, seed) or options[0]
        statements.append(phrase)
        seen.add(category)
        if len(statements) >= 2:
            break
    if not statements:
        seed = "general"
        fallback = _choose_stable_option(SUMMARY_GENERAL_STATEMENTS, seed)
        statements = [fallback or SUMMARY_GENERAL_STATEMENTS[0]]
    if len(statements) == 1:
        return f"{statements[0]}."
    return f"{statements[0]}, while {statements[1].lower()}."


def _build_location_sentence(listing_meta: Optional[Dict[str, object]]) -> str:
    city_state = _format_city_state(listing_meta)
    address = _primary_address_line(listing_meta)
    base_seed = f"{city_state}|{address}"
    variants = [
        "The location stays quietly connected to daily essentials while remaining composed",
        "Nearby conveniences are close at hand without disturbing the home's calm focus",
        "Daily necessities remain accessible yet unobtrusive",
        "The surrounding area supports easy routines without calling attention to itself",
    ]
    chosen = _choose_stable_option(variants, base_seed) or variants[0]
    if city_state and chosen[0].isupper():
        lower_fragment = chosen[0].lower() + chosen[1:]
        return f"In {city_state}, {lower_fragment}."
    return f"{chosen}."


def _compose_property_summary(
    positive_insights: List[Dict[str, object]],
    home_story: Optional[str],
    section_buckets: Dict[str, List[Dict[str, object]]],
    listing_meta: Optional[Dict[str, object]] = None,
) -> str:
    sentences = [
        _build_opening_sentence(listing_meta),
        _build_interior_sentence(positive_insights),
        _build_location_sentence(listing_meta),
    ]
    cleaned: List[str] = []
    for sentence in sentences:
        cleaned_sentence = _sanitize_summary_sentence(sentence)
        if cleaned_sentence:
            cleaned.append(_normalize_sentence(cleaned_sentence))
    if len(cleaned) < 2:
        fallback = [
            _normalize_sentence("This home leans into an easygoing daily rhythm."),
            _normalize_sentence("It comes across as calm, confident, and ready for its next chapter."),
        ]
        cleaned = fallback
    return " ".join(cleaned[:3])

POSITIVE_FEATURES: List[Dict[str, object]] = [
    {
        "key": "large_windows",
        "category": "Windows & Light",
        "prompt": "a real estate listing photo highlighting large unobstructed windows filling the room with daylight",
        "threshold": 0.31,
        "description": "Large windows suggest ample natural light in {area}.",
        "story": "Photos hint at bright rooms with sizeable windows.",
        "areas": INTERIOR_AREAS,
    },
    {
        "key": "layered_lighting",
        "category": "Windows & Light",
        "prompt": "a well lit home interior photo featuring multiple light sources such as recessed lights, pendants, and lamps that create balanced illumination",
        "threshold": 0.3,
        "description": "Multiple light sources indicate balanced illumination throughout {area}.",
        "story": "Layered lighting appears to support comfortable illumination.",
        "areas": INTERIOR_AREAS,
    },
    {
        "key": "built_in_storage",
        "category": "Storage",
        "prompt": "a home interior photo showcasing built in cabinets, floor to ceiling cupboards, or wall length shelving that maximizes storage",
        "threshold": 0.3,
        "description": "Built-in cabinetry suggests added storage capacity near {area}.",
        "story": "Built-in storage appears to minimize clutter.",
    },
    {
        "key": "organized_closet",
        "category": "Storage",
        "prompt": "a walk in closet or bedroom dressing area photo with organized shelving, wardrobes, or floor to ceiling closet systems",
        "threshold": 0.31,
        "description": "Organized wardrobes indicate purposeful storage solutions around {area}.",
        "story": "Closet systems look tailored for storage efficiency.",
        "areas": ["bedroom", "walk_in_closet", "kids_room", "hallway"],
    },
    {
        "key": "open_flow",
        "category": "Space & Layout",
        "prompt": "an open concept living space photo showing kitchen, dining, and living zones connected without full walls",
        "threshold": 0.3,
        "description": "Open sight lines around {area} suggest a flexible layout between rooms.",
        "story": "Open layouts seem to support flow between living zones.",
    },
    {
        "key": "clear_walk_paths",
        "category": "Space & Layout",
        "prompt": "a staged interior photo with furniture arranged to leave wide walkways and uncluttered floor space",
        "threshold": 0.3,
        "description": "Clear walking paths around furniture indicate a spacious-feeling layout in {area}.",
        "story": "Furniture placement appears to keep walkways open.",
    },
    {
        "key": "modern_fixtures",
        "category": "Condition & Finish",
        "prompt": "a modern kitchen or bathroom photo with updated fixtures, sleek lighting, or contemporary hardware",
        "threshold": 0.32,
        "description": "Updated fixtures suggest recent refreshes within {area}.",
        "story": "Fixtures appear recently refreshed.",
        "skip_if_high_issue": True,
    },
    {
        "key": "consistent_flooring",
        "category": "Condition & Finish",
        "prompt": "a home interior photo highlighting continuous, well maintained flooring extending across the room",
        "threshold": 0.31,
        "description": "Consistent flooring indicates cohesive upkeep across {area}.",
        "story": "Flooring looks uniform and well cared for.",
        "skip_if_high_issue": True,
    },
]

POSITIVE_SCENARIO_BY_KEY: Dict[str, Dict[str, object]] = {
    str(item["key"]): item for item in POSITIVE_FEATURES
}

SECTION_LABELS = {
    "repair": "High-priority repairs",
    "potential": "Verify-soon issues",
    "upgrade": "Renovation opportunities",
}
SECTION_ORDER = ["repair", "potential", "upgrade"]
_SEVERITY_RANK = {"High": 3, "Medium": 2, "Low": 1}

_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _unwrap_features(features) -> torch.Tensor:
    """Unwrap model output to a plain tensor — handles transformers version differences."""
    if isinstance(features, torch.Tensor):
        return features
    if hasattr(features, "pooler_output") and features.pooler_output is not None:
        return features.pooler_output
    if hasattr(features, "last_hidden_state"):
        return features.last_hidden_state[:, 0]
    raise ValueError(f"Cannot extract tensor from {type(features)}")

_MODEL: torch.nn.Module | None = None
_PROC: Callable[[Image.Image], torch.Tensor] | None = None
_TOKENIZER: Callable[..., torch.Tensor] | None = None
_MODEL_NAME: str | None = None
_MODEL_PRETRAINED: str | None = None
_TEXT_INPUTS: torch.Tensor | None = None  # pre-tokenized prompts on device
_TEXT_EMBEDS: torch.Tensor | None = None
_COND_TEXT_INPUTS: torch.Tensor | None = None  # property condition prompts on device
_COND_TEXT_EMBEDS: torch.Tensor | None = None
_POS_TEXT_INPUTS: torch.Tensor | None = None  # positive insight prompts on device
_POS_TEXT_EMBEDS: torch.Tensor | None = None
_MODEL_LOAD_LOCK = threading.Lock()


@torch.no_grad()
def _lazy_load():
    """Load model/processor once and pre-tokenize text prompts."""
    global _MODEL, _PROC, _TOKENIZER, _TEXT_INPUTS, _TEXT_EMBEDS, _MODEL_NAME, _MODEL_PRETRAINED
    if _MODEL is not None:
        return

    with _MODEL_LOAD_LOCK:
        if _MODEL is not None:
            return

        t_load = time.perf_counter()
        cache_dir = _HF_CACHE_DIR
        model_name = OPENCLIP_MODEL_NAME
        pretrained = OPENCLIP_PRETRAINED
        try:
            _MODEL, _, _PROC = open_clip.create_model_and_transforms(
                model_name=model_name,
                pretrained=pretrained,
                device=_DEVICE,
                cache_dir=cache_dir,
            )
        except Exception as exc:
            # Safe fallback to the previously used heavyweight model.
            print(
                f"[ImageCategorizer] Failed loading {model_name}/{pretrained}: {exc}. "
                "Falling back to ViT-L-14/laion2b_s32b_b82k."
            )
            model_name = "ViT-L-14"
            pretrained = "laion2b_s32b_b82k"
            _MODEL, _, _PROC = open_clip.create_model_and_transforms(
                model_name=model_name,
                pretrained=pretrained,
                device=_DEVICE,
                cache_dir=cache_dir,
            )
        _MODEL = _MODEL.eval()
        _MODEL_NAME = model_name
        _MODEL_PRETRAINED = pretrained
        _TOKENIZER = open_clip.get_tokenizer(model_name)
        print(
            f"[ImageCategorizer] Using OpenCLIP model={model_name} "
            f"pretrained={pretrained} device={_DEVICE.type} cache_dir={cache_dir}"
        )

        assert _TOKENIZER is not None
        _TEXT_INPUTS = _TOKENIZER(PROMPTS).to(_DEVICE)
        text_features = _MODEL.encode_text(_TEXT_INPUTS)
        _TEXT_EMBEDS = text_features / text_features.norm(dim=-1, keepdim=True)
        print(
            "[Timing] stage=load_openclip_model "
            f"ms={int((time.perf_counter() - t_load) * 1000)} "
            f"model={model_name}/{pretrained}"
        )


@torch.no_grad()
def prewarm_openclip_model(include_condition_prompts: bool = True, include_positive_prompts: bool = True) -> Dict[str, object]:
    """
    Preload model + prompt embeddings at startup so first user click is fast.
    Returns lightweight diagnostics for startup logging.
    """
    t0 = time.perf_counter()
    _lazy_load()
    if include_condition_prompts:
        _ensure_condition_text()
    if include_positive_prompts:
        _ensure_positive_text()
    return {
        "ready": _MODEL is not None,
        "device": _DEVICE.type,
        "cache_dir": _HF_CACHE_DIR,
        "model_name": _MODEL_NAME or OPENCLIP_MODEL_NAME,
        "pretrained": _MODEL_PRETRAINED or OPENCLIP_PRETRAINED,
        "load_ms": int((time.perf_counter() - t0) * 1000),
    }


@torch.no_grad()
def _ensure_condition_text():
    global _COND_TEXT_INPUTS, _COND_TEXT_EMBEDS
    if _COND_TEXT_INPUTS is not None and _COND_TEXT_EMBEDS is not None:
        return
    _lazy_load()
    assert _TOKENIZER is not None
    prompts = [str(item["prompt"]) for item in CONDITION_SCENARIOS]
    _COND_TEXT_INPUTS = _TOKENIZER(prompts).to(_DEVICE)
    assert _MODEL is not None
    text_features = _MODEL.encode_text(_COND_TEXT_INPUTS)
    _COND_TEXT_EMBEDS = text_features / text_features.norm(dim=-1, keepdim=True)


@torch.no_grad()
def _ensure_positive_text():
    global _POS_TEXT_INPUTS, _POS_TEXT_EMBEDS
    if _POS_TEXT_INPUTS is not None and _POS_TEXT_EMBEDS is not None:
        return
    _lazy_load()
    assert _TOKENIZER is not None
    prompts = [str(item["prompt"]) for item in POSITIVE_FEATURES]
    _POS_TEXT_INPUTS = _TOKENIZER(prompts).to(_DEVICE)
    assert _MODEL is not None
    text_features = _MODEL.encode_text(_POS_TEXT_INPUTS)
    _POS_TEXT_EMBEDS = text_features / text_features.norm(dim=-1, keepdim=True)


def _batch_to_pixel_values(images: List[Image.Image]) -> torch.Tensor:
    assert _PROC is not None
    return torch.stack([_PROC(image) for image in images]).to(_DEVICE)


@torch.no_grad()
def _predict_probs(img: Image.Image) -> torch.Tensor:
    _lazy_load()
    assert (
        _MODEL is not None
        and _PROC is not None
        and _TEXT_INPUTS is not None
        and _TEXT_EMBEDS is not None
    )

    img = _preprocess_image(img)
    pixel_values = _batch_to_pixel_values([img])
    image_embeds = _encode_pixel_batch(pixel_values)
    logit_scale = _MODEL.logit_scale.exp()
    logits = logit_scale * image_embeds @ _TEXT_EMBEDS.T
    return logits.softmax(dim=-1).squeeze(0)


@torch.no_grad()
def classify_image(img: Image.Image) -> Tuple[str, float, List[float]]:
    """Single-image API (kept for compatibility)."""
    probs = _predict_probs(img)
    conf, idx = torch.max(probs, dim=-1)
    return ROOM_LABELS[idx.item()], float(conf.item()), probs.tolist()


@torch.no_grad()
def classify_image_with_top3(img: Image.Image, top_k: int = 3) -> Dict[str, object]:
    """Single-image API that returns predicted label, confidence, and top-K labels."""
    probs = _predict_probs(img)
    k = max(1, min(int(top_k), len(ROOM_LABELS)))
    top_conf, top_idx = torch.topk(probs, k=k)
    top_predictions = [
        {
            "label": ROOM_LABELS[int(idx.item())],
            "confidence": round(float(conf.item()), 4),
        }
        for conf, idx in zip(top_conf, top_idx)
    ]
    return {
        "predicted_label": top_predictions[0]["label"],
        "confidence": top_predictions[0]["confidence"],
        "top_predictions": top_predictions,
    }


def _preprocess_image(img: Image.Image) -> Image.Image:
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    else:
        img = img.convert("RGB")
    img.thumbnail((768, 768), Image.BICUBIC)
    return img


def _encode_pixel_batch(pixel_values: torch.Tensor) -> torch.Tensor:
    assert _MODEL is not None
    if _DEVICE.type == "cuda":
        with torch.autocast(device_type="cuda", dtype=torch.float16):
            embeds = _MODEL.encode_image(pixel_values)
    else:
        embeds = _MODEL.encode_image(pixel_values)
    embeds = embeds / embeds.norm(dim=-1, keepdim=True)
    return embeds


def _encode_image_pairs(
    pairs: List[Tuple[str, Image.Image]],
    batch_size: int = 16,
) -> Dict[str, torch.Tensor]:
    if not pairs:
        return {}
    _lazy_load()
    assert _PROC is not None
    processed: List[Image.Image] = []
    urls: List[str] = []
    for url, img in pairs:
        processed.append(_preprocess_image(img))
        urls.append(url)

    encoded: Dict[str, torch.Tensor] = {}
    for i in range(0, len(processed), batch_size):
        batch = processed[i:i + batch_size]
        burls = urls[i:i + batch_size]
        pixel_values = _batch_to_pixel_values(batch)
        image_embeds = _encode_pixel_batch(pixel_values)
        for url, feat in zip(burls, image_embeds):
            encoded[url] = feat
    return encoded


@torch.no_grad()
def categorize_images(
    pairs: List[Tuple[str, Image.Image | None]],
    batch_size: int = 16,
    min_conf: float = 0.18,
    return_features: bool = False,
) -> Dict[str, List[Dict]] | Tuple[Dict[str, List[Dict]], Dict[str, torch.Tensor]]:
    """Batched OpenCLIP classification with existing room prompts."""
    _lazy_load()
    assert (
        _MODEL is not None
        and _PROC is not None
        and _TEXT_INPUTS is not None
        and _TEXT_EMBEDS is not None
    )

    url_positions: Dict[str, int] = {}
    urls: List[str] = []
    imgs: List[Image.Image] = []
    for idx, (url, img) in enumerate(pairs):
        if img is None:
            continue
        img = _preprocess_image(img)
        urls.append(url)
        imgs.append(img)
        url_positions[url] = idx

    grouped: Dict[str, List[Dict]] = defaultdict(list)
    if not imgs:
        return ({}, {}) if return_features else {}

    feature_map: Dict[str, torch.Tensor] | None = {} if return_features else None
    logit_scale = _MODEL.logit_scale.exp()

    for i in range(0, len(imgs), batch_size):
        batch = imgs[i:i + batch_size]
        burls = urls[i:i + batch_size]
        pixel_values = _batch_to_pixel_values(batch)

        image_embeds = _encode_pixel_batch(pixel_values)
        if feature_map is not None:
            for url, feat in zip(burls, image_embeds):
                feature_map[url] = feat
        logits = logit_scale * image_embeds @ _TEXT_EMBEDS.T
        if OTHER_LABEL_INDEX is not None and OTHER_LOGIT_PENALTY > 0:
            logits[:, OTHER_LABEL_INDEX] = logits[:, OTHER_LABEL_INDEX] - OTHER_LOGIT_PENALTY
        probs = logits.softmax(dim=-1)

        top_conf, top_idx = probs.max(dim=-1)
        for row, url, conf, idx in zip(probs, burls, top_conf.tolist(), top_idx.tolist()):
            label = ROOM_LABELS[idx]
            final_conf = float(conf)

            # De-bias "other": prefer concrete room labels unless "other" is clearly dominant.
            if OTHER_LABEL_INDEX is not None and idx == OTHER_LABEL_INDEX:
                non_other = row.clone()
                non_other[OTHER_LABEL_INDEX] = -1.0
                alt_conf, alt_idx = torch.max(non_other, dim=-1)
                alt_conf_val = float(alt_conf.item())
                alt_idx_val = int(alt_idx.item())
                should_reassign = False
                if alt_conf_val >= OTHER_RECOVERY_MIN_CONF and final_conf < OTHER_STRONG_CONF:
                    should_reassign = True
                elif (
                    alt_conf_val >= OTHER_RECOVERY_MIN_CONF
                    and (final_conf - alt_conf_val) <= OTHER_RECOVERY_MARGIN
                ):
                    should_reassign = True
                if should_reassign:
                    label = ROOM_LABELS[alt_idx_val]
                    final_conf = alt_conf_val

            if final_conf < min_conf:
                label = FALLBACK_LABEL
            grouped[label].append({
                "url": url,
                "conf": round(final_conf, 4),
                "index": url_positions.get(url),
            })

    filtered = {k: v for k, v in grouped.items() if v}
    if filtered:
        ordered_labels = [label for label in ROOM_LABELS if label != OTHER_LABEL and label in filtered]
        ordered_labels.extend(label for label in filtered if label not in ordered_labels and label != OTHER_LABEL)
        if OTHER_LABEL in filtered:
            ordered_labels.append(OTHER_LABEL)
        filtered = {label: filtered[label] for label in ordered_labels}
    if return_features:
        return filtered, (feature_map or {})
    return filtered


def _normalize_severity_label(value: str) -> str:
    normalized = value.strip().lower()
    if normalized == "high":
        return "High"
    if normalized == "medium":
        return "Medium"
    return "Low"


def _confidence_label(score: float) -> str:
    if score >= 0.42:
        return "High"
    if score >= 0.3:
        return "Medium"
    return "Low"


def _severity_rank(label: str) -> int:
    return _SEVERITY_RANK.get(label, 2)


def _format_room_label(label: str) -> str:
    return label.replace("_", " ").strip().title()


def _format_exec_lines(entries: List[Dict[str, object]], max_items: int = 3) -> List[str]:
    if not entries:
        return ["None observed in the reviewed photos."]
    lines: List[str] = []
    for entry in entries[:max_items]:
        areas = entry.get("areas") or []
        area_text = ", ".join(areas) if areas else "not specified"
        severity = entry.get("severity", "Medium")
        confidence = entry.get("confidence_label", "Medium")
        lines.append(
            f"{entry.get('title')} ({area_text}) - Severity {severity}, {confidence} confidence."
        )
    remaining = len(entries) - max_items
    if remaining > 0:
        lines.append(f"+{remaining} additional item(s) noted.")
    return lines


def _format_area_list(areas: List[str]) -> str:
    if not areas:
        return "the reviewed photos"
    if len(areas) == 1:
        return areas[0]
    return ", ".join(areas[:-1]) + f", and {areas[-1]}"


def _scenario_applies(scenario: Dict[str, object], room: str) -> bool:
    areas: Optional[List[str]] = scenario.get("areas")  # type: ignore
    if not areas:
        return True
    return room in areas


def _append_unique(items: List[str], value: str):
    if value not in items:
        items.append(value)


def _compose_impact_text(base: str, area_label: str, severity: str, title: str) -> str:
    """
    Craft a location-aware explanation of why the specific observation matters.
    Ensures each insight references the visible issue and its contextual impact.
    """
    cleaned = base.strip()
    impact_clause = cleaned if cleaned else f"{title or 'This condition'} can signal deferred maintenance."
    # tie impact to the exact room/area for uniqueness
    area_prefix = f"{title or 'This condition'} in the {area_label}"
    if cleaned:
        normalized = impact_clause[0].lower() + impact_clause[1:] if impact_clause[0].isupper() else impact_clause
        detail_sentence = f"{area_prefix} suggests {normalized}"
    else:
        detail_sentence = f"{area_prefix} may need closer review to understand upkeep needs."

    area_lower = area_label.lower()
    severity_note_map = {
        "High": f"Address it quickly so the {area_lower} stays safe and repair costs stay contained.",
        "Medium": f"Plan follow-up soon to keep the {area_lower} comfortable and market-ready.",
        "Low": f"Monitor this part of the {area_lower} so it doesn't detract from buyer impressions.",
    }
    severity_note = severity_note_map.get(severity, severity_note_map["Low"])
    return f"{detail_sentence.strip()} {severity_note}"


def _positive_scenario_applies(scenario: Dict[str, object], room: str) -> bool:
    areas: Optional[List[str]] = scenario.get("areas")  # type: ignore
    if not areas:
        return True
    return room in areas


def _room_max_severity(room_reports: Dict[str, Dict[str, object]]) -> Dict[str, int]:
    ranking: Dict[str, int] = {}
    for room, report in room_reports.items():
        issues = report.get("issues") or []
        max_rank = 0
        for issue in issues:
            severity = str(issue.get("severity") or "Medium")
            max_rank = max(max_rank, _severity_rank(severity))
        ranking[room] = max_rank
    return ranking


def _compose_home_story(insights: List[Dict[str, object]]) -> Optional[str]:
    if not insights:
        return None

    grouped: Dict[str, List[Dict[str, object]]] = defaultdict(list)
    for item in insights:
        grouped[str(item.get("category") or "General")].append(item)

    sentences: List[str] = []
    for category in POSITIVE_CATEGORY_ORDER:
        items = grouped.get(category)
        if not items:
            continue
        items.sort(
            key=lambda entry: (
                -(entry.get("image_count") or 0),
                -float(entry.get("score") or 0.0),
            )
        )
        top = items[0]
        description = str(top.get("description") or "").strip()
        if description and description[-1] not in ".!?":
            description = f"{description}."
        note = ""
        image_count = top.get("image_count") or 0
        if image_count:
            plural = "photo" if image_count == 1 else "photos"
            note = f" Supported by {image_count} {plural}."
        sentences.append(f"{category}: {description}{note}")
        if len(sentences) >= 3:
            break

    if not sentences:
        return None
    sentences.append("Insights are strictly based on what is visible in the reviewed photos.")
    return " ".join(sentences)


def _format_positive_evidence(image_count: int, room_count: int) -> str:
    segments: List[str] = []
    if image_count:
        photo_word = "photo" if image_count == 1 else "photos"
        segments.append(f"{image_count} {photo_word}")
    if room_count:
        area_word = "area" if room_count == 1 else "areas"
        segments.append(f"{room_count} {area_word}")
    if not segments:
        return ""
    if len(segments) == 1:
        return f"Based on {segments[0]}."
    return f"Based on {segments[0]} covering {segments[1]}."


def _generate_fallback_positive_insights(
    room_reports: Dict[str, Dict[str, object]],
    room_photos: Dict[str, Optional[str]],
) -> Tuple[List[Dict[str, object]], Optional[str]]:
    room_entries = [
        {
            "room": data.get("area") or room,
            "label": data.get("area_label") or _format_room_label(room),
            "has_issue": bool(data.get("issues")),
        }
        for room, data in room_reports.items()
    ]

    clear_rooms = [entry for entry in room_entries if not entry["has_issue"] and entry["label"]]

    grouped_rooms: List[List[Dict[str, object]]] = []
    if clear_rooms:
        grouped_rooms.append(clear_rooms[:4])
        if len(clear_rooms) > 4:
            grouped_rooms.append(clear_rooms[4:8])
    else:
        sample_rooms = [entry for entry in room_entries if entry["label"]] or [
            {"room": "photos", "label": "the reviewed photos", "has_issue": True}
        ]
        grouped_rooms.append(sample_rooms[:3])
        if len(sample_rooms) > 3:
            grouped_rooms.append(sample_rooms[3:6])

    insights: List[Dict[str, object]] = []
    for idx, subset in enumerate(grouped_rooms):
        if not subset:
            continue
        labels = [str(entry["label"]) for entry in subset if entry.get("label")]
        area_text = _format_area_list(labels) if labels else "the reviewed photos"
        sample_pairs = [
            (
                room_photos.get(str(entry.get("room"))),
                str(entry.get("label") or ""),
            )
            for entry in subset
            if room_photos.get(str(entry.get("room")))
        ]
        sample_url = next((url for url, _ in sample_pairs if url), None)
        sample_urls = [url for url, _ in sample_pairs if url]
        sample_images = [
            {
                "url": url,
                "index": None,
                "confidence": None,
                "area_label": label,
            }
            for url, label in sample_pairs
            if url
        ]
        if clear_rooms:
            description = (
                f"No visible concerns in {area_text} suggests these areas appear well maintained in the photos."
            )
            evidence_note = "Based on reviewed photos with no flagged issues."
        else:
            description = (
                f"Photographs of {area_text} show reasonably maintained finishes despite noted variances elsewhere."
            )
            evidence_note = "Derived from overall photo set even though other areas had visible concerns."
        insights.append(
            {
                "key": f"fallback_{idx}",
                "category": "Condition & Finish",
                "description": description,
                "confidence": "Medium",
                "areas": labels or [area_text],
                "sample_url": sample_url,
                "sample_urls": sample_urls or ([sample_url] if sample_url else []),
                "sample_images": sample_images or (
                    [{"url": sample_url, "index": None, "confidence": None}]
                    if sample_url
                    else []
                ),
                "score": 0.32,
                "image_count": None,
                "room_count": len(subset),
                "evidence_note": evidence_note,
            }
        )

    story = _compose_home_story(insights) if insights else None
    return insights, story


def _build_positive_insights(
    hits: List[Dict[str, object]],
    room_reports: Dict[str, Dict[str, object]],
) -> Tuple[List[Dict[str, object]], Optional[str]]:
    if not hits:
        return [], None

    severity_rank = _room_max_severity(room_reports)
    room_issue_flags: Dict[str, bool] = {
        room: bool((data.get("issues") or []))
        for room, data in room_reports.items()
    }
    conflict_urls = {
        issue.get("sample_url")
        for data in room_reports.values()
        for issue in (data.get("issues") or [])
        if issue.get("sample_url")
    }
    conflict_urls.discard(None)

    aggregated: Dict[str, Dict[str, object]] = {}

    for hit in hits:
        key = str(hit["key"])
        scenario = POSITIVE_SCENARIO_BY_KEY.get(key)
        if not scenario:
            continue
        room = str(hit["room"])
        if room_issue_flags.get(room):
            continue
        room_rank = severity_rank.get(room, 0)
        if room_rank >= _SEVERITY_RANK["High"]:
            continue
        if room_rank >= _SEVERITY_RANK["Medium"]:
            continue
        if scenario.get("skip_if_high_issue") and room_rank >= _SEVERITY_RANK["High"]:
            continue

        entry = aggregated.setdefault(
            key,
            {
                "scenario": scenario,
                "supports": [],
            },
        )
        score = float(hit["score"])
        area_label = str(hit["area_label"])
        sample_url = hit.get("sample_url")
        if sample_url and sample_url in conflict_urls:
            continue
        entry["supports"].append(
            {
                "room": room,
                "area_label": area_label,
                "score": score,
                "sample_url": sample_url,
                "sample_index": hit.get("sample_index"),
                "confidence_label": hit.get("confidence_label"),
            }
        )

    insights: List[Dict[str, object]] = []
    for key, payload in aggregated.items():
        scenario = payload["scenario"]
        supports: List[Dict[str, object]] = payload.get("supports", [])  # type: ignore
        if not supports:
            continue
        supports.sort(key=lambda s: -float(s.get("score") or 0.0))
        deduped: List[Dict[str, object]] = []
        seen_urls: set[str] = set()
        for support in supports:
            url = support.get("sample_url")
            identifier = url or f"{support.get('room')}:{support.get('score')}"
            if identifier in seen_urls:
                continue
            seen_urls.add(identifier)
            deduped.append(support)
        if not deduped:
            continue
        evidence = [
            {
                "room": support.get("room"),
                "area": support.get("room"),
                "area_label": support.get("area_label"),
                "sample_url": support.get("sample_url"),
                "sample_index": support.get("sample_index"),
                "score": float(support.get("score") or 0.0),
            }
            for support in deduped
        ]
        image_count = len(deduped)
        max_score = float(deduped[0].get("score") or 0.0)
        confidence_label = _confidence_label(max_score)
        if confidence_label == "Low":
            continue
        if image_count < POSITIVE_MIN_IMAGE_COUNT and max_score < POSITIVE_SINGLE_IMAGE_THRESHOLD:
            continue
        areas = sorted(
            {
                str(support.get("area_label") or "").strip()
                for support in deduped
                if support.get("area_label")
            }
        )
        if not areas:
            continue
        category = str(scenario.get("category") or "")
        description_tpl = str(scenario.get("description") or "").strip()
        area_text = _format_area_list(areas)
        if "{area}" in description_tpl:
            description = description_tpl.format(area=area_text)
        else:
            description = f"{description_tpl} ({area_text})".strip()
        sample_url = next(
            (support.get("sample_url") for support in deduped if support.get("sample_url")),
            None,
        )
        sample_urls = [
            support.get("sample_url")
            for support in deduped
            if support.get("sample_url")
        ]
        sample_urls = [url for url in sample_urls if url]
        room_count = len(areas)
        evidence_note = _format_positive_evidence(image_count, room_count)
        insights.append(
            {
                "key": key,
                "category": category or "General",
                "description": description,
                "confidence": confidence_label,
                "areas": areas,
                "sample_url": sample_url,
                "sample_urls": sample_urls or ([sample_url] if sample_url else []),
                "sample_indices": [
                    entry.get("sample_index")
                    for entry in evidence
                    if entry.get("sample_index") is not None
                ],
                "sample_images": [
                    {
                        "url": entry.get("sample_url"),
                        "index": entry.get("sample_index"),
                        "confidence": entry.get("score"),
                        "area_label": entry.get("area_label"),
                    }
                    for entry in evidence
                    if entry.get("sample_url")
                ],
                "score": round(max_score, 4),
                "image_count": image_count,
                "room_count": room_count,
                "evidence_note": evidence_note,
                "primary_area_label": deduped[0].get("area_label"),
                "evidence": evidence,
            }
        )

    if not insights:
        return [], None

    category_index = {label: idx for idx, label in enumerate(POSITIVE_CATEGORY_ORDER)}
    insights.sort(
        key=lambda item: (
            category_index.get(item.get("category"), len(category_index)),
            -(item.get("image_count") or 0),
            -float(item.get("score") or 0.0),
            item.get("description", ""),
        )
    )
    insights = insights[:6]
    story = _compose_home_story(insights)
    return insights, story


def analyze_property_conditions(
    pairs: List[Tuple[str, Image.Image | None]],
    grouped: Dict[str, List[Dict]],
    image_features: Optional[Dict[str, torch.Tensor]] = None,
    listing_meta: Optional[Dict[str, object]] = None,
    batch_size: int = 12,
) -> Dict[str, object]:
    """
    Uses CLIP similarity against a curated prompt set to pull out visible
    maintenance issues per room. Returns structured data consumed by the UI.
    """
    if not grouped:
        return {}

    _ensure_condition_text()
    _ensure_positive_text()
    _lazy_load()
    assert (
        _MODEL is not None
        and _PROC is not None
        and _COND_TEXT_INPUTS is not None
        and _POS_TEXT_INPUTS is not None
        and _COND_TEXT_EMBEDS is not None
        and _POS_TEXT_EMBEDS is not None
    )

    room_by_url: Dict[str, str] = {}
    url_index: Dict[str, int] = {}
    room_primary_photos: Dict[str, Optional[str]] = {}
    for room, items in grouped.items():
        for entry in items:
            url = entry.get("url")
            if not url:
                continue
            room_by_url[url] = room
            if entry.get("index") is not None:
                url_index[url] = int(entry.get("index"))
            if not room_primary_photos.get(room):
                room_primary_photos[room] = url

    clarity: Dict[str, str] = {}
    encoded_features: Dict[str, torch.Tensor] = dict(image_features or {})
    missing_pairs: List[Tuple[str, Image.Image]] = []
    ordered_urls: List[str] = []

    for url, img in pairs:
        room = room_by_url.get(url)
        if not room:
            continue
        if img is not None:
            width, height = img.size
            clarity[url] = "low" if min(width, height) < 320 else "ok"
            if url not in encoded_features:
                missing_pairs.append((url, img))
        ordered_urls.append(url)

    if missing_pairs:
        encoded_features.update(_encode_image_pairs(missing_pairs, batch_size=batch_size))

    relevant_urls = [url for url in ordered_urls if url in encoded_features]
    if not relevant_urls:
        return {}

    room_reports: Dict[str, Dict[str, object]] = {}
    for room, items in grouped.items():
        report = {
            "area": room,
            "area_label": _format_room_label(room),
            "issues": {},
            "uncertainty": [],
            "summary": "",
        }
        if len(items) < 2:
            _append_unique(
                report["uncertainty"],
                "Only one viewing angle is provided, so the assessment is limited.",
            )
        room_reports[room] = report

    positive_hits: List[Dict[str, object]] = []
    logit_scale = _MODEL.logit_scale.exp()
    cond_text = _COND_TEXT_EMBEDS
    pos_text = _POS_TEXT_EMBEDS

    for url in relevant_urls:
        embed = encoded_features.get(url)
        if embed is None:
            continue
        room = room_by_url.get(url)
        if not room:
            continue
        report = room_reports[room]
        is_low_clarity = clarity.get(url) == "low"
        if is_low_clarity:
            _append_unique(
                report["uncertainty"],
                "One of the photos is low resolution, so fine detail may be missing.",
            )
        issue_store: Dict[str, Dict[str, object]] = report["issues"]  # type: ignore

        cond_logits = logit_scale * torch.matmul(
            embed.unsqueeze(0), cond_text.T
        ).squeeze(0)
        cond_probs = cond_logits.softmax(dim=-1)

        for s_idx, scenario in enumerate(CONDITION_SCENARIOS):
            if not _scenario_applies(scenario, room):
                continue
            score = float(cond_probs[s_idx].item())
            threshold = float(scenario.get("threshold", 0.26))
            base_margin = float(scenario.get("min_margin", DEFAULT_CONDITION_MARGIN))
            if not _score_exceeds_threshold(score, threshold, base_margin, is_low_clarity):
                continue
            key = str(scenario["key"])
            sample_index = url_index.get(url)
            area_label = _format_room_label(room)  # Define area_label early
            prev = issue_store.get(key)
            existing_samples: List[str] = list(prev.get("sample_urls") or []) if prev else []
            existing_images: List[Dict[str, object]] = list(prev.get("sample_images") or []) if prev else []
            if url and url not in existing_samples:
                existing_samples.append(url)
            if url and not any(img.get("url") == url for img in existing_images):
                image_entry: Dict[str, object] = {
                    "url": url,
                    "confidence": round(score, 4),
                    "area_label": area_label,
                }
                if sample_index is not None:
                    image_entry["index"] = sample_index
                existing_images.append(image_entry)
            if prev and prev["confidence"] >= score:
                prev["sample_urls"] = existing_samples
                prev["sample_images"] = existing_images
                if url and not prev.get("sample_url"):
                    prev["sample_url"] = url
                if sample_index is not None and prev.get("sample_index") is None:
                    prev["sample_index"] = sample_index
                continue
            severity_label = _normalize_severity_label(str(scenario.get("severity", "medium")))
            category = str(scenario.get("category") or "potential")
            confidence_label = _confidence_label(score)
            # area_label already defined above
            impact_text = _compose_impact_text(
                str(scenario.get("impact") or ""),
                area_label,
                severity_label,
                str(scenario.get("title") or "Condition"),
            )
            primary_sample = url or (existing_samples[0] if existing_samples else None)
            issue_store[key] = {
                "issue": key,
                "title": scenario["title"],
                "description": str(scenario["description"]).format(
                    area=area_label
                ),
                "severity": severity_label,
                "category": category,
                "sample_url": primary_sample,
                "sample_index": sample_index if url else None,
                "confidence": round(score, 4),
                "confidence_label": confidence_label,
                "recommendation": scenario.get("recommendation"),
                "impact": impact_text,
            }
            issue_store[key]["sample_urls"] = existing_samples or ([url] if url else [])
            if existing_images:
                issue_store[key]["sample_images"] = existing_images
            elif url:
                entry_data = {
                    "url": url,
                    "confidence": round(score, 4),
                    "area_label": area_label,
                }
                if sample_index is not None:
                    entry_data["index"] = sample_index
                issue_store[key]["sample_images"] = [entry_data]

        area_label = report["area_label"]
        if clarity.get(url) == "low":
            continue

        pos_logits = logit_scale * torch.matmul(
            embed.unsqueeze(0), pos_text.T
        ).squeeze(0)
        pos_probs = pos_logits.softmax(dim=-1)

        for s_idx, scenario in enumerate(POSITIVE_FEATURES):
            if not _positive_scenario_applies(scenario, room):
                continue
            score = float(pos_probs[s_idx].item())
            threshold = float(scenario.get("threshold", 0.3))
            base_margin = float(scenario.get("min_margin", DEFAULT_POSITIVE_MARGIN))
            if not _score_exceeds_threshold(score, threshold, base_margin, False):
                continue
            confidence_label = _confidence_label(score)
            if confidence_label == "Low":
                continue
            positive_hits.append(
                {
                    "key": scenario["key"],
                    "room": room,
                    "area_label": area_label,
                    "score": round(score, 4),
                    "confidence_label": confidence_label,
                    "sample_url": url,
                    "sample_index": url_index.get(url),
                }
            )

    summaries: List[str] = []
    aggregated_issues: Dict[str, Dict[str, object]] = {}
    for room, report in room_reports.items():
        issue_store: Dict[str, Dict[str, object]] = report["issues"]  # type: ignore
        issues = sorted(
            issue_store.values(),
            key=lambda x: (-float(x["confidence"]), x["issue"]),
        )
        report["issues"] = issues
        friendly = report["area_label"]
        if issues:
            sentences = [
                f"{issue['title']} ({issue['confidence_label']} confidence)"
                for issue in issues
            ]
            report["summary"] = "Issues noted: " + "; ".join(sentences)
            summaries.append(f"{friendly}: {sentences[0]}")
            for issue in issues:
                key = issue["issue"]
                group = aggregated_issues.get(key)
                if not group:
                    group = {
                        "issue": key,
                        "title": issue["title"],
                        "severity": issue["severity"],
                        "confidence": float(issue["confidence"]),
                        "confidence_label": issue["confidence_label"],
                        "category": issue.get("category", "potential"),
                        "impact": issue.get("impact"),
                        "recommendation": issue.get("recommendation"),
                        "sample_url": issue.get("sample_url"),
                        "sample_urls": [],
                        "sample_images": [],
                        "areas": set(),
                    }
                    aggregated_issues[key] = group
                areas = group["areas"]  # type: ignore
                areas.add(friendly)
                samples = group["sample_urls"]  # type: ignore
                for sample in issue.get("sample_urls") or []:
                    if sample and sample not in samples:
                        samples.append(sample)
                images = group.setdefault("sample_images", [])  # type: ignore
                for img in issue.get("sample_images") or []:
                    if not img or not img.get("url"):
                        continue
                    if not any(existing.get("url") == img.get("url") for existing in images):
                        images.append(dict(img))
                if float(issue["confidence"]) > float(group["confidence"]):
                    group["confidence"] = float(issue["confidence"])
                    group["confidence_label"] = issue["confidence_label"]
                    if issue.get("sample_url"):
                        group["sample_url"] = issue.get("sample_url")
        else:
            if report["uncertainty"]:
                report["summary"] = (
                    "No obvious defects are visible, but visibility is limited: "
                    + report["uncertainty"][0]
                )
            else:
                report["summary"] = (
                    "No visible defects or maintenance concerns detected in the provided photo."
                )
                summaries.append(f"{friendly}: no visible defects in shown photo")

    section_buckets: Dict[str, List[Dict[str, object]]] = {key: [] for key in SECTION_ORDER}
    for entry in aggregated_issues.values():
        areas = sorted(entry.get("areas", []))  # type: ignore
        category = str(entry.get("category") or "potential")
        if category not in SECTION_LABELS:
            category = "potential"
        sample_images = [
            img
            for img in entry.get("sample_images", [])
            if isinstance(img, dict) and img.get("url")
        ]
        sample_images.sort(key=lambda img: -(float(img.get("confidence") or 0.0)))
        if not sample_images:
            continue
        scenario_cfg = SCENARIO_BY_KEY.get(str(entry.get("issue") or ""), {})
        min_support_images = int(scenario_cfg.get("min_support_images", 1))
        if len(sample_images) < min_support_images:
            continue
        payload = {
            "issue": entry["issue"],
            "title": entry["title"],
            "areas": areas,
            "severity": entry["severity"],
            "confidence": float(entry["confidence"]),
            "confidence_label": entry["confidence_label"],
            "impact": entry.get("impact"),
            "recommendation": entry.get("recommendation"),
            "sample_url": entry.get("sample_url"),
            "sample_urls": entry.get("sample_urls", []),
            "sample_images": sample_images,
            "category": category,
        }
        section_buckets.setdefault(category, []).append(payload)

    for bucket in section_buckets.values():
        bucket.sort(
            key=lambda x: (
                -_severity_rank(str(x.get("severity", "Medium"))),
                -float(x.get("confidence", 0.0)),
                str(x.get("title", "")),
            )
        )

    insight_cards: List[Dict[str, object]] = []
    seen_steps: List[str] = []
    for key in SECTION_ORDER:
        for entry in section_buckets.get(key, []):
            areas = entry.get("areas", [])
            area_text = _format_area_list(areas)
            what = f"{entry['title']} observed in {area_text}."
            why = entry.get("impact") or "May influence buyer confidence and upkeep costs if ignored."
            next_step = entry.get("recommendation") or "Consider consulting a qualified professional for confirmation."
            card = {
                "issue": entry["issue"],
                "title": entry["title"],
                "category": key,
                "category_label": "Renovation Opportunity" if key == "upgrade" else None,
                "severity": entry["severity"],
                "confidence": entry["confidence_label"],
                "what": what,
                "why": why,
                "next_step": next_step,
                "areas": areas,
                "sample_url": entry.get("sample_url"),
                "sample_urls": entry.get("sample_urls", []),
                "sample_images": entry.get("sample_images", []),
            }
            insight_cards.append(card)
            if next_step not in seen_steps:
                seen_steps.append(next_step)

    summary_blocks = []
    for key in SECTION_ORDER:
        entries = section_buckets.get(key, [])
        summary_blocks.append({"label": SECTION_LABELS[key], "items": _format_exec_lines(entries)})

    rooms_without_concerns = [
        data["area_label"]
        for data in room_reports.values()
        if not data["issues"]
    ]
    if rooms_without_concerns:
        no_concern_line = [
            f"No visible concerns in {_format_area_list(rooms_without_concerns)}."
        ]
    else:
        no_concern_line = ["Visible concerns were noted in the reviewed rooms."]
    summary_blocks.append({"label": "No visible concerns", "items": no_concern_line})

    overall_snapshot: List[Dict[str, str]] = []
    if section_buckets["repair"]:
        top = section_buckets["repair"][0]
        overall_snapshot.append({
            "icon": "🔴",
            "text": f"Immediate attention recommended for {top['title'].lower()} observed in {_format_area_list(top.get('areas', []))}."
        })
    if section_buckets["potential"]:
        top = section_buckets["potential"][0]
        overall_snapshot.append({
            "icon": "🟠",
            "text": f"Several spaces show {top['title'].lower()} that should be verified during inspection."
        })
    if section_buckets["upgrade"]:
        top = section_buckets["upgrade"][0]
        overall_snapshot.append({
            "icon": "🟡",
            "text": f"{_format_area_list(top.get('areas', []))} show {top['title'].lower()} presenting renovation opportunities."
        })
    info_line = "Findings are based on visible surfaces only and do not indicate confirmed structural issues."
    overall_snapshot.append({"icon": "ℹ️", "text": info_line})

    overall = " | ".join(
        f"{block['label']}: {block['items'][0]}"
        for block in summary_blocks
        if block["items"]
    )
    if not overall:
        overall = "No clear issues detected in the analyzed photos. Assessment is limited to what is shown."

    limitations_defaults = [
        "Insights are based only on visible areas in the provided photos and do not replace a professional inspection."
    ]
    limitation_set = set()
    for report in room_reports.values():
        for note in report.get("uncertainty", []):
            if note:
                limitation_set.add(f"{report['area_label']}: {note}")
        report["uncertainty"] = []
    limitations = list(limitations_defaults)
    for note in sorted(limitation_set):
        if note not in limitations:
            limitations.append(note)

    suggested_steps = seen_steps[:4] if seen_steps else [
        "Continue monitoring new photos and consider a professional inspection before making decisions."
    ]

    room_sections = []
    for room, data in room_reports.items():
        issues = data["issues"]
        if issues:
            headline = f"{len(issues)} item(s) flagged."
            details = [
                {
                    "title": issue["title"],
                    "severity": issue["severity"],
                    "confidence": issue["confidence_label"],
                    "confidence_label": issue["confidence_label"],
                    "why": issue.get("impact") or "Cosmetic wear affecting appearance and future maintenance.",
                    "summary": issue.get("description"),
                    "recommendation": issue.get("recommendation"),
                    "sample_url": issue.get("sample_url"),
                    "sample_urls": issue.get("sample_urls"),
                    "sample_images": issue.get("sample_images"),
                }
                for issue in issues
            ]
        else:
            headline = "No visible concerns found."
            details = []
        room_sections.append(
            {
                "area": data["area"],
                "title": data["area_label"],
                "headline": headline,
                "summary": data["summary"],
                "issue_count": len(issues),
                "high_priority_count": sum(1 for issue in issues if issue["severity"] == "High"),
                "issues": details,
            }
        )
    room_sections.sort(key=lambda x: ROOM_LABELS.index(x["area"]) if x["area"] in ROOM_LABELS else len(ROOM_LABELS))

    positive_insights, home_story = _build_positive_insights(positive_hits, room_reports)
    if not positive_insights:
        fallback_insights, fallback_story = _generate_fallback_positive_insights(room_reports, room_primary_photos)
        positive_insights = fallback_insights
        if not home_story:
            home_story = fallback_story

    property_summary = _compose_property_summary(
        positive_insights,
        home_story,
        section_buckets,
        listing_meta=listing_meta,
    )

    return {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "summary": overall,
        "overall_snapshot": overall_snapshot,
        "executive_summary": summary_blocks,
        "insights": insight_cards,
        "insight_sections": [
            {
                "key": key,
                "title": SECTION_LABELS[key],
                "items": [card for card in insight_cards if card["category"] == key],
            }
            for key in SECTION_ORDER
        ],
        "room_sections": room_sections,
        "limitations": limitations,
        "next_steps": suggested_steps,
        "rooms": {
            room: {
                "area": data["area"],
                "area_label": data["area_label"],
                "summary": data["summary"],
                "issues": data["issues"],
                "uncertainty": data["uncertainty"],
            }
            for room, data in room_reports.items()
        },
        "positive_insights": positive_insights,
        "home_story": home_story,
        "property_summary": property_summary,
    }
