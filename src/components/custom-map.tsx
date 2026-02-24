'use client';

import {
  GoogleMap,
  InfoWindow,
  Marker,
  DirectionsRenderer,
  DrawingManager,
  Libraries,
  useJsApiLoader,
} from '@react-google-maps/api';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { googleMapsApiKey, googleMapsMapId } from '@/shared/constants/env';
import SkeletonLoader from './skeleton-loader';
import { formatCurrency } from '@/lib/utils';
import MapPropertyCards from './buy/browse/map-property-card';

type Coordinate = {
  id?: string;
  lat: number;
  lng: number;
  price?: string;
};

type Props = {
  properties?: any[];
  coord?: Coordinate[];
  width?: string;
  height?: string;
  zoom?: number;
  searchQuery?: string;
  showDistricts?: boolean;
  overlayValue?: 'none' | 'schools';
  onOverlayChange?: (value: 'none' | 'schools') => void;
  onMarkerClick?: (id: string) => void;
  onMapMove?: (
    center: google.maps.LatLngLiteral,
    bounds: google.maps.LatLngBounds
  ) => void;
  onDrawFilterChange?: (filteredIds: string[] | null) => void;
};

const DEFAULT_COORD = { lat: 36.778, lng: -119.417 };
const libraries: Libraries = ['places', 'geometry', 'drawing'];

type DistrictFeature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, any>>;

type DistrictPolygonCacheEntry = {
  id: string;
  feature: DistrictFeature;
  polygons: google.maps.Polygon[];
  bounds: google.maps.LatLngBounds[];
};

type PlaceDetailsState = {
  name: string;
  rating?: number;
  total?: number;
  phone?: string;
  website?: string;
  address?: string;
  summary?: string;
  photoUrl?: string;
  openNow?: boolean;
  weeklyHours?: string[];
  position: google.maps.LatLngLiteral;
  isLoading?: boolean;
};

type SearchPlaceDetails = PlaceDetailsState & {
  categoryKey?: string;
};

const CustomMap: React.FC<Props> = ({
  properties = [],
  coord = [],
  width,
  height,
  zoom = 10,
  searchQuery = '',
  showDistricts = false,
  overlayValue = 'none',
  onOverlayChange,
  onMarkerClick,
  onMapMove,
  onDrawFilterChange,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
    language: "en",
    region: "US",
    version: "weekly",
  });

  const [mapInstance, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [measureMode, setMeasureMode] = useState(false);
  const [measureStart, setMeasureStart] = useState<google.maps.LatLngLiteral | null>(null);
  const [measureEnd, setMeasureEnd] = useState<google.maps.LatLngLiteral | null>(null);
  const [measureRoute, setMeasureRoute] = useState<google.maps.DirectionsResult | null>(null);
  const [measureDuration, setMeasureDuration] = useState<string | null>(null);
  const [measureDistance, setMeasureDistance] = useState<string | null>(null);
  const [measureError, setMeasureError] = useState<string | null>(null);
  const [clickedDistrictName, setClickedDistrictName] = useState<string | null>(null);
  const [districtFeatures, setDistrictFeatures] = useState<DistrictFeature[]>([]);
  const [matchedDistricts, setMatchedDistricts] = useState<DistrictFeature[]>([]);
  const [districtsLoadingError, setDistrictsLoadingError] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<PlaceDetailsState | null>(null);
  const [selectedSearchPlace, setSelectedSearchPlace] = useState<SearchPlaceDetails | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreSearchInput, setExploreSearchInput] = useState('');
  const [activeCategoryKeys, setActiveCategoryKeys] = useState<string[]>([]);
  const [exploreFeedback, setExploreFeedback] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [drawPolygon, setDrawPolygon] = useState<google.maps.Polygon | null>(null);
  const [drawFilteredMarkerIds, setDrawFilteredMarkerIds] = useState<string[] | null>(null);
  const featureLayersRef = React.useRef<{
    state?: google.maps.FeatureLayer;
    county?: google.maps.FeatureLayer;
    city?: google.maps.FeatureLayer;
  }>({});
  const schoolMarkersRef = React.useRef<google.maps.Marker[]>([]);
  const schoolDetailsRequestRef = React.useRef(0);
  const searchDetailsRequestRef = React.useRef(0);
  const searchMarkersRef = React.useRef<google.maps.Marker[]>([]);
  const categoryMarkersRef = React.useRef<Record<string, google.maps.Marker[]>>({});
  const searchPlaceBoundsRef = React.useRef<google.maps.LatLngBounds | null>(null);
  const activeCategoryKeysRef = React.useRef<Set<string>>(new Set());
  const categoryRequestIdRef = React.useRef<Record<string, number>>({});
  const searchRequestIdRef = React.useRef(0);
  const measureModeRef = React.useRef(false);
  const measureStartRef = React.useRef<google.maps.LatLngLiteral | null>(null);

  const districtPolygonCacheRef = React.useRef<Map<string, DistrictPolygonCacheEntry>>(new Map());
  const drawPolygonRef = React.useRef<google.maps.Polygon | null>(null);

  const containerStyle = {
    height: height || '100%',
    width: '100%',
    minHeight: '350px',
    // removed minWidth to avoid forcing horizontal overflow / layout jumps
  };

  const resetMeasure = useCallback(() => {
    setMeasureStart(null);
    setMeasureEnd(null);
    setMeasureRoute(null);
    setMeasureDuration(null);
    setMeasureDistance(null);
    setMeasureError(null);
  }, []);

  useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  useEffect(() => {
    measureStartRef.current = measureStart;
  }, [measureStart]);

  useEffect(() => {
    const applyClickable = (marker: google.maps.Marker) => {
      try {
        marker.setOptions({ clickable: !drawMode });
      } catch {
        // no-op for marker instances that are being torn down
      }
    };

    schoolMarkersRef.current.forEach(applyClickable);
    searchMarkersRef.current.forEach(applyClickable);
    Object.values(categoryMarkersRef.current).forEach((group) => group.forEach(applyClickable));
  }, [drawMode]);

  const clearMeasureRouteState = useCallback(() => {
    setMeasureRoute(null);
    setMeasureDuration(null);
    setMeasureDistance(null);
    setMeasureError(null);
  }, []);

  const applyMeasurePointFromMarker = useCallback(
    (
      point: google.maps.LatLngLiteral,
      source: 'listing' | 'poi',
    ) => {
      if (!measureModeRef.current) return;

      if (source === 'listing') {
        setMeasureStart(point);
        setMeasureEnd(null);
        clearMeasureRouteState();
        return;
      }

      if (!measureStartRef.current) {
        clearMeasureRouteState();
        setMeasureStart(point);
        setMeasureEnd(null);
        setMeasureError('Select a listing marker first, then a school/place marker.');
        return;
      }

      setMeasureEnd(point);
      setMeasureError(null);
    },
    [clearMeasureRouteState],
  );

  const centerOnMeasurePoint = useCallback((position: google.maps.LatLngLiteral) => {
    if (!mapInstance) return;
    mapInstance.panTo(position);
  }, [mapInstance]);

  const quickCategories = useMemo(
    () => ({
      restaurants: { label: 'Restaurants', color: '#14b8a6', query: 'restaurants' },
      gyms: { label: 'Gyms', color: '#6366f1', query: 'gyms' },
      // Google Places text search is more reliable with singular "hospital"
      // than plural "hospitals" in some viewports.
      hospitals: { label: 'Hospitals', color: '#2563eb', query: 'hospital' },
      parks: { label: 'Parks', color: '#16a34a', query: 'parks' },
    }),
    [],
  );


  const markers = useMemo(() => {
    const raw = properties.length > 0
      ? properties.map((prop) => ({
        id: prop.id,
        lat: prop.public?.latitude,
        lng: prop.public?.longitude,
        price: prop?.listing?.listPriceLow?.toString() ?? '',
        originalData: prop,
      }))
      : coord.map((c) => ({
        id: c.id ?? '',
        lat: c.lat,
        lng: c.lng,
        price: c.price ?? '',
        originalData: c,
      }));

    // Filter out undefined or invalid lat/lng
    return raw.filter(
      (m) =>
        m.lat !== undefined &&
        m.lng !== undefined &&
        !isNaN(m.lat) &&
        !isNaN(m.lng)
    );
  }, [properties, coord]);

  const computeMarkersInsideDrawPolygon = useCallback(
    (polygon: google.maps.Polygon | null) => {
      if (!polygon || !window.google?.maps?.geometry?.poly) return null;

      const ids: string[] = [];
      for (const marker of markers) {
        const point = new google.maps.LatLng(marker.lat, marker.lng);
        if (google.maps.geometry.poly.containsLocation(point, polygon)) {
          if (marker.id) ids.push(String(marker.id));
        }
      }
      return ids;
    },
    [markers],
  );

  const applyDrawFilterFromPolygon = useCallback(
    (polygon: google.maps.Polygon | null) => {
      if (!polygon) {
        setDrawFilteredMarkerIds(null);
        onDrawFilterChange?.(null);
        return;
      }

      const ids = computeMarkersInsideDrawPolygon(polygon) ?? [];
      setDrawFilteredMarkerIds(ids);
      onDrawFilterChange?.(ids);
    },
    [computeMarkersInsideDrawPolygon, onDrawFilterChange],
  );

  const clearDrawPolygon = useCallback(() => {
    if (drawPolygonRef.current) {
      drawPolygonRef.current.setMap(null);
    }
    drawPolygonRef.current = null;
    setDrawPolygon(null);
    setDrawFilteredMarkerIds(null);
    onDrawFilterChange?.(null);
    setDrawMode(false);
  }, [onDrawFilterChange]);

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    if (drawPolygonRef.current) {
      drawPolygonRef.current.setMap(null);
    }

    polygon.setOptions({
      editable: false,
      draggable: false,
      clickable: false,
      fillColor: '#F57F2E',
      fillOpacity: 0.16,
      strokeColor: '#F57F2E',
      strokeOpacity: 0.95,
      strokeWeight: 2,
      zIndex: 50,
    });

    drawPolygonRef.current = polygon;
    setDrawPolygon(polygon);
    setDrawMode(false);
    applyDrawFilterFromPolygon(polygon);
  }, [applyDrawFilterFromPolygon]);

  useEffect(() => {
    if (!drawPolygonRef.current) return;
    applyDrawFilterFromPolygon(drawPolygonRef.current);
  }, [markers, applyDrawFilterFromPolygon]);

  const visibleMarkers = useMemo(() => {
    if (!drawFilteredMarkerIds) return markers;
    const allowed = new Set(drawFilteredMarkerIds.map(String));
    return markers.filter((m) => m.id && allowed.has(String(m.id)));
  }, [markers, drawFilteredMarkerIds]);

  useEffect(() => {
    if (!selectedMarker || !drawFilteredMarkerIds) return;
    if (!drawFilteredMarkerIds.includes(String(selectedMarker.id))) {
      setSelectedMarker(null);
    }
  }, [drawFilteredMarkerIds, selectedMarker]);

  useEffect(() => {
    return () => {
      if (drawPolygonRef.current) {
        drawPolygonRef.current.setMap(null);
      }
    };
  }, []);

  const recentDataClickRef = React.useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadDistricts = async () => {
      try {
        const response = await fetch('/data/California_School_District_Areas_2024-25.geojson');
        if (!response.ok) throw new Error(`Failed to load districts (${response.status})`);
        const data = await response.json();
        if (!cancelled && data?.features) {
          setDistrictFeatures(data.features as DistrictFeature[]);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load district GeoJSON:', err);
          setDistrictsLoadingError(err?.message ?? 'Failed to load districts');
        }
      }
    };

    loadDistricts();
    return () => {
      cancelled = true;
    };
  }, []);

  const getDistrictId = useCallback((feature: DistrictFeature) => {
    const props = feature.properties || {};
    return (
      props.CDCode ||
      props.CDSCode ||
      props.FedID ||
      props.OBJECTID ||
      `${props.DistrictName ?? 'district'}-${props.CountyName ?? 'county'}`
    );
  }, []);

  const toLatLngLiteral = (coord: number[]) => ({
    lat: coord[1],
    lng: coord[0],
  });

  const buildPolygonPaths = (coords: number[][][]) => {
    return coords.map((ring) => ring.map(toLatLngLiteral));
  };

  const buildPolygonsForFeature = useCallback((feature: DistrictFeature) => {
    const geometry = feature.geometry;
    const polygons: google.maps.Polygon[] = [];
    const bounds: google.maps.LatLngBounds[] = [];

    if (!geometry) return { polygons, bounds };

    if (geometry.type === 'Polygon') {
      const paths = buildPolygonPaths(geometry.coordinates as number[][][]);
      const polygon = new google.maps.Polygon({ paths });
      polygons.push(polygon);

      const polygonBounds = new google.maps.LatLngBounds();
      paths.flat().forEach((pt) => polygonBounds.extend(pt));
      bounds.push(polygonBounds);
    }

    if (geometry.type === 'MultiPolygon') {
      const multi = geometry.coordinates as number[][][][];
      multi.forEach((polyCoords) => {
        const paths = buildPolygonPaths(polyCoords);
        const polygon = new google.maps.Polygon({ paths });
        polygons.push(polygon);

        const polygonBounds = new google.maps.LatLngBounds();
        paths.flat().forEach((pt) => polygonBounds.extend(pt));
        bounds.push(polygonBounds);
      });
    }

    return { polygons, bounds };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstance || districtFeatures.length === 0) return;

    const cache = districtPolygonCacheRef.current;
    districtFeatures.forEach((feature) => {
      const id = getDistrictId(feature);
      if (!cache.has(id)) {
        const { polygons, bounds } = buildPolygonsForFeature(feature);
        cache.set(id, { id, feature, polygons, bounds });
      }
    });

  }, [isLoaded, mapInstance, districtFeatures, getDistrictId, buildPolygonsForFeature]);

  useEffect(() => {
    if (!isLoaded || !mapInstance || markers.length === 0 || districtFeatures.length === 0) return;
    if (!showDistricts) {
      setMatchedDistricts([]);
      return;
    }

    if (!google?.maps?.geometry?.poly?.containsLocation) {
      console.error('[districts] geometry library missing. Check maps loader libraries.');
      return;
    }

    const cache = districtPolygonCacheRef.current;
    const matchedIds = new Set<string>();
    const matched: DistrictFeature[] = [];

    for (const marker of markers) {
      const point = new google.maps.LatLng(marker.lat, marker.lng);

      for (const feature of districtFeatures) {
        const id = getDistrictId(feature);
        const cached = cache.get(id);
        if (!cached) continue;

        let contains = false;
        for (let i = 0; i < cached.polygons.length; i += 1) {
          const polygon = cached.polygons[i];
          const bounds = cached.bounds[i];
          if (bounds && !bounds.contains(point)) continue;

          if (google.maps.geometry.poly.containsLocation(point, polygon)) {
            contains = true;
            break;
          }
        }

        if (contains) {
          if (!matchedIds.has(id)) {
            matchedIds.add(id);
            matched.push(feature);
          }
          break;
        }
      }
    }

    setMatchedDistricts(matched);
  }, [isLoaded, mapInstance, markers, districtFeatures, getDistrictId]);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    mapInstance.data.forEach((feature) => mapInstance.data.remove(feature));

    if (!showDistricts || matchedDistricts.length === 0) return;

    mapInstance.data.addGeoJson({
      type: 'FeatureCollection',
      features: matchedDistricts,
    } as GeoJSON.FeatureCollection);

    mapInstance.data.setStyle({
      fillColor: '#1d4ed8',
      fillOpacity: 0,
      strokeColor: '#1d4ed8',
      strokeWeight: 2,
    });
  }, [isLoaded, mapInstance, matchedDistricts, showDistricts]);

  const createCustomMarker = (price?: string, isSelected?: boolean) => {
    const formattedPrice = formatCurrency(parseFloat(price || '0'));
    const markerFill = isSelected ? '#F07639' : '#2C2C2E';
    // const formattedPrice = "₹8.5L";

    const svg = `
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="0" width="120" height="50" rx="12" ry="12" fill="${markerFill}"/>
  <text x="80" y="30" fill="#FFFFFF" font-size="20" font-family="sans-serif" font-weight="600" text-anchor="middle" alignment-baseline="middle">
    ${formattedPrice}
  </text>
  <polygon points="80,50 72,64 88,64" fill="${markerFill}"/>
</svg>
`;
    const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

    return {
      url: svgUrl,
      scaledSize: new google.maps.Size(80, 70), // Adjust scale as needed
      anchor: new google.maps.Point(40, 64),
    };
  };

  const createCategoryPinIcon = (color: string) => {
    const svg = `
<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M16 41 C16 41 3 27 3 16 C3 8.8 9 3 16 3 C23 3 29 8.8 29 16 C29 27 16 41 16 41 Z" fill="${color}" filter="url(#shadow)"/>
  <circle cx="16" cy="16" r="5" fill="#ffffff"/>
</svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
      scaledSize: new google.maps.Size(28, 38),
      anchor: new google.maps.Point(14, 36),
    };
  };

  const formatWeeklyHours = (weekdayText?: string[]) => {
    if (!weekdayText || weekdayText.length === 0) return undefined;

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShort: Record<string, string> = {
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun',
    };

    const parsed = weekdayText
      .map((line) => {
        const [day, rest] = line.split(': ');
        if (!day || !rest) return null;
        const times = rest.replace(/\u2013|\u2014/g, '-').replace(/\s+/g, ' ').trim();
        if (times.toLowerCase().startsWith('closed')) return null;
        return {
          day,
          short: dayShort[day] ?? day,
          index: dayOrder.indexOf(day),
          times,
        };
      })
      .filter((item): item is { day: string; short: string; index: number; times: string } => !!item)
      .sort((a, b) => a.index - b.index);

    if (parsed.length === 0) return undefined;

    const groups: { start: string; end: string; times: string }[] = [];
    let current = { start: parsed[0].short, end: parsed[0].short, times: parsed[0].times };
    for (let i = 1; i < parsed.length; i += 1) {
      const prev = parsed[i - 1];
      const next = parsed[i];
      const isConsecutive = prev.index + 1 === next.index;
      const sameTimes = next.times === current.times;
      if (isConsecutive && sameTimes) current.end = next.short;
      else {
        groups.push(current);
        current = { start: next.short, end: next.short, times: next.times };
      }
    }
    groups.push(current);

    return groups.map((group) =>
      group.start === group.end ? `${group.start}: ${group.times}` : `${group.start}-${group.end}: ${group.times}`,
    );
  };

  const fetchPlaceDetails = useCallback(
    (
      placeId: string,
      position: google.maps.LatLngLiteral,
      fallback: { name: string; rating?: number; total?: number },
      setState: React.Dispatch<React.SetStateAction<PlaceDetailsState | null>>,
      requestRef: React.MutableRefObject<number>,
    ) => {
      if (!mapInstance) return;
      const currentRequest = ++requestRef.current;
      setState({ ...fallback, position, isLoading: true });

      const service = new google.maps.places.PlacesService(mapInstance);
      service.getDetails(
        {
          placeId,
          fields: [
            'name',
            'rating',
            'user_ratings_total',
            'formatted_phone_number',
            'formatted_address',
            'photos',
            'editorial_summary',
            'opening_hours',
            'website',
          ],
        },
        (place, status) => {
          if (currentRequest !== requestRef.current) return;
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            setState({ ...fallback, position });
            return;
          }

          const placeAny = place as any;
          setState({
            name: place.name ?? fallback.name,
            rating: place.rating ?? fallback.rating,
            total: place.user_ratings_total ?? fallback.total,
            phone: place.formatted_phone_number ?? undefined,
            website: place.website ?? undefined,
            address: place.formatted_address ?? undefined,
            summary: placeAny?.editorial_summary?.overview ?? undefined,
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 480, maxHeight: 300 }),
            openNow: place.opening_hours?.open_now ?? undefined,
            weeklyHours: formatWeeklyHours(place.opening_hours?.weekday_text),
            position,
          });
        },
      );
    },
    [mapInstance],
  );

  useEffect(() => {
    activeCategoryKeysRef.current = new Set(activeCategoryKeys);
  }, [activeCategoryKeys]);

  const clearSearchMarkers = useCallback(() => {
    searchMarkersRef.current.forEach((marker) => marker.setMap(null));
    searchMarkersRef.current = [];
    setSelectedSearchPlace((prev) => (prev?.categoryKey ? prev : null));
  }, []);

  const clearCategoryMarkers = useCallback((categoryKey: string) => {
    const existing = categoryMarkersRef.current[categoryKey] ?? [];
    existing.forEach((marker) => marker.setMap(null));
    categoryMarkersRef.current[categoryKey] = [];
    setSelectedSearchPlace((prev) => (prev?.categoryKey === categoryKey ? null : prev));
  }, []);

  const clearAllCategoryMarkers = useCallback(() => {
    Object.keys(categoryMarkersRef.current).forEach((key) => clearCategoryMarkers(key));
  }, [clearCategoryMarkers]);

  const clearAllExploreMarkers = useCallback(() => {
    clearSearchMarkers();
    clearAllCategoryMarkers();
  }, [clearSearchMarkers, clearAllCategoryMarkers]);

  const attachPlaceMarkerClick = useCallback(
    (
      place: google.maps.places.PlaceResult,
      position: google.maps.LatLngLiteral,
      setState: React.Dispatch<React.SetStateAction<SearchPlaceDetails | null>>,
      categoryKey?: string,
    ) => {
      if (place.place_id) {
        const wrappedSetter = ((value: PlaceDetailsState | null) => {
          setState(value ? { ...value, categoryKey } : value);
        }) as unknown as React.Dispatch<React.SetStateAction<PlaceDetailsState | null>>;
        fetchPlaceDetails(
          place.place_id,
          position,
          {
            name: place.name ?? 'Place',
            rating: place.rating ?? undefined,
            total: place.user_ratings_total ?? undefined,
          },
          wrappedSetter,
          searchDetailsRequestRef,
        );
      } else {
        setState({
          name: place.name ?? 'Place',
          rating: place.rating ?? undefined,
          total: place.user_ratings_total ?? undefined,
          position,
          categoryKey,
        });
      }
    },
    [fetchPlaceDetails],
  );

  const runTextSearch = useCallback(
    (
      query: string,
      opts?: {
        categoryKey?: string;
        iconColor?: string;
        onStoreMarkers?: (markers: google.maps.Marker[]) => void;
        viewportOverride?: google.maps.LatLngBounds | null;
      },
    ) => {
      if (!mapInstance) return;
      const trimmed = query.trim();
      if (!trimmed) return;
      const viewportBounds = opts?.viewportOverride ?? mapInstance.getBounds();
      if (!viewportBounds) return;

      const locationBounds = searchPlaceBoundsRef.current;
      const service = new google.maps.places.PlacesService(mapInstance);
      const results: google.maps.places.PlaceResult[] = [];
      const requestId = opts?.categoryKey
        ? ((categoryRequestIdRef.current[opts.categoryKey] ?? 0) + 1)
        : ++searchRequestIdRef.current;
      if (opts?.categoryKey) categoryRequestIdRef.current[opts.categoryKey] = requestId;

      const handlePage = (
        pageResults: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus,
        pagination: google.maps.places.PlaceSearchPagination | null,
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && pageResults) {
          results.push(...pageResults);
        }

        if (pagination?.hasNextPage) {
          setTimeout(() => pagination.nextPage(), 1500);
          return;
        }

        if (opts?.categoryKey) {
          if (requestId !== categoryRequestIdRef.current[opts.categoryKey]) return;
          if (!activeCategoryKeysRef.current.has(opts.categoryKey)) return;
          clearCategoryMarkers(opts.categoryKey);
        } else if (requestId !== searchRequestIdRef.current) {
          return;
        } else {
          clearSearchMarkers();
        }

        const icon = createCategoryPinIcon(opts?.iconColor ?? '#ef4444');
        const filteredByViewport = results.filter((place) => {
          const location = place.geometry?.location;
          if (!location) return false;
          if (!viewportBounds.contains(location)) return false;
          return true;
        });
        const filtered = filteredByViewport.filter((place) => {
          const location = place.geometry?.location;
          if (!location) return false;
          if (locationBounds && !locationBounds.contains(location)) return false;
          return true;
        });
        const finalFiltered = filtered.length > 0 ? filtered : filteredByViewport;

        const builtMarkers = finalFiltered.map((place) => {
          const loc = place.geometry?.location;
          if (!loc) return null;
          const marker = new google.maps.Marker({
            map: mapInstance,
            position: loc,
            title: place.name ?? 'Place',
            icon,
          });
          marker.addListener('click', () => {
            const position = { lat: loc.lat(), lng: loc.lng() };
            centerOnMeasurePoint(position);
            applyMeasurePointFromMarker(position, 'poi');
            attachPlaceMarkerClick(place, position, setSelectedSearchPlace, opts?.categoryKey);
          });
          return marker;
        }).filter(Boolean) as google.maps.Marker[];

        if (opts?.categoryKey) categoryMarkersRef.current[opts.categoryKey] = builtMarkers;
        else searchMarkersRef.current = builtMarkers;

        if (!opts?.categoryKey) {
          setExploreFeedback(
            builtMarkers.length === 0
              ? 'No places found in the current map view. Try a POI term like coffee, grocery, or park.'
              : null,
          );
        }

        opts?.onStoreMarkers?.(builtMarkers);
      };

      service.textSearch({ query: trimmed, bounds: viewportBounds }, handlePage);
    },
    [applyMeasurePointFromMarker, attachPlaceMarkerClick, centerOnMeasurePoint, clearCategoryMarkers, clearSearchMarkers, mapInstance],
  );


  const extractPlaceQuery = useCallback((rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return '';

    // Try to capture the trailing location phrase after common prepositions.
    const match = trimmed.match(/\b(?:in|near|around|at)\s+(.+)$/i);
    if (match && match[1]) return match[1].trim();

    return trimmed;
  }, []);

  const extractLastLocationPhrase = useCallback((rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return '';
    const tokens = trimmed.split(/\b(?:in|near|around|at)\b/gi);
    if (tokens.length < 2) return trimmed;
    return tokens[tokens.length - 1].trim();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const trimmedQuery = extractPlaceQuery(searchQuery || '');
    const lastLocation = extractLastLocationPhrase(searchQuery || '');
    if (!trimmedQuery) return;

    const service = new google.maps.places.PlacesService(mapInstance);
    const updateSearchBounds = (geometry?: google.maps.places.PlaceGeometry | null) => {
      if (!geometry) {
        searchPlaceBoundsRef.current = null;
        return;
      }
      if (geometry.viewport) {
        searchPlaceBoundsRef.current = geometry.viewport;
        return;
      }
      const location = geometry.location;
      if (location) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(location);
        searchPlaceBoundsRef.current = bounds;
        return;
      }
      searchPlaceBoundsRef.current = null;
    };

    service.findPlaceFromQuery(
      {
        query: trimmedQuery,
        fields: ['place_id', 'name', 'types', 'geometry'],
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
          const place = results[0];
          const types = place.types ?? [];
          const isAdmin =
            types.includes('administrative_area_level_1') ||
            types.includes('administrative_area_level_2') ||
            types.includes('locality') ||
            types.includes('postal_town') ||
            types.includes('sublocality') ||
            types.includes('neighborhood') ||
            types.includes('political');

          if (isAdmin) {
            setSelectedPlaceId(place?.place_id ?? null);
            updateSearchBounds(place?.geometry ?? null);
            return;
          }
        }

        // Fallback to geocoder if Places doesn't return a place id
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: lastLocation || trimmedQuery }, (geoResults, geoStatus) => {
          if (geoStatus !== 'OK' || !geoResults || geoResults.length === 0) {
            console.warn('[place-boundary] place search + geocode failed:', status, geoStatus);
            return;
          }

          setSelectedPlaceId(geoResults[0]?.place_id ?? null);
          updateSearchBounds(geoResults[0]?.geometry ?? null);
        });
      },
    );
  }, [isLoaded, mapInstance, searchQuery, extractPlaceQuery, extractLastLocationPhrase]);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    // Modified by Abhradip Paul showing typescript error
    const stateLayer = mapInstance.getFeatureLayer(
      google.maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_1
    );
    const countyLayer = mapInstance.getFeatureLayer(
      google.maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_2
    );
    const cityLayer = mapInstance.getFeatureLayer(
      google.maps.FeatureType.LOCALITY
    );

    // const stateLayer = mapInstance.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_1');
    // const countyLayer = mapInstance.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_2');
    // const cityLayer = mapInstance.getFeatureLayer('LOCALITY');

    featureLayersRef.current = {
      state: stateLayer,
      county: countyLayer,
      city: cityLayer,
    };

  }, [isLoaded, mapInstance]);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const { state, county, city } = featureLayersRef.current;
    // Modified by Abhradip Paul showing typescript error
    const styleFn = (options: any) => {
      if (options.feature.placeId === selectedPlaceId) {
        return {
          strokeColor: '#0f172a',
          strokeWeight: 3,
          fillColor: '#0f172a',
          fillOpacity: 0.05,
        };
      }
      return null;
    };

    if (state) state.style = styleFn;
    if (county) county.style = styleFn;
    if (city) city.style = styleFn;
  }, [isLoaded, mapInstance, selectedPlaceId]);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const clearSchoolMarkers = () => {
      schoolMarkersRef.current.forEach((marker) => marker.setMap(null));
      schoolMarkersRef.current = [];
      setSelectedSchool(null);
    };

    if (!showDistricts) {
      clearSchoolMarkers();
      return;
    }

    if (matchedDistricts.length === 0) {
      clearSchoolMarkers();
      return;
    }

    let cancelled = false;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const getMatchedEntries = () => {
      const cache = districtPolygonCacheRef.current;
      return matchedDistricts
        .map((feature) => cache.get(getDistrictId(feature)))
        .filter(Boolean) as DistrictPolygonCacheEntry[];
    };

    const collectPlacesForBounds = (bounds: google.maps.LatLngBounds) =>
      new Promise<google.maps.places.PlaceResult[]>((resolve) => {
        const service = new google.maps.places.PlacesService(mapInstance);
        const center = bounds.getCenter();
        const radius = Math.max(
          500,
          google.maps.geometry.spherical.computeDistanceBetween(center, bounds.getNorthEast()),
        );

        const results: google.maps.places.PlaceResult[] = [];

        const handlePage = (
          pageResults: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus,
          pagination: google.maps.places.PlaceSearchPagination | null,
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && pageResults) {
            results.push(...pageResults);
          }

          if (pagination && pagination.hasNextPage) {
            setTimeout(() => pagination.nextPage(), 1500);
            return;
          }

          resolve(results);
        };

        service.nearbySearch(
          {
            location: center,
            radius,
            type: 'school',
          },
          handlePage,
        );
      });

    const run = async () => {
      clearSchoolMarkers();

      const matchedEntries = getMatchedEntries();
      const allBounds = matchedEntries.flatMap((entry) => entry.bounds);
      const polygons = matchedEntries.flatMap((entry) => entry.polygons);

      const allPlaces: google.maps.places.PlaceResult[] = [];
      for (const bounds of allBounds) {
        if (cancelled) return;
        const places = await collectPlacesForBounds(bounds);
        allPlaces.push(...places);
        await delay(250);
      }

      if (cancelled) return;

      const uniqueById = new Map<string, google.maps.places.PlaceResult>();
      for (const place of allPlaces) {
        if (!place.place_id || !place.geometry?.location) continue;
        uniqueById.set(place.place_id, place);
      }

      const filtered = Array.from(uniqueById.values()).filter((place) => {
        const location = place.geometry?.location;
        if (!location) return false;
        return polygons.some((poly) => google.maps.geometry.poly.containsLocation(location, poly));
      });

      const bookIconSvg = `
<svg width="62" height="80" viewBox="0 0 52 66" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="s1" x="-25%" y="-15%" width="150%" height="145%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <path d="M26 64 C26 64 4 44 4 25 C4 13 14 3 26 3 C38 3 48 13 48 25 C48 44 26 64 26 64 Z" fill="#1e1e2e" filter="url(#s1)"/>
  <path d="M10 33 L10 16 C14 14.5 19 13.5 24.5 13 L24.5 30 C19 30.5 14 31.5 10 33 Z" fill="white"/>
  <path d="M42 33 L42 16 C38 14.5 33 13.5 27.5 13 L27.5 30 C33 30.5 38 31.5 42 33 Z" fill="white"/>
  <rect x="24" y="13" width="4" height="18" rx="1.2" fill="white"/>
  <line x1="26" y1="13" x2="26" y2="31" stroke="#1e1e2e" stroke-width="1.2" opacity="0.22"/>
  <line x1="12.5" y1="19.5" x2="22.5" y2="18.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
  <line x1="12.5" y1="22.5" x2="22.5" y2="21.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
  <line x1="12.5" y1="25.5" x2="22.5" y2="24.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
  <line x1="12.5" y1="28.5" x2="22.5" y2="27.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
  <line x1="29.5" y1="18.5" x2="39.5" y2="19.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
  <line x1="29.5" y1="21.5" x2="39.5" y2="22.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
  <line x1="29.5" y1="24.5" x2="39.5" y2="25.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
  <line x1="29.5" y1="27.5" x2="39.5" y2="28.5" stroke="#9ca3af" stroke-width="1.1" stroke-linecap="round"/>
</svg>`;

      const bookIconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(bookIconSvg.trim());

      const markers = filtered.map((place) => {
        const location = place.geometry!.location;
        // Modified by Abhradip Paul showing typescript error
        if (!location?.lat() || !location?.lng()) return;
        const position = { lat: location.lat(), lng: location.lng() };
        const marker = new google.maps.Marker({
          map: mapInstance,
          position,
          title: place.name ?? 'School',
          icon: {
            url: bookIconUrl,
            scaledSize: new google.maps.Size(32, 41),
            anchor: new google.maps.Point(16, 41),
          },
        });

        marker.addListener('click', () => {
          centerOnMeasurePoint(position);
          applyMeasurePointFromMarker(position, 'poi');
          if (place.place_id) {
            fetchPlaceDetails(
              place.place_id,
              position,
              {
                name: place.name ?? 'School',
                rating: place.rating ?? undefined,
                total: place.user_ratings_total ?? undefined,
              },
              setSelectedSchool,
              schoolDetailsRequestRef,
            );
          } else {
            setSelectedSchool({
              name: place.name ?? 'School',
              rating: place.rating ?? undefined,
              total: place.user_ratings_total ?? undefined,
              position,
            });
          }
        });

        return marker;
      });

      // Modified by Abhradip Paul showing typescript error
      (schoolMarkersRef.current as any) = markers;
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, mapInstance, matchedDistricts, showDistricts, getDistrictId, fetchPlaceDetails, applyMeasurePointFromMarker, centerOnMeasurePoint]);

  useEffect(() => {
    if (!showDistricts) {
      setClickedDistrictName(null);
    }
  }, [showDistricts]);

  useEffect(() => {
    if (!isLoaded || !measureStart || !measureEnd) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: measureStart,
        destination: measureEnd,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setMeasureRoute(result);
          const leg = result.routes?.[0]?.legs?.[0];
          setMeasureDuration(leg?.duration?.text || null);
          setMeasureDistance(leg?.distance?.text || null);
          setMeasureError(null);
          return;
        }

        setMeasureRoute(null);
        setMeasureDuration(null);
        setMeasureDistance(null);
        let message = 'Unable to calculate a route for those points.';
        if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
          message = 'No driving route found between those points.';
        } else if (status === google.maps.DirectionsStatus.REQUEST_DENIED) {
          message = 'Directions request denied. Check API key and Directions API enablement.';
        } else if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
          message = 'Request limit exceeded. Please try again in a moment.';
        } else if (status === google.maps.DirectionsStatus.INVALID_REQUEST) {
          message = 'Invalid route request. Try selecting different points.';
        }
        console.warn('DirectionsService error:', status);
        setMeasureError(message);
      },
    );
  }, [isLoaded, measureStart, measureEnd]);

  // Listen on the Data layer directly — the Data layer intercepts feature clicks
  // before the map's onClick fires, so containsLocation on map onClick never triggers.
  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const listener = mapInstance.data.addListener(
      'click',
      (event: google.maps.Data.MouseEvent) => {
        if (!showDistricts) return;
        recentDataClickRef.current = true;
        const name = event.feature.getProperty('DistrictName') as string | null;
        setClickedDistrictName(name ?? null);
        // Reset after the current event tick so the guard only blocks the
        // same-tick map onClick (if it fires), not any future outside clicks.
        setTimeout(() => { recentDataClickRef.current = false; }, 0);
      },
    );

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [isLoaded, mapInstance, showDistricts]);

  // Fires only for map background clicks (outside any Data feature).
  // The recentDataClickRef guard prevents it from clearing a name that was
  // just set by the Data layer click above.
  const handleMapClick = useCallback((event?: google.maps.MapMouseEvent) => {
    if (!recentDataClickRef.current) {
      setClickedDistrictName(null);
    }
    setSelectedSchool(null);
    setSelectedSearchPlace(null);

    if (!measureMode || !event?.latLng) return;

    const point = event.latLng.toJSON();
    if (!measureStart || measureEnd) {
      setMeasureStart(point);
      setMeasureEnd(null);
      setMeasureRoute(null);
      setMeasureDuration(null);
      setMeasureDistance(null);
      setMeasureError(null);
      return;
    }

    setMeasureEnd(point);
  }, [measureMode, measureStart, measureEnd]);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;
    const listener = mapInstance.addListener('click', () => {
      if (recentDataClickRef.current) return;
      setClickedDistrictName(null);
      setSelectedSchool(null);
      setSelectedSearchPlace(null);
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [isLoaded, mapInstance]);

  const centerOnMarker = (position: google.maps.LatLngLiteral) => {
    if (mapInstance) {
      mapInstance.panTo(position);
      mapInstance.setZoom(Math.max(zoom, 21));
    }
  };


  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = () => setMap(null);
  useEffect(() => {
    if (Array.isArray(drawFilteredMarkerIds)) {
      // Keep the user's current viewport after drawing/filtering instead of auto-fitting all markers again.
      return;
    }
    if (mapInstance && markers.length > 0) {
      if (markers.length === 1) {
        const { lat, lng } = markers[0];
        mapInstance.setCenter({ lat, lng });
        mapInstance.setZoom(zoom); // use passed prop
      } else {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
        mapInstance.fitBounds(bounds, 50);
        const { lat, lng } = markers[0];
        mapInstance.setCenter({ lat, lng });
        mapInstance.setZoom(zoom);
      }
    }
  }, [mapInstance, markers, zoom, drawFilteredMarkerIds]);

  const submitExploreSearch = useCallback(() => {
    const query = exploreSearchInput.trim();
    if (!query) {
      searchRequestIdRef.current += 1;
      clearSearchMarkers();
      setExploreFeedback(null);
      return;
    }
    setExploreFeedback(null);
    runTextSearch(query);
  }, [clearSearchMarkers, exploreSearchInput, runTextSearch]);

  const toggleExploreCategory = useCallback((categoryKey: keyof typeof quickCategories) => {
    setActiveCategoryKeys((prev) => {
      const exists = prev.includes(categoryKey);
      if (exists) {
        categoryRequestIdRef.current[categoryKey] = (categoryRequestIdRef.current[categoryKey] ?? 0) + 1;
        activeCategoryKeysRef.current.delete(categoryKey);
        clearCategoryMarkers(categoryKey);
        setExploreFeedback(null);
        return prev.filter((k) => k !== categoryKey);
      }

      const next = [...prev, categoryKey];
      activeCategoryKeysRef.current.add(categoryKey);
      const cfg = quickCategories[categoryKey];
      setExploreFeedback(null);
      runTextSearch(cfg.query, {
        categoryKey,
        iconColor: cfg.color,
      });
      return next;
    });
  }, [clearCategoryMarkers, quickCategories, runTextSearch]);

  useEffect(() => {
    return () => {
      clearAllExploreMarkers();
    };
  }, [clearAllExploreMarkers]);



  return isLoaded ? (
    <div className="relative w-full" style={{ height: containerStyle.height, minHeight: containerStyle.minHeight }}>
      {showDistricts && clickedDistrictName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="rounded-full border border-gray-100 bg-white/95 px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur-sm whitespace-nowrap">
            {clickedDistrictName}
          </div>
        </div>
      )}
      <div className="absolute right-3 top-3 z-20 pointer-events-auto sm:right-4 sm:top-4">
        <div className="w-[200px] rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
              Measure Time
            </span>
            <button
              className={`rounded-full px-2 py-1 text-xs font-semibold ${measureMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => {
                setMeasureMode((prev) => {
                  const next = !prev;
                  if (!next) resetMeasure();
                  return next;
                });
              }}
            >
              {measureMode ? 'On' : 'Off'}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {measureMode ? 'Click a listing marker, then a school/place marker (or click two map points).' : 'Enable to measure travel time.'}
          </div>
          <div className="mt-3 text-xs text-gray-700">
            {measureDuration && measureDistance ? (
              <div>
                <div className="font-semibold">{measureDuration}</div>
                <div className="text-gray-500">{measureDistance}</div>
              </div>
            ) : measureError ? (
              <div className="text-red-500">{measureError}</div>
            ) : (
              <div className="text-gray-400">Select start and end points.</div>
            )}
          </div>
          {measureMode && (measureStart || measureEnd) ? (
            <button
              className="mt-3 w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              onClick={resetMeasure}
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="mt-2 w-[200px] rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
              Draw Area
            </span>
            <button
              className={`rounded-full px-2 py-1 text-xs font-semibold ${drawMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setDrawMode((prev) => !prev)}
            >
              {drawMode ? 'On' : 'Off'}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {drawMode
              ? 'Click to place polygon points, then double-click to finish.'
              : drawFilteredMarkerIds
                ? `${drawFilteredMarkerIds.length} listing${drawFilteredMarkerIds.length === 1 ? '' : 's'} in drawn area.`
                : 'Enable to draw and filter listings on the current map.'}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              onClick={() => {
                clearDrawPolygon();
                setSelectedMarker(null);
              }}
              disabled={!drawPolygon}
            >
              Clear Draw
            </button>
          </div>
        </div>
      </div>
      <div className="absolute left-3 top-3 z-20 pointer-events-auto sm:left-4 sm:top-4">
        <div
          className={`overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 ${exploreOpen ? 'w-[260px] sm:w-[300px]' : 'w-[46px]'}`}
        >
          <button
            type="button"
            aria-label="Explore places"
            className="flex h-[46px] w-full items-center justify-center"
            onClick={() => setExploreOpen((prev) => !prev)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Zm0 2a5 5 0 1 1 0 10a5 5 0 0 1 0-10Z" fill="#6b7280" />
              <path d="M15.8 15.8l3.9 3.9" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {exploreOpen && (
            <div className="border-t border-gray-200 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Explore Places
              </div>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitExploreSearch();
                }}
              >
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={exploreSearchInput}
                    onChange={(e) => setExploreSearchInput(e.target.value)}
                    placeholder="Search places in view"
                    className="block h-10 min-h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 text-sm leading-5 text-gray-900 placeholder:text-gray-400 outline-none ring-0 focus:border-gray-400"
                    style={{ height: 40, minHeight: 40 }}
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 shrink-0 rounded-lg bg-gray-900 px-4 text-xs font-semibold text-white hover:bg-black"
                >
                  Go
                </button>
              </form>

              <div className="mt-2 flex flex-wrap gap-2">
                {onOverlayChange && (
                  <button
                    type="button"
                    onClick={() =>
                      onOverlayChange(overlayValue === 'schools' ? 'none' : 'schools')
                    }
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={{
                      borderColor: overlayValue === 'schools' ? '#1d4ed8' : '#e5e7eb',
                      background: overlayValue === 'schools' ? '#1d4ed8' : '#fff',
                      color: overlayValue === 'schools' ? '#fff' : '#111827',
                    }}
                  >
                    Schools
                  </button>
                )}
                {Object.entries(quickCategories).map(([key, cfg]) => {
                  const active = activeCategoryKeys.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleExploreCategory(key as keyof typeof quickCategories)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{
                        borderColor: active ? cfg.color : '#e5e7eb',
                        background: active ? cfg.color : '#fff',
                        color: active ? '#fff' : '#111827',
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    searchRequestIdRef.current += 1;
                    clearSearchMarkers();
                    setExploreSearchInput('');
                    setExploreFeedback(null);
                  }}
                >
                  Clear Search
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    Object.keys(categoryMarkersRef.current).forEach((key) => {
                      categoryRequestIdRef.current[key] = (categoryRequestIdRef.current[key] ?? 0) + 1;
                    });
                    activeCategoryKeysRef.current = new Set();
                    setActiveCategoryKeys([]);
                    clearAllCategoryMarkers();
                    if (onOverlayChange && overlayValue === 'schools') {
                      onOverlayChange('none');
                    }
                    setExploreFeedback(null);
                  }}
                >
                  Clear Categories
                </button>
              </div>
              {exploreFeedback && (
                <div className="mt-2 rounded-md bg-gray-50 px-2.5 py-2 text-[11px] text-gray-600">
                  {exploreFeedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        mapContainerClassName="snaphomz-map"
        onLoad={onLoad}
        zoom={zoom}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'cooperative',
          draggableCursor: drawMode ? 'crosshair' : undefined,
          mapId: googleMapsMapId,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          styles: [
            {
              featureType: 'administrative',
              elementType: 'geometry',
              stylers: [{ visibility: 'simplified' }],
            },
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {districtsLoadingError ? null : null}
        {drawMode && (
          <DrawingManager
            onPolygonComplete={handlePolygonComplete}
            options={{
              drawingMode: 'polygon' as any,
              drawingControl: false,
              polygonOptions: {
                fillColor: '#F57F2E',
                fillOpacity: 0.16,
                strokeColor: '#F57F2E',
                strokeOpacity: 0.95,
                strokeWeight: 2,
                clickable: false,
                editable: false,
                draggable: false,
                zIndex: 50,
              },
            }}
          />
        )}

        {visibleMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={createCustomMarker(marker.price, marker.id === selectedMarker?.id)}
            options={{ clickable: !drawMode }}
            onClick={() => {
              if (drawMode) return;
              setSelectedMarker(marker);
              centerOnMarker({ lat: marker.lat, lng: marker.lng });
              applyMeasurePointFromMarker({ lat: marker.lat, lng: marker.lng }, 'listing');
              if (marker.id && onMarkerClick) onMarkerClick(marker.id);
            }}
          />
        ))}

        {measureRoute && (
          <DirectionsRenderer
            directions={measureRoute}
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: '#F57F2E',
                strokeOpacity: 0.95,
                strokeWeight: 5,
                zIndex: 999,
              },
            }}
          />
        )}

        {measureStart && (
          <Marker
            position={measureStart}
            draggable
            onDragEnd={(event) => {
              if (!event?.latLng) return;
              setMeasureStart(event.latLng.toJSON());
            }}
            label={{ text: 'A', color: 'white', fontWeight: '700' }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#F57F2E',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )}
        {measureEnd && (
          <Marker
            position={measureEnd}
            draggable
            onDragEnd={(event) => {
              if (!event?.latLng) return;
              setMeasureEnd(event.latLng.toJSON());
            }}
            label={{ text: 'B', color: 'white', fontWeight: '700' }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#0EA5A6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              disableAutoPan: false,
              pixelOffset: new google.maps.Size(0, -44),
              maxWidth: 320,
            }}
          >
            <div
              className='infowindow-content map-info-window w-full max-w-[320px] overflow-hidden bg-black/80 rounded-xl'
            >
              {selectedMarker.originalData?.listing ? (
                <MapPropertyCards
                  {...selectedMarker.originalData}
                  onClose={() => setSelectedMarker(null)}
                />
              ) : (
                <div className="p-4 text-sm text-gray-600">No property details</div>
              )}
            </div>
          </InfoWindow>
        )}
        {selectedSchool && (
          <InfoWindow
            position={selectedSchool.position}
            onCloseClick={() => setSelectedSchool(null)}
            options={{
              disableAutoPan: true,
              pixelOffset: new google.maps.Size(0, -36),
              maxWidth: 320,
            }}
          >
            <div className="snaphomz-info-window w-[240px] overflow-hidden rounded-xl bg-white shadow-xl">
              {selectedSchool.photoUrl ? (
                <img
                  src={selectedSchool.photoUrl}
                  alt={selectedSchool.name}
                  className="h-28 w-full object-cover"
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                  No photo available
                </div>
              )}
              <div className="space-y-1.5 px-3 py-2.5">
                <div className="text-sm font-semibold text-gray-900">{selectedSchool.name}</div>
                <div className="text-xs text-gray-600">
                  {selectedSchool.rating ? (
                    <>
                      <span className="text-amber-500">★</span>{' '}
                      {selectedSchool.rating.toFixed(1)}
                      {selectedSchool.total ? ` (${selectedSchool.total})` : ''}
                    </>
                  ) : (
                    'No ratings yet'
                  )}
                </div>
                {selectedSchool.summary && (
                  <div className="text-[11px] text-gray-600">{selectedSchool.summary}</div>
                )}
                {selectedSchool.address && (
                  <div className="text-[11px] text-gray-500">{selectedSchool.address}</div>
                )}
                {selectedSchool.phone && (
                  <div className="text-[11px] text-gray-500">{selectedSchool.phone}</div>
                )}
                {(selectedSchool.openNow !== undefined || selectedSchool.weeklyHours) && (
                  <div className="space-y-0.5 text-[11px] text-gray-600">
                    {selectedSchool.openNow !== undefined && (
                      <div
                        className={
                          selectedSchool.openNow
                            ? 'font-semibold text-green-600'
                            : 'font-semibold text-red-600'
                        }
                      >
                        {selectedSchool.openNow ? 'Open Now' : 'Closed Now'}
                      </div>
                    )}
                    {selectedSchool.weeklyHours?.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                )}
                {selectedSchool.isLoading && (
                  <div className="text-[11px] text-gray-400">Loading details...</div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
        {selectedSearchPlace && (
          <InfoWindow
            position={selectedSearchPlace.position}
            onCloseClick={() => setSelectedSearchPlace(null)}
            options={{
              disableAutoPan: true,
              pixelOffset: new google.maps.Size(0, -36),
              maxWidth: 320,
            }}
          >
            <div className="snaphomz-info-window w-[240px] overflow-hidden rounded-xl bg-white shadow-xl">
              {selectedSearchPlace.photoUrl ? (
                <img
                  src={selectedSearchPlace.photoUrl}
                  alt={selectedSearchPlace.name}
                  className="h-28 w-full object-cover"
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                  No photo available
                </div>
              )}
              <div className="space-y-1.5 px-3 py-2.5">
                <div className="text-sm font-semibold text-gray-900">{selectedSearchPlace.name}</div>
                <div className="text-xs text-gray-600">
                  {selectedSearchPlace.rating ? (
                    <>
                      <span className="text-amber-500">★</span>{' '}
                      {selectedSearchPlace.rating.toFixed(1)}
                      {selectedSearchPlace.total ? ` (${selectedSearchPlace.total})` : ''}
                    </>
                  ) : (
                    'No ratings yet'
                  )}
                </div>
                {selectedSearchPlace.summary && (
                  <div className="text-[11px] text-gray-600">{selectedSearchPlace.summary}</div>
                )}
                {selectedSearchPlace.address && (
                  <div className="text-[11px] text-gray-500">{selectedSearchPlace.address}</div>
                )}
                {selectedSearchPlace.phone && (
                  <div className="text-[11px] text-gray-500">{selectedSearchPlace.phone}</div>
                )}
                {(selectedSearchPlace.openNow !== undefined || selectedSearchPlace.weeklyHours) && (
                  <div className="space-y-0.5 text-[11px] text-gray-600">
                    {selectedSearchPlace.openNow !== undefined && (
                      <div
                        className={
                          selectedSearchPlace.openNow
                            ? 'font-semibold text-green-600'
                            : 'font-semibold text-red-600'
                        }
                      >
                        {selectedSearchPlace.openNow ? 'Open Now' : 'Closed Now'}
                      </div>
                    )}
                    {selectedSearchPlace.weeklyHours?.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                )}
                {selectedSearchPlace.isLoading && (
                  <div className="text-[11px] text-gray-400">Loading details...</div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : (
    <SkeletonLoader className="h-[350px] w-full bg-gray-400 md:col-span-9" />
  );
};

export default React.memo(CustomMap);
