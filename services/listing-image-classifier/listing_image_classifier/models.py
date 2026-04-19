from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Optional

class ListingCard(BaseModel):
    id: str
    address: Optional[str] = None
    city: Optional[str] = None
    price: Optional[float | int] = None
    beds: Optional[int] = None
    baths: Optional[float | int] = None
    thumb: Optional[str] = None

class ListingCards(BaseModel):
    results: List[ListingCard]


class ConditionIssue(BaseModel):
    issue: str
    title: str
    description: str
    severity: str
    sample_url: Optional[str] = None
    sample_urls: Optional[List[str]] = None
    sample_images: Optional[List[Dict[str, object]]] = None
    sample_index: Optional[int] = None
    confidence: float
    confidence_label: str
    recommendation: Optional[str] = None


class RoomConditionReport(BaseModel):
    area: str
    area_label: str
    summary: str
    issues: List[ConditionIssue]
    uncertainty: List[str]


class PositiveInsight(BaseModel):
    category: str
    description: str
    confidence: str
    areas: Optional[List[str]] = None
    sample_url: Optional[str] = None
    sample_urls: Optional[List[str]] = None
    sample_indices: Optional[List[int]] = None
    sample_images: Optional[List[Dict[str, object]]] = None
    score: Optional[float] = None
    image_count: Optional[int] = None
    room_count: Optional[int] = None
    evidence_note: Optional[str] = None
    primary_area_label: Optional[str] = None
    evidence: Optional[List[Dict[str, object]]] = None


class ConditionAnalysis(BaseModel):
    model_config = ConfigDict(extra="allow")
    generated_at: Optional[str] = None
    summary: str
    rooms: Dict[str, RoomConditionReport]
    positive_insights: Optional[List[PositiveInsight]] = None
    home_story: Optional[str] = None
    property_summary: Optional[str] = None


class CategorizedImages(BaseModel):
    images: Dict[str, List[dict]]  # {room_type: [{url, conf}]}
    analysis: Optional[ConditionAnalysis] = None

class ListingDetail(BaseModel):
    id: str
    url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    price: Optional[float | int] = None
    beds: Optional[int] = None
    baths: Optional[float | int] = None
    area_sqft: Optional[int] = None
    year_built: Optional[str] = None
    remarks: Optional[str] = None
    photos: Optional[List[str]] = None
