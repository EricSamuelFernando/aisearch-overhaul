'use client';

import {
  GoogleMap,
  InfoWindow,
  Marker,
  DirectionsRenderer,
  Libraries,
  useJsApiLoader,
} from '@react-google-maps/api';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { googleMapsApiKey, googleMapsMapId } from '@/shared/constants/env';
import SkeletonLoader from './skeleton-loader';
import { cn, formatCurrency } from '@/lib/utils';

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
  onMeasureStateChange?: (state: {
    active: boolean;
    duration: string | null;
    distance: string | null;
    error: string | null;
  }) => void;
  clearDrawSignal?: number;
  useOverlayResultsRail?: boolean;
  hideControls?: boolean;
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
  placeId?: string;
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

type ListingMarker = {
  id?: string;
  markerKey: string;
  lat: number;
  lng: number;
  price: string;
  originalData: any;
};

const toMarkerKey = (
  id: string | number | undefined,
  lat: number,
  lng: number,
  index: number,
) => `${id ?? 'no-id'}:${lat.toFixed(6)}:${lng.toFixed(6)}:${index}`;

const resolveListingId = (item: any): string | undefined => {
  const raw =
    item?.id ??
    item?.listingId ??
    item?.listing_id ??
    item?.listing?.id ??
    item?.listing?.listingId ??
    item?.mlsId ??
    item?.mls_id ??
    item?.propertyId;
  if (raw === undefined || raw === null || raw === '') return undefined;
  return String(raw);
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
  onMeasureStateChange,
  clearDrawSignal = 0,
  useOverlayResultsRail = false,
  hideControls = false,
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
  const [currentMapZoom, setCurrentMapZoom] = useState<number>(zoom);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [hoveredMarker, setHoveredMarker] = useState<any>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
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
  const [activeToolPanel, setActiveToolPanel] = useState<'measure' | 'draw' | 'explore' | null>(null);
  const [exploreSearchInput, setExploreSearchInput] = useState('');
  const [activeCategoryKeys, setActiveCategoryKeys] = useState<string[]>([]);
  const [exploreFeedback, setExploreFeedback] = useState<string | null>(null);
  const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [drawPolygon, setDrawPolygon] = useState<google.maps.Polygon | null>(null);
  const [drawFilteredMarkerIds, setDrawFilteredMarkerIds] = useState<string[] | null>(null);
  const shouldHideControls = hideControls && isTouchDevice;
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
  const selectedSearchPlaceRef = React.useRef<SearchPlaceDetails | null>(null);
  const selectedSchoolRef = React.useRef<PlaceDetailsState | null>(null);
  const userMovedMapRef = React.useRef(false);
  const lastAutoFitQueryRef = React.useRef<string | null>(null);
  const suppressNextOnIdleRef = React.useRef(false);

  const districtPolygonCacheRef = React.useRef<Map<string, DistrictPolygonCacheEntry>>(new Map());
  const drawPolygonRef = React.useRef<google.maps.Polygon | null>(null);
  const lastDrawFilterIdsRef = React.useRef<string[] | null>(null);
  const freehandDrawingActiveRef = React.useRef(false);
  const mobileTapDrawPointsRef = React.useRef<google.maps.LatLngLiteral[]>([]);
  const projectionOverlayRef = React.useRef<google.maps.OverlayView | null>(null);
  const touchDrawPointerActiveRef = React.useRef(false);
  const controlsDockRef = React.useRef<HTMLDivElement | null>(null);

  // Always-current refs so callbacks can have stable identities (empty/minimal deps)
  // without stale-closure bugs. Updated inline on every render.
  const onDrawFilterChangeRef = React.useRef(onDrawFilterChange);
  onDrawFilterChangeRef.current = onDrawFilterChange;
  const freehandPathRef = React.useRef<google.maps.LatLngLiteral[]>([]);
  const freehandPreviewLineRef = React.useRef<google.maps.Polyline | null>(null);

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

  const adjustMapZoom = useCallback(
    (delta: number) => {
      if (!mapInstance) return;
      const currentZoom = mapInstance.getZoom() ?? zoom;
      const nextZoom = Math.max(3, Math.min(21, currentZoom + delta));
      mapInstance.setZoom(nextZoom);
    },
    [mapInstance, zoom],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(hover: none), (pointer: coarse)');
    const sync = () => setIsTouchDevice(media.matches);
    sync();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync);
      return () => media.removeEventListener('change', sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  useEffect(() => {
    onMeasureStateChange?.({
      active: measureMode,
      duration: measureDuration,
      distance: measureDistance,
      error: measureError,
    });
  }, [measureMode, measureDuration, measureDistance, measureError, onMeasureStateChange]);

  useEffect(() => {
    measureStartRef.current = measureStart;
  }, [measureStart]);

  useEffect(() => {
    selectedSearchPlaceRef.current = selectedSearchPlace;
  }, [selectedSearchPlace]);

  useEffect(() => {
    selectedSchoolRef.current = selectedSchool;
  }, [selectedSchool]);

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

  const hasActiveDrawPolygon = !!drawPolygon || !!drawPolygonRef.current;

  const isPointInsideActiveDrawPolygon = useCallback(
    (
      point:
        | google.maps.LatLng
        | google.maps.LatLngLiteral
        | null
        | undefined,
    ) => {
      const activePolygon = drawPolygonRef.current ?? drawPolygon;
      if (!activePolygon || !window.google?.maps?.geometry?.poly) return true;
      if (!point) return false;

      const latLng =
        typeof (point as google.maps.LatLng).lat === 'function'
          ? (point as google.maps.LatLng)
          : new google.maps.LatLng(
            (point as google.maps.LatLngLiteral).lat,
            (point as google.maps.LatLngLiteral).lng,
          );

      return google.maps.geometry.poly.containsLocation(latLng, activePolygon);
    },
    [drawPolygon],
  );

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

  const schoolCategoryColor = '#B22148';
  const closeLocationTooltips = useCallback(() => {
    setClickedDistrictName(null);
    setSelectedSchool(null);
    setSelectedSearchPlace(null);
  }, []);

  const quickCategories = useMemo(
    () => ({
      restaurants: { label: 'Restaurants', color: '#00A96E', query: 'restaurants' },
      gyms: { label: 'Gyms', color: '#FF383C', query: 'gyms' },
      // Google Places text search is more reliable with singular "hospital"
      // than plural "hospitals" in some viewports.
      hospitals: { label: 'Hospitals', color: '#2563eb', query: 'hospital' },
      parks: { label: 'Parks', color: '#16a34a', query: 'parks' },
    }),
    [],
  );


  const markers = useMemo<ListingMarker[]>(() => {
    const usePropertiesSource = useOverlayResultsRail ? true : properties.length > 0;
    const raw: ListingMarker[] = usePropertiesSource
      ? properties.map((prop, index) => ({
        id: resolveListingId(prop),
        markerKey: toMarkerKey(
          resolveListingId(prop),
          Number(prop.public?.latitude ?? prop.latitude),
          Number(prop.public?.longitude ?? prop.longitude),
          index,
        ),
        lat: prop.public?.latitude ?? prop.latitude,
        lng: prop.public?.longitude ?? prop.longitude,
        price: prop?.listing?.listPriceLow?.toString() ?? prop?.listPrice?.toString() ?? prop?.price?.toString() ?? '',
        originalData: prop,
      }))
      : coord.map((c, index) => ({
        id: c?.id !== undefined && c?.id !== null ? String(c.id) : undefined,
        markerKey: toMarkerKey(c?.id, Number(c.lat), Number(c.lng), index),
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
  }, [properties, coord, useOverlayResultsRail]);

  const computeMarkersInsideDrawPolygon = useCallback(
    (polygon: google.maps.Polygon | null) => {
      if (!polygon || !window.google?.maps?.geometry?.poly) return null;

      const propertyIds = new Set<string>();
      for (const marker of markers) {
        const point = new google.maps.LatLng(marker.lat, marker.lng);
        if (google.maps.geometry.poly.containsLocation(point, polygon)) {
          if (marker.id) propertyIds.add(String(marker.id));
        }
      }
      return { propertyIds: Array.from(propertyIds) };
    },
    [markers],
  );

  const applyDrawFilterFromPolygon = useCallback(
    (polygon: google.maps.Polygon | null) => {
      if (!polygon) {
        setDrawFilteredMarkerIds(null);
        if (lastDrawFilterIdsRef.current !== null) {
          lastDrawFilterIdsRef.current = null;
          onDrawFilterChangeRef.current?.(null);
        }
        return;
      }

      const filtered = computeMarkersInsideDrawPolygon(polygon);
      const ids = filtered?.propertyIds ?? [];
      setDrawFilteredMarkerIds(ids);

      // Only notify parent when IDs actually changed — prevents infinite re-render loop
      // where onDrawFilterChange → parent re-render → new markers → this effect fires again
      const prev = lastDrawFilterIdsRef.current;
      const changed =
        prev === null ||
        prev.length !== ids.length ||
        ids.some((id, i) => id !== prev[i]);
      if (changed) {
        lastDrawFilterIdsRef.current = ids;
        onDrawFilterChangeRef.current?.(ids);
      }
    },
    // onDrawFilterChange intentionally omitted — accessed via ref to keep this callback stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [computeMarkersInsideDrawPolygon],
  );

  const clearDrawPolygon = useCallback(() => {
    freehandDrawingActiveRef.current = false;
    freehandPathRef.current = [];
    mobileTapDrawPointsRef.current = [];
    if (freehandPreviewLineRef.current) {
      freehandPreviewLineRef.current.setMap(null);
      freehandPreviewLineRef.current = null;
    }
    if (drawPolygonRef.current) {
      drawPolygonRef.current.setMap(null);
    }
    drawPolygonRef.current = null;
    lastDrawFilterIdsRef.current = null;
    setDrawPolygon(null);
    setDrawFilteredMarkerIds(null);
    onDrawFilterChangeRef.current?.(null);
    setDrawMode(false);
    // onDrawFilterChange accessed via ref → empty deps → stable reference.
    // This is critical: the clearDrawSignal effect depends on clearDrawPolygon, and if
    // clearDrawPolygon were recreated on every parent render (because onDrawFilterChange is
    // an inline prop), the effect would fire on every render after clearDrawSignal is set,
    // repeatedly cancelling any active draw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = () => { };
    overlay.draw = () => { };
    overlay.onRemove = () => { };
    overlay.setMap(mapInstance);
    projectionOverlayRef.current = overlay;
    return () => {
      if (projectionOverlayRef.current === overlay) {
        projectionOverlayRef.current = null;
      }
      overlay.setMap(null);
    };
  }, [isLoaded, mapInstance]);

  const finalizeMobileTapDraw = useCallback(() => {
    if (!isTouchDevice || !drawMode) return;
    const path = [...mobileTapDrawPointsRef.current];
    mobileTapDrawPointsRef.current = [];
    if (freehandPreviewLineRef.current) {
      freehandPreviewLineRef.current.setMap(null);
      freehandPreviewLineRef.current = null;
    }

    if (!mapInstance || path.length < 3) {
      setDrawMode(false);
      return;
    }

    const polygon = new google.maps.Polygon({
      paths: path,
      map: mapInstance,
    });
    handlePolygonCompleteRef.current(polygon);
  }, [isTouchDevice, drawMode, mapInstance]);

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    freehandDrawingActiveRef.current = false;
    freehandPathRef.current = [];
    if (freehandPreviewLineRef.current) {
      freehandPreviewLineRef.current.setMap(null);
      freehandPreviewLineRef.current = null;
    }

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

  // Always-current ref so the draw-mode effect can call the latest handlePolygonComplete
  // without listing it as a dependency (which would cause the effect to re-run — and
  // reset freehandDrawingActiveRef — whenever markers change during an active draw).
  const handlePolygonCompleteRef = React.useRef(handlePolygonComplete);
  handlePolygonCompleteRef.current = handlePolygonComplete;

  const mapClientToLatLng = useCallback(
    (clientX: number, clientY: number): google.maps.LatLngLiteral | null => {
      if (!mapInstance) return null;
      const overlay = projectionOverlayRef.current;
      const projection = overlay?.getProjection?.();
      if (!projection) return null;
      const rect = mapInstance.getDiv()?.getBoundingClientRect?.();
      if (!rect) return null;
      const pixelPoint = new google.maps.Point(clientX - rect.left, clientY - rect.top);
      const latLng = projection.fromContainerPixelToLatLng(pixelPoint);
      return latLng ? latLng.toJSON() : null;
    },
    [mapInstance],
  );

  const pushTouchFreehandPoint = useCallback((point: google.maps.LatLngLiteral) => {
    if (!mapInstance) return;
    const path = freehandPathRef.current;
    const last = path[path.length - 1];
    if (last && google?.maps?.geometry?.spherical) {
      const dist = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(last.lat, last.lng),
        new google.maps.LatLng(point.lat, point.lng),
      );
      if (dist < 6) return;
    }
    path.push(point);
    if (!freehandPreviewLineRef.current) {
      freehandPreviewLineRef.current = new google.maps.Polyline({
        map: mapInstance,
        path,
        clickable: false,
        strokeColor: '#F57F2E',
        strokeOpacity: 0.95,
        strokeWeight: 2,
        zIndex: 50,
      });
      return;
    }
    freehandPreviewLineRef.current.setPath(path);
  }, [mapInstance]);

  const finalizeTouchFreehand = useCallback(() => {
    if (!freehandDrawingActiveRef.current) return;
    freehandDrawingActiveRef.current = false;
    const path = [...freehandPathRef.current];
    freehandPathRef.current = [];
    if (freehandPreviewLineRef.current) {
      freehandPreviewLineRef.current.setMap(null);
      freehandPreviewLineRef.current = null;
    }
    if (!mapInstance || path.length < 3) return;
    const polygon = new google.maps.Polygon({
      paths: path,
      map: mapInstance,
    });
    handlePolygonCompleteRef.current(polygon);
  }, [mapInstance]);

  const handleTouchDrawPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isTouchDevice || !drawMode) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const point = mapClientToLatLng(event.clientX, event.clientY);
      if (!point) return;
      event.preventDefault();
      touchDrawPointerActiveRef.current = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // ignore pointer capture errors
      }
      freehandDrawingActiveRef.current = true;
      freehandPathRef.current = [];
      if (freehandPreviewLineRef.current) {
        freehandPreviewLineRef.current.setMap(null);
        freehandPreviewLineRef.current = null;
      }
      pushTouchFreehandPoint(point);
    },
    [isTouchDevice, drawMode, mapClientToLatLng, pushTouchFreehandPoint],
  );

  const handleTouchDrawPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!touchDrawPointerActiveRef.current || !drawMode) return;
      const point = mapClientToLatLng(event.clientX, event.clientY);
      if (!point) return;
      event.preventDefault();
      pushTouchFreehandPoint(point);
    },
    [drawMode, mapClientToLatLng, pushTouchFreehandPoint],
  );

  const handleTouchDrawPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!touchDrawPointerActiveRef.current) return;
      touchDrawPointerActiveRef.current = false;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // ignore pointer capture errors
      }
      finalizeTouchFreehand();
    },
    [finalizeTouchFreehand],
  );

  useEffect(() => {
    if (drawMode) return;
    touchDrawPointerActiveRef.current = false;
    freehandDrawingActiveRef.current = false;
    freehandPathRef.current = [];
    mobileTapDrawPointsRef.current = [];
    if (freehandPreviewLineRef.current) {
      freehandPreviewLineRef.current.setMap(null);
      freehandPreviewLineRef.current = null;
    }

    // Google Maps sometimes keeps the crosshair cursor after drawing finishes.
    // Reset cursors explicitly so the UI does not look like draw mode is still active.
    try {
      mapInstance?.setOptions({
        draggableCursor: 'grab',
        draggingCursor: 'grabbing',
      });
    } catch {
      // no-op
    }
  }, [drawMode, mapInstance]);

  useEffect(() => {
    if (!mapInstance) return;
    try {
      mapInstance.setOptions({
        draggableCursor: drawMode ? 'crosshair' : 'grab',
        draggingCursor: drawMode ? 'crosshair' : 'grabbing',
      });
    } catch {
      // no-op
    }
  }, [drawMode, mapInstance]);

  useEffect(() => {
    if (!isLoaded || !mapInstance || !drawMode) return;

    const listeners: google.maps.MapsEventListener[] = [];

    const minPointDistanceMeters = 10;

    const startFreehand = (point: google.maps.LatLngLiteral) => {
      freehandDrawingActiveRef.current = true;
      freehandPathRef.current = [];

      if (freehandPreviewLineRef.current) {
        freehandPreviewLineRef.current.setMap(null);
        freehandPreviewLineRef.current = null;
      }

      pushPoint(point);
    };

    const pushPoint = (point: google.maps.LatLngLiteral) => {
      const path = freehandPathRef.current;
      const last = path[path.length - 1];
      if (last && google?.maps?.geometry?.spherical) {
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(last.lat, last.lng),
          new google.maps.LatLng(point.lat, point.lng),
        );
        if (dist < minPointDistanceMeters) return;
      }

      path.push(point);

      if (!freehandPreviewLineRef.current) {
        freehandPreviewLineRef.current = new google.maps.Polyline({
          map: mapInstance,
          path,
          clickable: false,
          strokeColor: '#F57F2E',
          strokeOpacity: 0.95,
          strokeWeight: 2,
          zIndex: 50,
        });
        return;
      }

      freehandPreviewLineRef.current.setPath(path);
    };

    const finalizeFreehandPolygon = () => {
      if (!freehandDrawingActiveRef.current) return;
      freehandDrawingActiveRef.current = false;

      const path = [...freehandPathRef.current];
      freehandPathRef.current = [];

      if (freehandPreviewLineRef.current) {
        freehandPreviewLineRef.current.setMap(null);
        freehandPreviewLineRef.current = null;
      }

      if (path.length < 3) {
        return;
      }

      const polygon = new google.maps.Polygon({
        paths: path,
        map: mapInstance,
      });

      handlePolygonCompleteRef.current(polygon);
    };

    listeners.push(
      mapInstance.addListener('mousedown', (event: google.maps.MapMouseEvent) => {
        if (!drawMode || !event?.latLng) return;
        startFreehand(event.latLng.toJSON());
      }),
    );

    listeners.push(
      mapInstance.addListener('mousemove', (event: google.maps.MapMouseEvent) => {
        if (!drawMode || !event?.latLng) return;
        if (!freehandDrawingActiveRef.current) {
          const domEvent = event.domEvent as MouseEvent | undefined;
          const leftButtonHeld =
            !!domEvent &&
            (typeof domEvent.buttons === 'number'
              ? (domEvent.buttons & 1) === 1
              : domEvent.button === 0);

          if (!leftButtonHeld) return;
          startFreehand(event.latLng.toJSON());
          return;
        }

        pushPoint(event.latLng.toJSON());
      }),
    );

    listeners.push(
      mapInstance.addListener('mousemove', (event: google.maps.MapMouseEvent) => {
        if (!drawMode || !freehandDrawingActiveRef.current || !event?.latLng) return;
        pushPoint(event.latLng.toJSON());
      }),
    );

    listeners.push(
      mapInstance.addListener('mouseup', () => {
        finalizeFreehandPolygon();
      }),
    );

    const handleWindowMouseUp = () => {
      finalizeFreehandPolygon();
    };
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      listeners.forEach((listener) => google.maps.event.removeListener(listener));
      window.removeEventListener('mouseup', handleWindowMouseUp);
      freehandDrawingActiveRef.current = false;
      freehandPathRef.current = [];
      mobileTapDrawPointsRef.current = [];
      if (freehandPreviewLineRef.current) {
        freehandPreviewLineRef.current.setMap(null);
        freehandPreviewLineRef.current = null;
      }
    };
    // handlePolygonComplete intentionally omitted from deps — accessed via ref so the effect
    // doesn't re-run (and reset freehandDrawingActiveRef) when markers change mid-draw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, mapInstance, drawMode]);

  useEffect(() => {
    if (!drawPolygonRef.current) return;
    applyDrawFilterFromPolygon(drawPolygonRef.current);
  }, [markers, applyDrawFilterFromPolygon]);

  useEffect(() => {
    if (!clearDrawSignal) return;
    clearDrawPolygon();
  }, [clearDrawSignal, clearDrawPolygon]);

  const markerVisibilityMap = useMemo(() => {
    const activePolygon = drawPolygonRef.current ?? drawPolygon;
    if (!activePolygon || !window.google?.maps?.geometry?.poly) return null;
    const visibility = new Map<string, boolean>();
    for (const marker of markers) {
      const point = new google.maps.LatLng(marker.lat, marker.lng);
      visibility.set(
        marker.markerKey,
        google.maps.geometry.poly.containsLocation(point, activePolygon),
      );
    }
    return visibility;
  }, [markers, drawPolygon]);

  useEffect(() => {
    const activePolygon = drawPolygonRef.current ?? drawPolygon;
    if (!selectedMarker || !activePolygon || !window.google?.maps?.geometry?.poly) return;
    const point = new google.maps.LatLng(selectedMarker.lat, selectedMarker.lng);
    const stillInside = google.maps.geometry.poly.containsLocation(point, activePolygon);
    if (!stillInside) {
      setSelectedMarker(null);
    }
  }, [drawPolygon, selectedMarker]);

  useEffect(() => {
    return () => {
      if (freehandPreviewLineRef.current) {
        freehandPreviewLineRef.current.setMap(null);
      }
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

  const formatMarkerPriceCompact = (value?: number) => {
    if (!Number.isFinite(value as number) || !value || value <= 0) return '$0';
    const n = value as number;

    if (n >= 1_000_000) {
      const millions = n / 1_000_000;
      return `$${millions >= 10 ? Math.round(millions) : millions.toFixed(1).replace(/\\.0$/, '')}M`;
    }

    if (n >= 1_000) {
      const thousands = n / 1_000;
      return `$${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1).replace(/\\.0$/, '')}k`;
    }

    return formatCurrency(n);
  };

  const createDotMarker = (isSelected?: boolean) => {
    const markerFill = isSelected ? '#F07639' : '#2C2C2E';
    const svg = `
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="8" fill="${markerFill}" stroke="#FFFFFF" stroke-width="3" />
</svg>
`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
      scaledSize: new google.maps.Size(16, 16),
      anchor: new google.maps.Point(8, 8),
    };
  };

  const createCustomMarker = (price?: string, isSelected?: boolean, isHovered?: boolean) => {
    const isActive = Boolean(isSelected || isHovered);
    if (currentMapZoom <= 11 && !isActive) {
      return createDotMarker(isActive);
    }

    const formattedPrice = formatMarkerPriceCompact(parseFloat(price || '0'));
    const approxCharWidth = isActive ? 10.2 : 9.8;
    const horizontalPadding = isActive ? 30 : 26;
    const minBubbleWidth = isActive ? 84 : 76;
    const maxBubbleWidth = isActive ? 138 : 124;
    const bubbleWidth = Math.max(
      minBubbleWidth,
      Math.min(maxBubbleWidth, Math.round(formattedPrice.length * approxCharWidth + horizontalPadding))
    );

    const svgWidth = bubbleWidth + 24;
    const svgHeight = 58;
    const rectX = Math.round((svgWidth - bubbleWidth) / 2);
    const centerX = Math.round(svgWidth / 2);
    const rectY = 6;
    const rectHeight = isActive ? 38 : 34;
    const rectRadius = Math.round(rectHeight / 2);
    const fontSize = isActive ? 16 : 15;

    const svg = `
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="pillShadow" x="-30%" y="-50%" width="160%" height="220%">
      <feDropShadow dx="0" dy="2" stdDeviation="${isActive ? 3 : 2.2}" flood-color="#000000" flood-opacity="${isActive ? 0.2 : 0.14}" />
    </filter>
  </defs>
  <rect
    x="${rectX}"
    y="${rectY}"
    width="${bubbleWidth}"
    height="${rectHeight}"
    rx="${rectRadius}"
    ry="${rectRadius}"
    fill="#FFFFFF"
    stroke="${isActive ? '#F07639' : '#D4D4D8'}"
    stroke-width="${isActive ? 2 : 1}"
    filter="url(#pillShadow)"
  />
  <text x="${centerX}" y="${rectY + Math.round(rectHeight / 2) + 1}" fill="#111827" font-size="${fontSize}" font-family="sans-serif" font-weight="700" text-anchor="middle" alignment-baseline="middle">
    ${formattedPrice}
  </text>
</svg>
`;
    const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

    const bubbleScale = isActive ? 92 : 84;
    const bubbleHeight = isActive ? 52 : 46;
    const anchorX = Math.round(bubbleScale / 2);
    const anchorY = isActive ? 46 : 40;

    return {
      url: svgUrl,
      scaledSize: new google.maps.Size(bubbleScale, bubbleHeight),
      anchor: new google.maps.Point(anchorX, anchorY),
    };
  };

  const CATEGORY_SVG_MARKER_SIZE = 38;

  const createCategoryPinIcon = (color: string, categoryKey?: string) => {
    const assetByCategory: Record<string, string> = {
      restaurants: '/assets/icons/Restaurants.svg',
      gyms: '/assets/icons/Gym.svg',
      schools: '/assets/icons/Education.svg',
    };

    const assetUrl = categoryKey ? assetByCategory[categoryKey] : undefined;
    if (assetUrl) {
      return {
        url: assetUrl,
        scaledSize: new google.maps.Size(CATEGORY_SVG_MARKER_SIZE, CATEGORY_SVG_MARKER_SIZE),
        anchor: new google.maps.Point(
          Math.round(CATEGORY_SVG_MARKER_SIZE / 2),
          Math.round(CATEGORY_SVG_MARKER_SIZE / 2),
        ),
      };
    }

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
            setState({ ...fallback, placeId, position });
            return;
          }

          const placeAny = place as any;
          setState({
            placeId,
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

        const icon = createCategoryPinIcon(opts?.iconColor ?? '#ef4444', opts?.categoryKey);
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
            visible: isPointInsideActiveDrawPolygon(loc),
          });
          marker.addListener('click', () => {
            setClickedDistrictName(null);
            setSelectedSchool(null);
            const position = { lat: loc.lat(), lng: loc.lng() };
            const current = selectedSearchPlaceRef.current;
            const sameSelected =
              !!current &&
              ((place.place_id && current.placeId && current.placeId === place.place_id) ||
                (current.categoryKey === opts?.categoryKey &&
                  current.position?.lat === position.lat &&
                  current.position?.lng === position.lng));

            if (sameSelected) {
              searchDetailsRequestRef.current += 1;
              setSelectedSearchPlace(null);
              return;
            }

            if (!measureModeRef.current) {
              centerOnMeasurePoint(position);
            }
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
    [
      applyMeasurePointFromMarker,
      attachPlaceMarkerClick,
      centerOnMeasurePoint,
      clearCategoryMarkers,
      clearSearchMarkers,
      isPointInsideActiveDrawPolygon,
      mapInstance,
    ],
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
    const focusQueryGeometry = (geometry?: google.maps.places.PlaceGeometry | null) => {
      if (!geometry || !mapInstance) return;
      suppressNextOnIdleRef.current = true;
      userMovedMapRef.current = false;
      if (geometry.viewport) {
        mapInstance.fitBounds(geometry.viewport, 50);
        return;
      }
      const location = geometry.location;
      if (location) {
        mapInstance.panTo(location);
        mapInstance.setZoom(Math.max(zoom, 12));
      }
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
            focusQueryGeometry(place?.geometry ?? null);
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
          focusQueryGeometry(geoResults[0]?.geometry ?? null);
        });
      },
    );
  }, [isLoaded, mapInstance, searchQuery, extractPlaceQuery, extractLastLocationPhrase, zoom]);

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
        const cappedRadius = Math.min(radius, 50000);

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
            radius: cappedRadius,
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
      const viewportBounds = mapInstance.getBounds();
      const boundsToSearch =
        allBounds.length > 0
          ? allBounds
          : viewportBounds
            ? [viewportBounds]
            : [];

      const allPlaces: google.maps.places.PlaceResult[] = [];
      for (const bounds of boundsToSearch) {
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

      const uniquePlaces = Array.from(uniqueById.values());
      const filtered = polygons.length > 0
        ? uniquePlaces.filter((place) => {
          const location = place.geometry?.location;
          if (!location) return false;
          return polygons.some((poly) => google.maps.geometry.poly.containsLocation(location, poly));
        })
        : uniquePlaces;
      const placesToRender = filtered.length > 0 ? filtered : uniquePlaces;

      const schoolIconUrl = '/assets/icons/Education.svg';

      const markers = placesToRender.map((place) => {
        const location = place.geometry!.location;
        // Modified by Abhradip Paul showing typescript error
        if (!location?.lat() || !location?.lng()) return;
        const position = { lat: location.lat(), lng: location.lng() };
        const marker = new google.maps.Marker({
          map: mapInstance,
          position,
          title: place.name ?? 'School',
          visible: isPointInsideActiveDrawPolygon(position),
          icon: {
            url: schoolIconUrl,
            scaledSize: new google.maps.Size(CATEGORY_SVG_MARKER_SIZE, CATEGORY_SVG_MARKER_SIZE),
            anchor: new google.maps.Point(
              Math.round(CATEGORY_SVG_MARKER_SIZE / 2),
              Math.round(CATEGORY_SVG_MARKER_SIZE / 2),
            ),
          },
        });

        marker.addListener('click', () => {
          setClickedDistrictName(null);
          setSelectedSearchPlace(null);
          if (!measureModeRef.current) {
            centerOnMeasurePoint(position);
          }
          const currentSchool = selectedSchoolRef.current;
          const sameSchoolSelected =
            !!currentSchool &&
            ((place.place_id && currentSchool.placeId && currentSchool.placeId === place.place_id) ||
              (currentSchool.position?.lat === position.lat &&
                currentSchool.position?.lng === position.lng));

          if (sameSchoolSelected) {
            schoolDetailsRequestRef.current += 1;
            setSelectedSchool(null);
            return;
          }

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
              placeId: place.place_id ?? undefined,
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
      (schoolMarkersRef.current as any) = markers.filter(Boolean);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    mapInstance,
    matchedDistricts,
    showDistricts,
    getDistrictId,
    fetchPlaceDetails,
    applyMeasurePointFromMarker,
    centerOnMeasurePoint,
    isPointInsideActiveDrawPolygon,
  ]);

  useEffect(() => {
    const applyVisibility = (marker: google.maps.Marker) => {
      marker.setVisible(isPointInsideActiveDrawPolygon(marker.getPosition() as google.maps.LatLng | null));
    };

    schoolMarkersRef.current.forEach(applyVisibility);
    searchMarkersRef.current.forEach(applyVisibility);
    Object.values(categoryMarkersRef.current).forEach((group) => group.forEach(applyVisibility));

    const selectedPoi = selectedSearchPlaceRef.current;
    if (selectedPoi && !isPointInsideActiveDrawPolygon(selectedPoi.position)) {
      setSelectedSearchPlace(null);
    }

    const selectedSchoolPoint = selectedSchoolRef.current;
    if (selectedSchoolPoint && !isPointInsideActiveDrawPolygon(selectedSchoolPoint.position)) {
      setSelectedSchool(null);
    }
  }, [drawPolygon, isPointInsideActiveDrawPolygon]);

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
    if (drawMode && isTouchDevice && event?.latLng) {
      const point = event.latLng.toJSON();
      mobileTapDrawPointsRef.current.push(point);
      if (!mapInstance) return;
      if (!freehandPreviewLineRef.current) {
        freehandPreviewLineRef.current = new google.maps.Polyline({
          map: mapInstance,
          path: mobileTapDrawPointsRef.current,
          clickable: false,
          strokeColor: '#F57F2E',
          strokeOpacity: 0.95,
          strokeWeight: 2,
          zIndex: 50,
        });
      } else {
        freehandPreviewLineRef.current.setPath(mobileTapDrawPointsRef.current);
      }
      return;
    }

    if (!recentDataClickRef.current) {
      setClickedDistrictName(null);
    }
    setSelectedMarker(null);
    onMarkerClick?.('');
    setSelectedSchool(null);
    setSelectedSearchPlace(null);
    setSelectedMarker(null);
    setHoveredMarker(null);

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
  }, [measureMode, measureStart, measureEnd, onMarkerClick, drawMode, isTouchDevice, mapInstance]);

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

  const panMarkerIntoVisibleArea = useCallback((position: google.maps.LatLngLiteral) => {
    if (!mapInstance) return;
    mapInstance.panTo(position);
    if (isTouchDevice && useOverlayResultsRail) {
      window.setTimeout(() => {
        try {
          const overlay = projectionOverlayRef.current;
          const projection = overlay?.getProjection?.();
          if (!projection) return;
          const mapDiv = mapInstance.getDiv();
          const mapHeight = mapDiv?.clientHeight ?? 0;
          if (!mapHeight) return;
          const markerPixel = projection.fromLatLngToContainerPixel(
            new google.maps.LatLng(position.lat, position.lng),
          );
          if (!markerPixel) return;
          const targetY = mapHeight * 0.34;
          const deltaY = markerPixel.y - targetY;
          if (Math.abs(deltaY) > 8) {
            mapInstance.panBy(0, deltaY);
          }
        } catch {
          // no-op
        }
      }, 0);
    }
  }, [isTouchDevice, mapInstance, useOverlayResultsRail]);

  const centerOnMarker = useCallback((position: google.maps.LatLngLiteral) => {
    if (!mapInstance) return;
    panMarkerIntoVisibleArea(position);
    if (!measureMode && !measureModeRef.current) {
      mapInstance.setZoom(Math.max(zoom, 21));
    }
  }, [mapInstance, panMarkerIntoVisibleArea, zoom, measureMode]);

  const isSameMarker = useCallback((a: any, b: any) => {
    if (!a || !b) return false;
    if (a.id && b.id) return String(a.id) === String(b.id);
    return a.lat === b.lat && a.lng === b.lng;
  }, []);

  const previewAnchorMarker = useMemo(() => {
    const allowHoverPreview = !isTouchDevice || !useOverlayResultsRail;
    const allowTouchPreview = isTouchDevice && !useOverlayResultsRail;
    const hoverAnchor = allowHoverPreview ? hoveredMarker : null;
    return hoverAnchor || (allowTouchPreview ? selectedMarker : null);
  }, [hoveredMarker, isTouchDevice, selectedMarker, useOverlayResultsRail]);

  const hoverPreview = useMemo(() => {
    if (!previewAnchorMarker) return null;

    const source = previewAnchorMarker?.originalData || {};
    const listing = source?.listing ?? source?.data?.listing ?? {};
    const property = listing?.property ?? source?.property ?? {};
    const listPrice =
      listing?.listPriceLow ??
      listing?.listPrice ??
      source?.listPrice ??
      Number(previewAnchorMarker?.price || 0);
    const beds = property?.bedroomsTotal;
    const baths = property?.bathroomsTotal;
    const sqft = property?.livingArea;
    const image =
      listing?.media?.primaryListingImageUrl ??
      source?.media?.primaryListingImageUrl ??
      '';
    const rawStatus =
      listing?.standardStatus ??
      listing?.StandardStatus ??
      listing?.mlsStatus ??
      listing?.MlsStatus ??
      listing?.mostRecentStatus ??
      listing?.currentStatus ??
      listing?.status ??
      '';
    const status = typeof rawStatus === 'string' ? rawStatus.trim() : '';
    const normalizedStatus = status.toLowerCase();
    const statusLabel = normalizedStatus.includes('active')
      ? 'Active'
      : status || 'For sale';
    const compactStatusLabel =
      statusLabel === 'Active'
        ? 'House for sale'
        : statusLabel;
    const listingType =
      listing?.propertyType ||
      property?.propertyType ||
      property?.propertySubType ||
      'Residential';
    const address =
      source?.public?.address?.label ??
      listing?.address?.unparsedAddress ??
      source?.address?.unparsedAddress ??
      'Property preview';

    return {
      position: { lat: previewAnchorMarker.lat, lng: previewAnchorMarker.lng },
      image,
      priceText: Number(listPrice) > 0 ? formatCurrency(Number(listPrice)) : formatMarkerPriceCompact(Number(previewAnchorMarker?.price || 0)),
      meta: [beds ? `${beds} bds` : '', baths ? `${baths} ba` : '', sqft ? `${sqft} sqft` : '', compactStatusLabel]
        .filter(Boolean)
        .join(' | '),
      statusLabel,
      listingType: String(listingType).toUpperCase(),
      address,
    };
  }, [previewAnchorMarker]);


  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setCurrentMapZoom(map.getZoom() ?? zoom);
  }, [zoom]);

  const onUnmount = () => setMap(null);

  useEffect(() => {
    // A new search query should be allowed to auto-fit again.
    userMovedMapRef.current = false;
    lastAutoFitQueryRef.current = null;
  }, [searchQuery]);

  useEffect(() => {
    if (!mapInstance) return;
    const dragListener = mapInstance.addListener('dragstart', () => {
      userMovedMapRef.current = true;
    });
    const zoomListener = mapInstance.addListener('zoom_changed', () => {
      userMovedMapRef.current = true;
      setCurrentMapZoom(mapInstance.getZoom() ?? zoom);
    });
    return () => {
      google.maps.event.removeListener(dragListener);
      google.maps.event.removeListener(zoomListener);
    };
  }, [mapInstance, zoom]);

  useEffect(() => {
    // If we've already drawn a polygon or are in the middle of a search, 
    // don't auto-adjust the map as it might trigger an infinite idle loop.
    if (drawMode || hasActiveDrawPolygon || recentDataClickRef.current) {
      return;
    }
    if (mapInstance && markers.length > 0) {
      // In overlay-results map mode (mobile/desktop split view), aggressively fitting
      // to every marker causes jarring zoom-outs (often country-level) on refresh.
      // Keep current viewport stable and let query/place focus logic drive centering.
      if (useOverlayResultsRail) return;

      const currentQueryKey = (searchQuery || '').trim().toLowerCase() || '__no_query__';
      if (userMovedMapRef.current && lastAutoFitQueryRef.current === currentQueryKey) {
        return;
      }
      const validMarkers = markers.filter(
        ({ lat, lng }) => typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng),
      );
      if (validMarkers.length === 0) return;
      if (validMarkers.length === 1) {
        const { lat, lng } = validMarkers[0];
        mapInstance.setCenter({ lat, lng });
        mapInstance.setZoom(zoom);
      } else {
        const bounds = new window.google.maps.LatLngBounds();
        validMarkers.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
        mapInstance.fitBounds(bounds, 50);
      }
      lastAutoFitQueryRef.current = currentQueryKey;
    }
  }, [mapInstance, markers, zoom, drawMode, hasActiveDrawPolygon, searchQuery, useOverlayResultsRail]);

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

  useEffect(() => {
    if (shouldHideControls) {
      setMobileToolsExpanded(false);
      setActiveToolPanel(null);
    }
  }, [shouldHideControls]);

  useEffect(() => {
    if (!isTouchDevice || activeToolPanel !== 'explore') return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (controlsDockRef.current?.contains(target)) return;
      setActiveToolPanel(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isTouchDevice, activeToolPanel]);



  return isLoaded ? (
    <div className="relative w-full" style={{ height: containerStyle.height, minHeight: containerStyle.minHeight }}>
      {showDistricts && clickedDistrictName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="rounded-full border border-gray-100 bg-white/95 px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur-sm whitespace-nowrap">
            {clickedDistrictName}
          </div>
        </div>
      )}
      <div
        ref={controlsDockRef}
        className={cn(
          'absolute z-30 pointer-events-auto',
          shouldHideControls ? 'hidden' : '',
          isTouchDevice
            ? 'right-3 bottom-[132px]'
            : 'right-3 top-3 sm:right-4 sm:top-4',
        )}
      >
        <div className="flex items-start gap-2">
          {!isTouchDevice && activeToolPanel === 'measure' && (
            <div className="w-[220px] max-w-[72vw] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Measure</span>
                <button
                  className={cn(
                    'rounded-full px-2 py-1 text-[11px] font-semibold',
                    measureMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700',
                  )}
                  onClick={() => {
                    setMeasureMode((prev) => {
                      const next = !prev;
                      if (next) {
                        setDrawMode(false);
                        setActiveToolPanel((panel) => (panel === 'draw' ? 'measure' : panel));
                      } else {
                        resetMeasure();
                      }
                      return next;
                    });
                  }}
                >
                  {measureMode ? 'On' : 'Off'}
                </button>
              </div>
              <div className="mt-2 text-[11px] leading-4 text-gray-600">
                {measureMode ? 'Pick listing, then school/place (or click two map points).' : 'Enable route measuring.'}
              </div>
              <div className="mt-2 text-[11px]">
                {measureDuration && measureDistance ? (
                  <div>
                    <div className="font-semibold text-gray-900">{measureDuration}</div>
                    <div className="text-gray-500">{measureDistance}</div>
                  </div>
                ) : measureError ? (
                  <div className="text-red-500">{measureError}</div>
                ) : (
                  <div className="text-gray-400">No route selected.</div>
                )}
              </div>
              {measureMode && (measureStart || measureEnd) ? (
                <button
                  className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={resetMeasure}
                >
                  Clear
                </button>
              ) : null}
            </div>
          )}

          {!isTouchDevice && activeToolPanel === 'draw' && (
            <div className="w-[220px] max-w-[72vw] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Draw Area</span>
                <button
                  className={cn(
                    'rounded-full px-2 py-1 text-[11px] font-semibold',
                    drawMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrawMode((prev) => {
                      const next = !prev;
                      if (next) {
                        setMeasureMode(false);
                        resetMeasure();
                        setActiveToolPanel((panel) => (panel === 'measure' ? 'draw' : panel));
                      }
                      return next;
                    });
                  }}
                >
                  {drawMode ? 'On' : 'Off'}
                </button>
              </div>
              <div className="mt-2 text-[11px] leading-4 text-gray-600">
                {drawMode
                  ? 'Click and drag to draw a freehand area.'
                  : drawFilteredMarkerIds
                    ? `${drawFilteredMarkerIds.length} listing${drawFilteredMarkerIds.length === 1 ? '' : 's'} in area.`
                    : 'Draw a freehand shape to filter current listings.'}
              </div>
              <button
                className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                onClick={() => {
                  clearDrawPolygon();
                  setSelectedMarker(null);
                }}
                disabled={!drawPolygon}
              >
                Clear Draw
              </button>
            </div>
          )}

          {activeToolPanel === 'explore' && (
            <div className={cn(
              'rounded-xl border border-gray-200 bg-white p-3 shadow-lg',
              isTouchDevice ? 'w-[260px] max-w-[72vw]' : 'w-[280px] max-w-[80vw]',
            )}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Explore Search
              </div>
              <form
                className="flex items-stretch gap-2"
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
                    className="block w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-0 focus:border-gray-400"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 36,
                      minHeight: 36,
                      lineHeight: '20px',
                      paddingTop: 0,
                      paddingBottom: 0,
                      backgroundColor: '#fff',
                      borderWidth: 1,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white hover:bg-black"
                  style={{ height: 36, minWidth: 44 }}
                >
                  Go
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
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
                  className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setActiveToolPanel(null)}
                >
                  Close
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {onOverlayChange && (
                  <button
                    type="button"
                    onClick={() => onOverlayChange(overlayValue === 'schools' ? 'none' : 'schools')}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={{
                      borderColor: overlayValue === 'schools' ? schoolCategoryColor : '#e5e7eb',
                      background: overlayValue === 'schools' ? schoolCategoryColor : '#fff',
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
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    Object.keys(categoryMarkersRef.current).forEach((key) => {
                      categoryRequestIdRef.current[key] = (categoryRequestIdRef.current[key] ?? 0) + 1;
                    });
                    activeCategoryKeysRef.current = new Set();
                    setActiveCategoryKeys([]);
                    clearAllCategoryMarkers();
                    if (onOverlayChange && overlayValue === 'schools') onOverlayChange('none');
                    setExploreFeedback(null);
                  }}
                >
                  Clear Categories
                </button>
                {(activeCategoryKeys.length > 0 || overlayValue === 'schools') && (
                  <span className="text-[10px] text-gray-500">
                    {activeCategoryKeys.length + (overlayValue === 'schools' ? 1 : 0)} active
                  </span>
                )}
              </div>
              {exploreFeedback && (
                <div className="mt-2 rounded-md bg-gray-50 px-2.5 py-2 text-[11px] text-gray-600">
                  {exploreFeedback}
                </div>
              )}
            </div>
          )}

          <div
            className={cn(
              'flex flex-col border border-gray-200 bg-white/95 shadow-lg backdrop-blur',
              isTouchDevice ? 'overflow-hidden rounded-md p-0' : 'gap-2 rounded-xl p-1.5',
            )}
          >
            {isTouchDevice ? (
              <button
                type="button"
                title="Map tools"
                onClick={() => setMobileToolsExpanded((prev) => !prev)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center bg-white text-gray-700 hover:bg-gray-50',
                  'border-b border-gray-200',
                )}
                aria-label="Toggle map tools"
              >
                {mobileToolsExpanded ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            ) : null}

            {isTouchDevice ? (
              <>
                <button
                  type="button"
                  title="Zoom in"
                  onClick={() => adjustMapZoom(1)}
                  className="flex h-10 w-10 items-center justify-center border-b border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  aria-label="Zoom in"
                >
                  <span className="text-2xl leading-none">+</span>
                </button>
                <button
                  type="button"
                  title="Zoom out"
                  onClick={() => adjustMapZoom(-1)}
                  className="flex h-10 w-10 items-center justify-center border-b border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  aria-label="Zoom out"
                >
                  <span className="text-3xl leading-none">-</span>
                </button>
              </>
            ) : null}

            {(!isTouchDevice || mobileToolsExpanded) ? (
              <>
            <button
              type="button"
              title="Measure Time"
              onClick={() => {
                if (isTouchDevice) {
                  const next = !measureMode;
                  setMeasureMode(next);
                  setDrawMode(false);
                  if (!next) resetMeasure();
                  setActiveToolPanel(next ? 'measure' : null);
                  return;
                }
                setActiveToolPanel((prev) => {
                  const nextPanel = prev === 'measure' ? null : 'measure';
                  if (nextPanel === 'measure') {
                    setDrawMode(false);
                    setMeasureMode(true);
                  } else {
                    setMeasureMode(false);
                    resetMeasure();
                  }
                  return nextPanel;
                });
              }}
              className={cn(
                'flex items-center justify-center text-[11px] font-semibold',
                isTouchDevice ? 'h-10 w-10 border-b border-gray-200' : 'h-10 w-10 rounded-lg border',
                activeToolPanel === 'measure' || measureMode
                  ? 'border-black bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              )}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16Z"
                  stroke={activeToolPanel === 'measure' || measureMode ? '#fff' : '#6b7280'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12l4-2.5"
                  stroke={activeToolPanel === 'measure' || measureMode ? '#fff' : '#6b7280'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="12" r="1.2" fill={activeToolPanel === 'measure' || measureMode ? '#fff' : '#6b7280'} />
              </svg>
            </button>
            <button
              type="button"
              title="Draw Area"
              onClick={(e) => {
                e.stopPropagation();
                if (drawMode) {
                  if (isTouchDevice) {
                    finalizeMobileTapDraw();
                    setActiveToolPanel(null);
                    return;
                  }
                  clearDrawPolygon();
                  setActiveToolPanel((prev) => (prev === 'draw' ? null : prev));
                  return;
                }
                if (!!drawPolygon) {
                  clearDrawPolygon();
                  setActiveToolPanel((prev) => (prev === 'draw' ? null : prev));
                  return;
                }
                setMeasureMode(false);
                resetMeasure();
                setActiveToolPanel((prev) => (prev === 'measure' ? null : prev));
                setDrawMode(true);
                if (isTouchDevice) {
                  mobileTapDrawPointsRef.current = [];
                }
              }}
              className={cn(
                'flex items-center justify-center text-[11px] font-semibold',
                isTouchDevice ? 'h-10 w-10 border-b border-gray-200' : 'h-10 w-10 rounded-lg border',
                activeToolPanel === 'draw' || drawMode || !!drawPolygon
                  ? 'border-black bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              )}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 20h4.2l10-10a1.8 1.8 0 0 0 0-2.55l-1.65-1.65a1.8 1.8 0 0 0-2.55 0L4 15.8V20Z"
                  stroke={activeToolPanel === 'draw' || drawMode || !!drawPolygon ? '#fff' : '#6b7280'}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.9 7.05 16.95 11.1"
                  stroke={activeToolPanel === 'draw' || drawMode || !!drawPolygon ? '#fff' : '#6b7280'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M4 20l3.2-.7L4.7 16.8 4 20Z"
                  fill={activeToolPanel === 'draw' || drawMode || !!drawPolygon ? '#fff' : '#6b7280'}
                />
              </svg>
            </button>
            <button
              type="button"
              title="Explore Search"
              onClick={() => {
                if (isTouchDevice) {
                  const next = activeToolPanel !== 'explore';
                  if (!next) {
                    setActiveToolPanel(null);
                    return;
                  }
                  setMeasureMode(false);
                  resetMeasure();
                  setDrawMode(false);
                  setActiveToolPanel('explore');
                  setExploreFeedback(null);
                  return;
                }
                setActiveToolPanel((prev) => (prev === 'explore' ? null : 'explore'));
              }}
              className={cn(
                'flex items-center justify-center',
                isTouchDevice ? 'h-10 w-10 border-b border-gray-200' : 'h-10 w-10 rounded-lg border',
                activeToolPanel === 'explore'
                  ? 'border-black bg-black'
                  : 'bg-white hover:bg-gray-50',
              )}
              aria-label="Explore places"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Zm0 2a5 5 0 1 1 0 10a5 5 0 0 1 0-10Z" fill={activeToolPanel === 'explore' ? '#fff' : '#6b7280'} />
                <path d="M15.8 15.8l3.9 3.9" stroke={activeToolPanel === 'explore' ? '#fff' : '#6b7280'} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            </>
            ) : null}
          </div>
        </div>
      </div>

      {isTouchDevice && drawMode && !shouldHideControls ? (
        <div
          className="absolute inset-0 z-20 touch-none"
          onPointerDown={handleTouchDrawPointerDown}
          onPointerMove={handleTouchDrawPointerMove}
          onPointerUp={handleTouchDrawPointerUp}
          onPointerCancel={handleTouchDrawPointerUp}
        />
      ) : null}

      <GoogleMap
        mapContainerStyle={containerStyle}
        mapContainerClassName="snaphomz-map"
        onLoad={onLoad}
        zoom={zoom}
        center={DEFAULT_COORD}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        onIdle={() => {
          if (drawMode || hasActiveDrawPolygon) return;
          if (suppressNextOnIdleRef.current) {
            suppressNextOnIdleRef.current = false;
            return;
          }
          if (mapInstance && onMapMove) {
            const center = mapInstance.getCenter();
            const bounds = mapInstance.getBounds();
            if (center && bounds) {
              onMapMove(
                { lat: center.lat(), lng: center.lng() },
                bounds
              );
            }
          }
        }}
        options={{
          cameraControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          rotateControl: false,
          clickableIcons: false,
          zoomControl: !shouldHideControls && !isTouchDevice,
          draggable: !drawMode,
          scrollwheel: true,
          gestureHandling: isTouchDevice ? 'greedy' : 'cooperative',
          draggableCursor: drawMode ? 'crosshair' : undefined,
          mapId: googleMapsMapId,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          minZoom: 3,
          restriction: {
            latLngBounds: {
              north: 85,
              south: -85,
              west: -180,
              east: 180,
            },
            strictBounds: true,
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
        {markers.map((marker) => {
          const isMarkerVisible = markerVisibilityMap
            ? markerVisibilityMap.get(marker.markerKey) === true
            : true;
          const isSelectedMarker = marker.markerKey === selectedMarker?.markerKey;
          const isHoveredMapMarker = marker.markerKey === hoveredMarker?.markerKey;
          return (
            <Marker
              key={marker.markerKey}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={createCustomMarker(marker.price, isSelectedMarker, isHoveredMapMarker)}
              options={{ clickable: !drawMode && isMarkerVisible, visible: isMarkerVisible }}
              onMouseOver={() => {
                if (drawMode || !isMarkerVisible || isTouchDevice) return;
                setHoveredMarker(marker);
              }}
              onMouseOut={() => {
                if (isTouchDevice) return;
                setHoveredMarker((prev: any) =>
                  prev?.markerKey === marker.markerKey ? null : prev,
                );
              }}
              onClick={() => {
                if (drawMode || !isMarkerVisible) return;
                const markerPos = { lat: marker.lat, lng: marker.lng };
                const measureSelectionActive = measureMode || measureModeRef.current;
                if (measureSelectionActive) {
                  panMarkerIntoVisibleArea(markerPos);
                  applyMeasurePointFromMarker(markerPos, 'listing');
                  if (marker.id && onMarkerClick) onMarkerClick(marker.id);
                  return;
                }
                const sameSelected =
                  !!selectedMarker &&
                  (String(marker.markerKey) === String(selectedMarker.markerKey) ||
                    (marker.id && selectedMarker.id && String(marker.id) === String(selectedMarker.id)) ||
                    (selectedMarker.lat === marker.lat && selectedMarker.lng === marker.lng));
                if (sameSelected) {
                  setSelectedMarker(null);
                  onMarkerClick?.('');
                  return;
                }
                setSelectedMarker(marker);
                setHoveredMarker(marker);
                centerOnMarker(markerPos);
                applyMeasurePointFromMarker(markerPos, 'listing');
                if (marker.id && onMarkerClick) onMarkerClick(marker.id);
              }}
            />
          );
        })}

        {hoverPreview ? (
          <InfoWindow
            position={hoverPreview.position}
            onCloseClick={() => {
              setHoveredMarker(null);
              if (isTouchDevice) {
                setSelectedMarker(null);
              }
            }}
            options={{
              disableAutoPan: true,
              pixelOffset: new google.maps.Size(0, -42),
              maxWidth: 320,
            }}
          >
            <div
              className="snaphomz-info-window w-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
              style={{ animation: 'snaphomzMapCardIn 180ms ease-out' }}
            >
              <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                {hoverPreview.image ? (
                  <img
                    src={hoverPreview.image}
                    alt={hoverPreview.address}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    No photo available
                  </div>
                )}
                <div className="absolute left-2 top-2 z-10 rounded-full bg-[#78de2a] px-2 py-0.5 text-[10px] font-semibold text-black shadow-sm">
                  {hoverPreview.statusLabel}
                </div>
              </div>
              <div className="space-y-2 px-4 py-3">
                <div className="text-[15px] font-bold leading-none text-gray-900">
                  {hoverPreview.priceText}
                </div>
                {hoverPreview.meta ? (
                  <div className="text-[11px] leading-4 text-gray-600">
                    {hoverPreview.meta}
                  </div>
                ) : null}
                <div className="line-clamp-2 min-h-[2rem] text-[12px] leading-4 text-gray-800">{hoverPreview.address}</div>
                <div className="pt-1 text-[10px] uppercase tracking-wide text-gray-400">
                  {hoverPreview.listingType}
                </div>
              </div>
            </div>
          </InfoWindow>
        ) : null}

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
      <style>{`
        @keyframes snaphomzMapCardIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  ) : (
    <SkeletonLoader className="h-[350px] w-full bg-gray-400 md:col-span-9" />
  );
};

export default React.memo(CustomMap);



