// 'use client';

// import {
//   GoogleMap,
//   InfoWindow,
//   Marker,
//   DirectionsRenderer,
//   Libraries,
//   useJsApiLoader,
// } from '@react-google-maps/api';
// import React, { useEffect, useMemo, useState, useCallback } from 'react';
// import { googleMapsApiKey, googleMapsMapId } from '@/shared/constants/env';
// import SkeletonLoader from './skeleton-loader';
// import { cn, formatCurrency } from '@/lib/utils';

// type Coordinate = {
//   id?: string;
//   lat: number;
//   lng: number;
//   price?: string;
// };

// type Props = {
//   properties?: any[];
//   coord?: Coordinate[];
//   width?: string;
//   height?: string;
//   zoom?: number;
//   searchQuery?: string;
//   showDistricts?: boolean;
//   overlayValue?: 'none' | 'schools';
//   onOverlayChange?: (value: 'none' | 'schools') => void;
//   onMarkerClick?: (id: string) => void;
//   onMapMove?: (
//     center: google.maps.LatLngLiteral,
//     bounds: google.maps.LatLngBounds
//   ) => void;
//   onDrawFilterChange?: (filteredIds: string[] | null) => void;
//   onMeasureStateChange?: (state: {
//     active: boolean;
//     duration: string | null;
//     distance: string | null;
//     error: string | null;
//   }) => void;
//   clearDrawSignal?: number;
//   useOverlayResultsRail?: boolean;
//   hideControls?: boolean;
// };

// const DEFAULT_COORD = { lat: 36.778, lng: -119.417 };
// const libraries: Libraries = ['places', 'geometry', 'drawing'];

// type DistrictFeature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, any>>;

// type DistrictPolygonCacheEntry = {
//   id: string;
//   feature: DistrictFeature;
//   polygons: google.maps.Polygon[];
//   bounds: google.maps.LatLngBounds[];
// };

// type PlaceDetailsState = {
//   placeId?: string;
//   name: string;
//   rating?: number;
//   total?: number;
//   phone?: string;
//   website?: string;
//   address?: string;
//   summary?: string;
//   photoUrl?: string;
//   openNow?: boolean;
//   weeklyHours?: string[];
//   position: google.maps.LatLngLiteral;
//   isLoading?: boolean;
// };

// type SearchPlaceDetails = PlaceDetailsState & {
//   categoryKey?: string;
// };

// type ListingMarker = {
//   id?: string;
//   markerKey: string;
//   lat: number;
//   lng: number;
//   price: string;
//   originalData: any;
// };

// const toMarkerKey = (
//   id: string | number | undefined,
//   lat: number,
//   lng: number,
//   index: number,
// ) => `${id ?? 'no-id'}:${lat.toFixed(6)}:${lng.toFixed(6)}:${index}`;

// const resolveListingId = (item: any): string | undefined => {
//   const raw =
//     item?.id ??
//     item?.listingId ??
//     item?.listing_id ??
//     item?.listing?.id ??
//     item?.listing?.listingId ??
//     item?.mlsId ??
//     item?.mls_id ??
//     item?.propertyId;
//   if (raw === undefined || raw === null || raw === '') return undefined;
//   return String(raw);
// };

// const CustomMap: React.FC<Props> = ({
//   properties = [],
//   coord = [],
//   width,
//   height,
//   zoom = 10,
//   searchQuery = '',
//   showDistricts = false,
//   overlayValue = 'none',
//   onOverlayChange,
//   onMarkerClick,
//   onMapMove,
//   onDrawFilterChange,
//   onMeasureStateChange,
//   clearDrawSignal = 0,
//   useOverlayResultsRail = false,
//   hideControls = false,
// }) => {
//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: googleMapsApiKey!,
//     libraries,
//     language: "en",
//     region: "US",
//     version: "weekly",
//   });

//   const [mapInstance, setMap] = useState<google.maps.Map | null>(null);
//   const [currentMapZoom, setCurrentMapZoom] = useState<number>(zoom);
//   const [selectedMarker, setSelectedMarker] = useState<any>(null);
//   const [hoveredMarker, setHoveredMarker] = useState<any>(null);
//   const [isTouchDevice, setIsTouchDevice] = useState(false);
//   const [measureMode, setMeasureMode] = useState(false);
//   const [measureStart, setMeasureStart] = useState<google.maps.LatLngLiteral | null>(null);
//   const [measureEnd, setMeasureEnd] = useState<google.maps.LatLngLiteral | null>(null);
//   const [measureRoute, setMeasureRoute] = useState<google.maps.DirectionsResult | null>(null);
//   const [measureDuration, setMeasureDuration] = useState<string | null>(null);
//   const [measureDistance, setMeasureDistance] = useState<string | null>(null);
//   const [measureError, setMeasureError] = useState<string | null>(null);
//   const [clickedDistrictName, setClickedDistrictName] = useState<string | null>(null);
//   const [districtFeatures, setDistrictFeatures] = useState<DistrictFeature[]>([]);
//   const [matchedDistricts, setMatchedDistricts] = useState<DistrictFeature[]>([]);
//   const [districtsLoadingError, setDistrictsLoadingError] = useState<string | null>(null);
//   const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
//   const [selectedSchool, setSelectedSchool] = useState<PlaceDetailsState | null>(null);
//   const [selectedSearchPlace, setSelectedSearchPlace] = useState<SearchPlaceDetails | null>(null);
//   const [activeToolPanel, setActiveToolPanel] = useState<'measure' | 'draw' | 'explore' | null>(null);
//   const [exploreSearchInput, setExploreSearchInput] = useState('');
//   const [activeCategoryKeys, setActiveCategoryKeys] = useState<string[]>([]);
//   const [exploreFeedback, setExploreFeedback] = useState<string | null>(null);
//   const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false);
//   const [drawMode, setDrawMode] = useState(false);
//   const [drawPolygon, setDrawPolygon] = useState<google.maps.Polygon | null>(null);
//   const [drawFilteredMarkerIds, setDrawFilteredMarkerIds] = useState<string[] | null>(null);
//   const [mapViewport, setMapViewport] = useState<google.maps.LatLngBounds | null>(null);
//   const shouldHideControls = hideControls && isTouchDevice;
//   const featureLayersRef = React.useRef<{
//     state?: google.maps.FeatureLayer;
//     county?: google.maps.FeatureLayer;
//     city?: google.maps.FeatureLayer;
//   }>({});
//   const schoolMarkersRef = React.useRef<google.maps.Marker[]>([]);
//   const schoolDetailsRequestRef = React.useRef(0);
//   const searchDetailsRequestRef = React.useRef(0);
//   const searchMarkersRef = React.useRef<google.maps.Marker[]>([]);
//   const categoryMarkersRef = React.useRef<Record<string, google.maps.Marker[]>>({});
//   const searchPlaceBoundsRef = React.useRef<google.maps.LatLngBounds | null>(null);
//   const activeCategoryKeysRef = React.useRef<Set<string>>(new Set());
//   const categoryRequestIdRef = React.useRef<Record<string, number>>({});
//   const searchRequestIdRef = React.useRef(0);
//   const measureModeRef = React.useRef(false);
//   const measureStartRef = React.useRef<google.maps.LatLngLiteral | null>(null);
//   const selectedSearchPlaceRef = React.useRef<SearchPlaceDetails | null>(null);
//   const selectedSchoolRef = React.useRef<PlaceDetailsState | null>(null);
//   const userMovedMapRef = React.useRef(false);
//   const lastAutoFitQueryRef = React.useRef<string | null>(null);
//   const suppressNextOnIdleRef = React.useRef(false);

//   const districtPolygonCacheRef = React.useRef<Map<string, DistrictPolygonCacheEntry>>(new Map());
//   const drawPolygonRef = React.useRef<google.maps.Polygon | null>(null);
//   const lastDrawFilterIdsRef = React.useRef<string[] | null>(null);
//   const freehandDrawingActiveRef = React.useRef(false);
//   const mobileTapDrawPointsRef = React.useRef<google.maps.LatLngLiteral[]>([]);
//   const projectionOverlayRef = React.useRef<google.maps.OverlayView | null>(null);
//   const touchDrawPointerActiveRef = React.useRef(false);
//   const controlsDockRef = React.useRef<HTMLDivElement | null>(null);

//   // Always-current refs so callbacks can have stable identities (empty/minimal deps)
//   // without stale-closure bugs. Updated inline on every render.
//   const onDrawFilterChangeRef = React.useRef(onDrawFilterChange);
//   onDrawFilterChangeRef.current = onDrawFilterChange;
//   const freehandPathRef = React.useRef<google.maps.LatLngLiteral[]>([]);
//   const freehandPreviewLineRef = React.useRef<google.maps.Polyline | null>(null);
//   const refreshTimerRef = React.useRef<NodeJS.Timeout | null>(null);

//   const containerStyle = {
//     height: height || '100%',
//     width: '100%',
//     minHeight: '350px',
//     // removed minWidth to avoid forcing horizontal overflow / layout jumps
//   };

//   const resetMeasure = useCallback(() => {
//     setMeasureStart(null);
//     setMeasureEnd(null);
//     setMeasureRoute(null);
//     setMeasureDuration(null);
//     setMeasureDistance(null);
//     setMeasureError(null);
//   }, []);

//   const adjustMapZoom = useCallback(
//     (delta: number) => {
//       if (!mapInstance) return;
//       const currentZoom = mapInstance.getZoom() ?? zoom;
//       const nextZoom = Math.max(3, Math.min(21, currentZoom + delta));
//       mapInstance.setZoom(nextZoom);
//     },
//     [mapInstance, zoom],
//   );

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const media = window.matchMedia('(hover: none), (pointer: coarse)');
//     const sync = () => setIsTouchDevice(media.matches);
//     sync();

//     if (typeof media.addEventListener === 'function') {
//       media.addEventListener('change', sync);
//       return () => media.removeEventListener('change', sync);
//     }

//     media.addListener(sync);
//     return () => media.removeListener(sync);
//   }, []);

//   useEffect(() => {
//     measureModeRef.current = measureMode;
//   }, [measureMode]);

//   useEffect(() => {
//     onMeasureStateChange?.({
//       active: measureMode,
//       duration: measureDuration,
//       distance: measureDistance,
//       error: measureError,
//     });
//   }, [measureMode, measureDuration, measureDistance, measureError, onMeasureStateChange]);

//   useEffect(() => {
//     measureStartRef.current = measureStart;
//   }, [measureStart]);

//   useEffect(() => {
//     selectedSearchPlaceRef.current = selectedSearchPlace;
//   }, [selectedSearchPlace]);

//   useEffect(() => {
//     selectedSchoolRef.current = selectedSchool;
//   }, [selectedSchool]);

//   useEffect(() => {
//     const applyClickable = (marker: google.maps.Marker) => {
//       try {
//         marker.setOptions({ clickable: !drawMode });
//       } catch {
//         // no-op for marker instances that are being torn down
//       }
//     };

//     schoolMarkersRef.current.forEach(applyClickable);
//     searchMarkersRef.current.forEach(applyClickable);
//     Object.values(categoryMarkersRef.current).forEach((group) => group.forEach(applyClickable));
//   }, [drawMode]);

//   const clearMeasureRouteState = useCallback(() => {
//     setMeasureRoute(null);
//     setMeasureDuration(null);
//     setMeasureDistance(null);
//     setMeasureError(null);
//   }, []);

//   const hasActiveDrawPolygon = !!drawPolygon || !!drawPolygonRef.current;

//   const isPointInsideActiveDrawPolygon = useCallback(
//     (
//       point:
//         | google.maps.LatLng
//         | google.maps.LatLngLiteral
//         | null
//         | undefined,
//     ) => {
//       const activePolygon = drawPolygonRef.current ?? drawPolygon;
//       if (!activePolygon || !window.google?.maps?.geometry?.poly) return true;
//       if (!point) return false;

//       const latLng =
//         typeof (point as google.maps.LatLng).lat === 'function'
//           ? (point as google.maps.LatLng)
//           : new google.maps.LatLng(
//             (point as google.maps.LatLngLiteral).lat,
//             (point as google.maps.LatLngLiteral).lng,
//           );

//       return google.maps.geometry.poly.containsLocation(latLng, activePolygon);
//     },
//     [drawPolygon],
//   );

//   const applyMeasurePointFromMarker = useCallback(
//     (
//       point: google.maps.LatLngLiteral,
//       source: 'listing' | 'poi',
//     ) => {
//       if (!measureModeRef.current) return;

//       if (source === 'listing') {
//         setMeasureStart(point);
//         setMeasureEnd(null);
//         clearMeasureRouteState();
//         return;
//       }

//       if (!measureStartRef.current) {
//         clearMeasureRouteState();
//         setMeasureStart(point);
//         setMeasureEnd(null);
//         setMeasureError('Select a listing marker first, then a school/place marker.');
//         return;
//       }

//       setMeasureEnd(point);
//       setMeasureError(null);
//     },
//     [clearMeasureRouteState],
//   );

//   const centerOnMeasurePoint = useCallback((position: google.maps.LatLngLiteral) => {
//     if (!mapInstance) return;
//     mapInstance.panTo(position);
//   }, [mapInstance]);

//   const schoolCategoryColor = '#B22148';
//   const closeLocationTooltips = useCallback(() => {
//     setClickedDistrictName(null);
//     setSelectedSchool(null);
//     setSelectedSearchPlace(null);
//   }, []);

//   const quickCategories = useMemo(
//     () => ({
//       restaurants: { label: 'Restaurants', color: '#00A96E', query: 'restaurants' },
//       gyms: { label: 'Gyms', color: '#FF383C', query: 'gyms' },
//       // Google Places text search is more reliable with singular "hospital"
//       // than plural "hospitals" in some viewports.
//       hospitals: { label: 'Hospitals', color: '#2563eb', query: 'hospital' },
//       parks: { label: 'Parks', color: '#16a34a', query: 'parks' },
//     }),
//     [],
//   );


//   const markers = useMemo<ListingMarker[]>(() => {
//     const usePropertiesSource = useOverlayResultsRail ? true : properties.length > 0;
//     const raw: ListingMarker[] = usePropertiesSource
//       ? properties.map((prop, index) => ({
//         id: resolveListingId(prop),
//         markerKey: toMarkerKey(
//           resolveListingId(prop),
//           Number(prop.public?.latitude ?? prop.latitude),
//           Number(prop.public?.longitude ?? prop.longitude),
//           index,
//         ),
//         lat: prop.public?.latitude ?? prop.latitude,
//         lng: prop.public?.longitude ?? prop.longitude,
//         price: prop?.listing?.listPriceLow?.toString() ?? prop?.listPrice?.toString() ?? prop?.price?.toString() ?? '',
//         originalData: prop,
//       }))
//       : coord.map((c, index) => ({
//         id: c?.id !== undefined && c?.id !== null ? String(c.id) : undefined,
//         markerKey: toMarkerKey(c?.id, Number(c.lat), Number(c.lng), index),
//         lat: c.lat,
//         lng: c.lng,
//         price: c.price ?? '',
//         originalData: c,
//       }));

//     // Filter out undefined or invalid lat/lng
//     return raw.filter(
//       (m) =>
//         m.lat !== undefined &&
//         m.lng !== undefined &&
//         !isNaN(m.lat) &&
//         !isNaN(m.lng)
//     );
//   }, [properties, coord, useOverlayResultsRail]);

//   const computeMarkersInsideDrawPolygon = useCallback(
//     (polygon: google.maps.Polygon | null) => {
//       if (!polygon || !window.google?.maps?.geometry?.poly) return null;

//       const propertyIds = new Set<string>();
//       for (const marker of markers) {
//         const point = new google.maps.LatLng(marker.lat, marker.lng);
//         if (google.maps.geometry.poly.containsLocation(point, polygon)) {
//           if (marker.id) propertyIds.add(String(marker.id));
//         }
//       }
//       return { propertyIds: Array.from(propertyIds) };
//     },
//     [markers],
//   );

//   const applyDrawFilterFromPolygon = useCallback(
//     (polygon: google.maps.Polygon | null) => {
//       if (!polygon) {
//         setDrawFilteredMarkerIds(null);
//         if (lastDrawFilterIdsRef.current !== null) {
//           lastDrawFilterIdsRef.current = null;
//           onDrawFilterChangeRef.current?.(null);
//         }
//         return;
//       }

//       const filtered = computeMarkersInsideDrawPolygon(polygon);
//       const ids = filtered?.propertyIds ?? [];
//       setDrawFilteredMarkerIds(ids);

//       // Only notify parent when IDs actually changed  prevents infinite re-render loop
//       // where onDrawFilterChange ? parent re-render ? new markers ? this effect fires again
//       const prev = lastDrawFilterIdsRef.current;
//       const changed =
//         prev === null ||
//         prev.length !== ids.length ||
//         ids.some((id, i) => id !== prev[i]);
//       if (changed) {
//         lastDrawFilterIdsRef.current = ids;
//         onDrawFilterChangeRef.current?.(ids);
//       }
//     },
//     // onDrawFilterChange intentionally omitted  accessed via ref to keep this callback stable
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [computeMarkersInsideDrawPolygon],
//   );

//   const clearDrawPolygon = useCallback(() => {
//     freehandDrawingActiveRef.current = false;
//     freehandPathRef.current = [];
//     mobileTapDrawPointsRef.current = [];
//     if (freehandPreviewLineRef.current) {
//       freehandPreviewLineRef.current.setMap(null);
//       freehandPreviewLineRef.current = null;
//     }
//     if (drawPolygonRef.current) {
//       drawPolygonRef.current.setMap(null);
//     }
//     drawPolygonRef.current = null;
//     lastDrawFilterIdsRef.current = null;
//     setDrawPolygon(null);
//     setDrawFilteredMarkerIds(null);
//     onDrawFilterChangeRef.current?.(null);
//     setDrawMode(false);
//     // onDrawFilterChange accessed via ref ? empty deps ? stable reference.
//     // This is critical: the clearDrawSignal effect depends on clearDrawPolygon, and if
//     // clearDrawPolygon were recreated on every parent render (because onDrawFilterChange is
//     // an inline prop), the effect would fire on every render after clearDrawSignal is set,
//     // repeatedly cancelling any active draw.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;
//     const overlay = new google.maps.OverlayView();
//     overlay.onAdd = () => { };
//     overlay.draw = () => { };
//     overlay.onRemove = () => { };
//     overlay.setMap(mapInstance);
//     projectionOverlayRef.current = overlay;
//     return () => {
//       if (projectionOverlayRef.current === overlay) {
//         projectionOverlayRef.current = null;
//       }
//       overlay.setMap(null);
//     };
//   }, [isLoaded, mapInstance]);

//   const finalizeMobileTapDraw = useCallback(() => {
//     if (!isTouchDevice || !drawMode) return;
//     const path = [...mobileTapDrawPointsRef.current];
//     mobileTapDrawPointsRef.current = [];
//     if (freehandPreviewLineRef.current) {
//       freehandPreviewLineRef.current.setMap(null);
//       freehandPreviewLineRef.current = null;
//     }

//     if (!mapInstance || path.length < 3) {
//       setDrawMode(false);
//       return;
//     }

//     const polygon = new google.maps.Polygon({
//       paths: path,
//       map: mapInstance,
//     });
//     handlePolygonCompleteRef.current(polygon);
//   }, [isTouchDevice, drawMode, mapInstance]);

//   const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
//     freehandDrawingActiveRef.current = false;
//     freehandPathRef.current = [];
//     if (freehandPreviewLineRef.current) {
//       freehandPreviewLineRef.current.setMap(null);
//       freehandPreviewLineRef.current = null;
//     }

//     if (drawPolygonRef.current) {
//       drawPolygonRef.current.setMap(null);
//     }

//     polygon.setOptions({
//       editable: false,
//       draggable: false,
//       clickable: false,
//       fillColor: '#F57F2E',
//       fillOpacity: 0.16,
//       strokeColor: '#F57F2E',
//       strokeOpacity: 0.95,
//       strokeWeight: 2,
//       zIndex: 50,
//     });

//     drawPolygonRef.current = polygon;
//     setDrawPolygon(polygon);
//     setDrawMode(false);
//     applyDrawFilterFromPolygon(polygon);
//   }, [applyDrawFilterFromPolygon]);

//   // Always-current ref so the draw-mode effect can call the latest handlePolygonComplete
//   // without listing it as a dependency (which would cause the effect to re-run  and
//   // reset freehandDrawingActiveRef  whenever markers change during an active draw).
//   const handlePolygonCompleteRef = React.useRef(handlePolygonComplete);
//   handlePolygonCompleteRef.current = handlePolygonComplete;

//   const mapClientToLatLng = useCallback(
//     (clientX: number, clientY: number): google.maps.LatLngLiteral | null => {
//       if (!mapInstance) return null;
//       const overlay = projectionOverlayRef.current;
//       const projection = overlay?.getProjection?.();
//       if (!projection) return null;
//       const rect = mapInstance.getDiv()?.getBoundingClientRect?.();
//       if (!rect) return null;
//       const pixelPoint = new google.maps.Point(clientX - rect.left, clientY - rect.top);
//       const latLng = projection.fromContainerPixelToLatLng(pixelPoint);
//       return latLng ? latLng.toJSON() : null;
//     },
//     [mapInstance],
//   );

//   const pushTouchFreehandPoint = useCallback((point: google.maps.LatLngLiteral) => {
//     if (!mapInstance) return;
//     const path = freehandPathRef.current;
//     const last = path[path.length - 1];
//     if (last && google?.maps?.geometry?.spherical) {
//       const dist = google.maps.geometry.spherical.computeDistanceBetween(
//         new google.maps.LatLng(last.lat, last.lng),
//         new google.maps.LatLng(point.lat, point.lng),
//       );
//       if (dist < 6) return;
//     }
//     path.push(point);
//     if (!freehandPreviewLineRef.current) {
//       freehandPreviewLineRef.current = new google.maps.Polyline({
//         map: mapInstance,
//         path,
//         clickable: false,
//         strokeColor: '#F57F2E',
//         strokeOpacity: 0.95,
//         strokeWeight: 2,
//         zIndex: 50,
//       });
//       return;
//     }
//     freehandPreviewLineRef.current.setPath(path);
//   }, [mapInstance]);

//   const finalizeTouchFreehand = useCallback(() => {
//     if (!freehandDrawingActiveRef.current) return;
//     freehandDrawingActiveRef.current = false;
//     const path = [...freehandPathRef.current];
//     freehandPathRef.current = [];
//     if (freehandPreviewLineRef.current) {
//       freehandPreviewLineRef.current.setMap(null);
//       freehandPreviewLineRef.current = null;
//     }
//     if (!mapInstance || path.length < 3) return;
//     const polygon = new google.maps.Polygon({
//       paths: path,
//       map: mapInstance,
//     });
//     handlePolygonCompleteRef.current(polygon);
//   }, [mapInstance]);

//   const handleTouchDrawPointerDown = useCallback(
//     (event: React.PointerEvent<HTMLDivElement>) => {
//       if (!isTouchDevice || !drawMode) return;
//       if (event.pointerType === 'mouse' && event.button !== 0) return;
//       const point = mapClientToLatLng(event.clientX, event.clientY);
//       if (!point) return;
//       event.preventDefault();
//       touchDrawPointerActiveRef.current = true;
//       try {
//         event.currentTarget.setPointerCapture(event.pointerId);
//       } catch {
//         // ignore pointer capture errors
//       }
//       freehandDrawingActiveRef.current = true;
//       freehandPathRef.current = [];
//       if (freehandPreviewLineRef.current) {
//         freehandPreviewLineRef.current.setMap(null);
//         freehandPreviewLineRef.current = null;
//       }
//       pushTouchFreehandPoint(point);
//     },
//     [isTouchDevice, drawMode, mapClientToLatLng, pushTouchFreehandPoint],
//   );

//   const handleTouchDrawPointerMove = useCallback(
//     (event: React.PointerEvent<HTMLDivElement>) => {
//       if (!touchDrawPointerActiveRef.current || !drawMode) return;
//       const point = mapClientToLatLng(event.clientX, event.clientY);
//       if (!point) return;
//       event.preventDefault();
//       pushTouchFreehandPoint(point);
//     },
//     [drawMode, mapClientToLatLng, pushTouchFreehandPoint],
//   );

//   const handleTouchDrawPointerUp = useCallback(
//     (event: React.PointerEvent<HTMLDivElement>) => {
//       if (!touchDrawPointerActiveRef.current) return;
//       touchDrawPointerActiveRef.current = false;
//       try {
//         event.currentTarget.releasePointerCapture(event.pointerId);
//       } catch {
//         // ignore pointer capture errors
//       }
//       finalizeTouchFreehand();
//     },
//     [finalizeTouchFreehand],
//   );

//   useEffect(() => {
//     if (drawMode) return;
//     touchDrawPointerActiveRef.current = false;
//     freehandDrawingActiveRef.current = false;
//     freehandPathRef.current = [];
//     mobileTapDrawPointsRef.current = [];
//     if (freehandPreviewLineRef.current) {
//       freehandPreviewLineRef.current.setMap(null);
//       freehandPreviewLineRef.current = null;
//     }

//     // Google Maps sometimes keeps the crosshair cursor after drawing finishes.
//     // Reset cursors explicitly so the UI does not look like draw mode is still active.
//     try {
//       mapInstance?.setOptions({
//         draggableCursor: 'grab',
//         draggingCursor: 'grabbing',
//       });
//     } catch {
//       // no-op
//     }
//   }, [drawMode, mapInstance]);

//   useEffect(() => {
//     if (!mapInstance) return;
//     try {
//       mapInstance.setOptions({
//         draggableCursor: drawMode ? 'crosshair' : 'grab',
//         draggingCursor: drawMode ? 'crosshair' : 'grabbing',
//       });
//     } catch {
//       // no-op
//     }
//   }, [drawMode, mapInstance]);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance || !drawMode) return;

//     const listeners: google.maps.MapsEventListener[] = [];

//     const minPointDistanceMeters = 10;

//     const startFreehand = (point: google.maps.LatLngLiteral) => {
//       freehandDrawingActiveRef.current = true;
//       freehandPathRef.current = [];

//       if (freehandPreviewLineRef.current) {
//         freehandPreviewLineRef.current.setMap(null);
//         freehandPreviewLineRef.current = null;
//       }

//       pushPoint(point);
//     };

//     const pushPoint = (point: google.maps.LatLngLiteral) => {
//       const path = freehandPathRef.current;
//       const last = path[path.length - 1];
//       if (last && google?.maps?.geometry?.spherical) {
//         const dist = google.maps.geometry.spherical.computeDistanceBetween(
//           new google.maps.LatLng(last.lat, last.lng),
//           new google.maps.LatLng(point.lat, point.lng),
//         );
//         if (dist < minPointDistanceMeters) return;
//       }

//       path.push(point);

//       if (!freehandPreviewLineRef.current) {
//         freehandPreviewLineRef.current = new google.maps.Polyline({
//           map: mapInstance,
//           path,
//           clickable: false,
//           strokeColor: '#F57F2E',
//           strokeOpacity: 0.95,
//           strokeWeight: 2,
//           zIndex: 50,
//         });
//         return;
//       }

//       freehandPreviewLineRef.current.setPath(path);
//     };

//     const finalizeFreehandPolygon = () => {
//       if (!freehandDrawingActiveRef.current) return;
//       freehandDrawingActiveRef.current = false;

//       const path = [...freehandPathRef.current];
//       freehandPathRef.current = [];

//       if (freehandPreviewLineRef.current) {
//         freehandPreviewLineRef.current.setMap(null);
//         freehandPreviewLineRef.current = null;
//       }

//       if (path.length < 3) {
//         return;
//       }

//       const polygon = new google.maps.Polygon({
//         paths: path,
//         map: mapInstance,
//       });

//       handlePolygonCompleteRef.current(polygon);
//     };

//     listeners.push(
//       mapInstance.addListener('mousedown', (event: google.maps.MapMouseEvent) => {
//         if (!drawMode || !event?.latLng) return;
//         startFreehand(event.latLng.toJSON());
//       }),
//     );

//     listeners.push(
//       mapInstance.addListener('mousemove', (event: google.maps.MapMouseEvent) => {
//         if (!drawMode || !event?.latLng) return;
//         if (!freehandDrawingActiveRef.current) {
//           const domEvent = event.domEvent as MouseEvent | undefined;
//           const leftButtonHeld =
//             !!domEvent &&
//             (typeof domEvent.buttons === 'number'
//               ? (domEvent.buttons & 1) === 1
//               : domEvent.button === 0);

//           if (!leftButtonHeld) return;
//           startFreehand(event.latLng.toJSON());
//           return;
//         }

//         pushPoint(event.latLng.toJSON());
//       }),
//     );

//     listeners.push(
//       mapInstance.addListener('mousemove', (event: google.maps.MapMouseEvent) => {
//         if (!drawMode || !freehandDrawingActiveRef.current || !event?.latLng) return;
//         pushPoint(event.latLng.toJSON());
//       }),
//     );

//     listeners.push(
//       mapInstance.addListener('mouseup', () => {
//         finalizeFreehandPolygon();
//       }),
//     );

//     const handleWindowMouseUp = () => {
//       finalizeFreehandPolygon();
//     };
//     window.addEventListener('mouseup', handleWindowMouseUp);

//     return () => {
//       listeners.forEach((listener) => google.maps.event.removeListener(listener));
//       window.removeEventListener('mouseup', handleWindowMouseUp);
//       freehandDrawingActiveRef.current = false;
//       freehandPathRef.current = [];
//       mobileTapDrawPointsRef.current = [];
//       if (freehandPreviewLineRef.current) {
//         freehandPreviewLineRef.current.setMap(null);
//         freehandPreviewLineRef.current = null;
//       }
//     };
//     // handlePolygonComplete intentionally omitted from deps  accessed via ref so the effect
//     // doesn't re-run (and reset freehandDrawingActiveRef) when markers change mid-draw.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isLoaded, mapInstance, drawMode]);

//   useEffect(() => {
//     if (!drawPolygonRef.current) return;
//     applyDrawFilterFromPolygon(drawPolygonRef.current);
//   }, [markers, applyDrawFilterFromPolygon]);

//   useEffect(() => {
//     if (!clearDrawSignal) return;
//     clearDrawPolygon();
//   }, [clearDrawSignal, clearDrawPolygon]);

//   const markerVisibilityMap = useMemo(() => {
//     const activePolygon = drawPolygonRef.current ?? drawPolygon;
//     if (!activePolygon || !window.google?.maps?.geometry?.poly) return null;
//     const visibility = new Map<string, boolean>();
//     for (const marker of markers) {
//       const point = new google.maps.LatLng(marker.lat, marker.lng);
//       visibility.set(
//         marker.markerKey,
//         google.maps.geometry.poly.containsLocation(point, activePolygon),
//       );
//     }
//     return visibility;
//   }, [markers, drawPolygon]);

//   useEffect(() => {
//     const activePolygon = drawPolygonRef.current ?? drawPolygon;
//     if (!selectedMarker || !activePolygon || !window.google?.maps?.geometry?.poly) return;
//     const point = new google.maps.LatLng(selectedMarker.lat, selectedMarker.lng);
//     const stillInside = google.maps.geometry.poly.containsLocation(point, activePolygon);
//     if (!stillInside) {
//       setSelectedMarker(null);
//     }
//   }, [drawPolygon, selectedMarker]);

//   useEffect(() => {
//     return () => {
//       if (freehandPreviewLineRef.current) {
//         freehandPreviewLineRef.current.setMap(null);
//       }
//       if (drawPolygonRef.current) {
//         drawPolygonRef.current.setMap(null);
//       }
//     };
//   }, []);

//   const recentDataClickRef = React.useRef(false);

//   useEffect(() => {
//     let cancelled = false;

//     const loadDistricts = async () => {
//       try {
//         const response = await fetch('/data/California_School_District_Areas_2024-25.geojson');
//         if (!response.ok) throw new Error(`Failed to load districts (${response.status})`);
//         const data = await response.json();
//         if (!cancelled && data?.features) {
//           setDistrictFeatures(data.features as DistrictFeature[]);
//         }
//       } catch (err: any) {
//         if (!cancelled) {
//           console.error('Failed to load district GeoJSON:', err);
//           setDistrictsLoadingError(err?.message ?? 'Failed to load districts');
//         }
//       }
//     };

//     loadDistricts();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const getDistrictId = useCallback((feature: DistrictFeature) => {
//     const props = feature.properties || {};
//     return (
//       props.CDCode ||
//       props.CDSCode ||
//       props.FedID ||
//       props.OBJECTID ||
//       `${props.DistrictName ?? 'district'}-${props.CountyName ?? 'county'}`
//     );
//   }, []);

//   const toLatLngLiteral = (coord: number[]) => ({
//     lat: coord[1],
//     lng: coord[0],
//   });

//   const getFeatureBounds = useCallback((feature: DistrictFeature) => {
//     const geometry = feature.geometry;
//     const bounds: google.maps.LatLngBounds[] = [];

//     if (!geometry) return bounds;

//     const processPolygon = (coords: number[][][]) => {
//       if (coords.length === 0) return;
//       const polyBounds = new google.maps.LatLngBounds();
//       coords[0].forEach((coord) => polyBounds.extend({ lat: coord[1], lng: coord[0] }));
//       bounds.push(polyBounds);
//     };

//     if (geometry.type === 'Polygon') {
//       processPolygon(geometry.coordinates as number[][][]);
//     } else if (geometry.type === 'MultiPolygon') {
//       (geometry.coordinates as number[][][][]).forEach(processPolygon);
//     }

//     return bounds;
//   }, []);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance || districtFeatures.length === 0) return;

//     const cache = districtPolygonCacheRef.current;
//     districtFeatures.forEach((feature) => {
//       const id = getDistrictId(feature);
//       if (!cache.has(id)) {
//         const bounds = getFeatureBounds(feature);
//         const polygons: google.maps.Polygon[] = [];
//         const geometry = feature.geometry;

//         if (geometry) {
//           const processPolygon = (coords: number[][][]) => {
//             const path = coords[0].map((c) => ({ lat: c[1], lng: c[0] }));
//             polygons.push(new google.maps.Polygon({ paths: path }));
//           };

//           if (geometry.type === "Polygon") {
//             processPolygon(geometry.coordinates as number[][][]);
//           } else if (geometry.type === "MultiPolygon") {
//             (geometry.coordinates as number[][][][]).forEach(processPolygon);
//           }
//         }

//         cache.set(id, { id, feature, bounds, polygons });
//       }
//     });
//   }, [isLoaded, mapInstance, districtFeatures, getDistrictId, getFeatureBounds]);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance || districtFeatures.length === 0) return;

//     // Show districts ONLY if the Schools overlay is explicitly ON.
//     const isSchoolsActive = showDistricts;
//     if (!isSchoolsActive) {
//       setMatchedDistricts([]);
//       return;
//     }

//     if (!google?.maps?.geometry?.poly?.containsLocation) {
//       console.error('[districts] geometry library missing. Check maps loader libraries.');
//       return;
//     }

//     const cache = districtPolygonCacheRef.current;
//     const viewportBounds = mapInstance.getBounds();
//     const matchedIds = new Set<string>();
//     const matched: DistrictFeature[] = [];

//     for (const feature of districtFeatures) {
//       const id = getDistrictId(feature);
//       const cached = cache.get(id);
//       if (!cached) continue;

//       let isRelevant = false;

//       // 1. Check if any property marker is inside this district (approximate for performance)
//       for (const marker of markers) {
//         const point = { lat: marker.lat, lng: marker.lng };
//         for (const polyBounds of cached.bounds) {
//           if (polyBounds.contains(point)) {
//             isRelevant = true;
//             break;
//           }
//         }
//         if (isRelevant) break;
//       }


//       if (isRelevant) {
//         matchedIds.add(id);
//         matched.push(feature);
//       }
//     }

//     setMatchedDistricts(matched);
//   }, [
//     isLoaded,
//     mapInstance,
//     markers,
//     showDistricts,
//     activeCategoryKeys,
//     exploreSearchInput,
//     districtFeatures,
//     getDistrictId,
//     mapViewport,
//   ]);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;

//     mapInstance.data.forEach((feature) => mapInstance.data.remove(feature));

//     const isSchoolsActive = showDistricts;
//     if (!isSchoolsActive || matchedDistricts.length === 0) return;

//     mapInstance.data.addGeoJson({
//       type: 'FeatureCollection',
//       features: matchedDistricts,
//     } as GeoJSON.FeatureCollection);

//     mapInstance.data.setStyle({
//       fillColor: '#1d4ed8',
//       fillOpacity: 0,
//       strokeColor: '#1d4ed8',
//       strokeWeight: 2,
//     });
//   }, [isLoaded, mapInstance, matchedDistricts, showDistricts, activeCategoryKeys, exploreSearchInput]);

//   const formatMarkerPriceCompact = (value?: number) => {
//     if (!Number.isFinite(value as number) || !value || value <= 0) return '$0';
//     const n = value as number;

//     if (n >= 1_000_000) {
//       const millions = n / 1_000_000;
//       return `$${millions >= 10 ? Math.round(millions) : millions.toFixed(1).replace(/\\.0$/, '')}M`;
//     }

//     if (n >= 1_000) {
//       const thousands = n / 1_000;
//       return `$${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1).replace(/\\.0$/, '')}k`;
//     }

//     return formatCurrency(n);
//   };

//   const createDotMarker = (isSelected?: boolean) => {
//     const markerFill = isSelected ? '#F07639' : '#2C2C2E';
//     const svg = `
// <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//   <circle cx="12" cy="12" r="8" fill="${markerFill}" stroke="#FFFFFF" stroke-width="3" />
// </svg>
// `;
//     return {
//       url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
//       scaledSize: new google.maps.Size(16, 16),
//       anchor: new google.maps.Point(8, 8),
//     };
//   };

//   const createCustomMarker = (price?: string, isSelected?: boolean, isHovered?: boolean) => {
//     const isActive = Boolean(isSelected || isHovered);
//     if (currentMapZoom <= 11 && !isActive) {
//       return createDotMarker(isActive);
//     }

//     const formattedPrice = formatMarkerPriceCompact(parseFloat(price || '0'));
//     const approxCharWidth = isActive ? 10.2 : 9.8;
//     const horizontalPadding = isActive ? 30 : 26;
//     const minBubbleWidth = isActive ? 84 : 76;
//     const maxBubbleWidth = isActive ? 138 : 124;
//     const bubbleWidth = Math.max(
//       minBubbleWidth,
//       Math.min(maxBubbleWidth, Math.round(formattedPrice.length * approxCharWidth + horizontalPadding))
//     );

//     const svgWidth = bubbleWidth + 24;
//     const svgHeight = 58;
//     const rectX = Math.round((svgWidth - bubbleWidth) / 2);
//     const centerX = Math.round(svgWidth / 2);
//     const rectY = 6;
//     const rectHeight = isActive ? 38 : 34;
//     const rectRadius = Math.round(rectHeight / 2);
//     const fontSize = isActive ? 16 : 15;

//     const svg = `
// <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
//   <defs>
//     <filter id="pillShadow" x="-30%" y="-50%" width="160%" height="220%">
//       <feDropShadow dx="0" dy="2" stdDeviation="${isActive ? 3 : 2.2}" flood-color="#000000" flood-opacity="${isActive ? 0.2 : 0.14}" />
//     </filter>
//   </defs>
//   <rect
//     x="${rectX}"
//     y="${rectY}"
//     width="${bubbleWidth}"
//     height="${rectHeight}"
//     rx="${rectRadius}"
//     ry="${rectRadius}"
//     fill="#FFFFFF"
//     stroke="${isActive ? '#F07639' : '#D4D4D8'}"
//     stroke-width="${isActive ? 2 : 1}"
//     filter="url(#pillShadow)"
//   />
//   <text x="${centerX}" y="${rectY + Math.round(rectHeight / 2) + 1}" fill="#111827" font-size="${fontSize}" font-family="sans-serif" font-weight="700" text-anchor="middle" alignment-baseline="middle">
//     ${formattedPrice}
//   </text>
// </svg>
// `;
//     const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

//     const bubbleScale = isActive ? 92 : 84;
//     const bubbleHeight = isActive ? 52 : 46;
//     const anchorX = Math.round(bubbleScale / 2);
//     const anchorY = isActive ? 46 : 40;

//     return {
//       url: svgUrl,
//       scaledSize: new google.maps.Size(bubbleScale, bubbleHeight),
//       anchor: new google.maps.Point(anchorX, anchorY),
//     };
//   };

//   const CATEGORY_SVG_MARKER_SIZE = 38;

//   const createCategoryPinIcon = (color: string, categoryKey?: string) => {
//     const assetByCategory: Record<string, string> = {
//       restaurants: '/assets/icons/Restaurants.svg',
//       gyms: '/assets/icons/Gym.svg',
//       schools: '/assets/icons/Education.svg',
//     };

//     const assetUrl = categoryKey ? assetByCategory[categoryKey] : undefined;

//     // Procedural generation for Hospitals / Parks / Fallbacks
//     const getIconContent = (key?: string) => {
//       if (key === 'hospitals') return '<path d="M20 10v20M10 20h20" stroke="white" stroke-width="4" stroke-linecap="round"/>';
//       if (key === 'parks') return '<path d="M20 8l-10 16h6v10h8v-10h6l-10-16z" fill="white"/>';
//       return `<text x="20" y="21" font-size="20" font-family="sans-serif" font-weight="900" fill="white" text-anchor="middle" alignment-baseline="middle">${key?.charAt(0).toUpperCase() || '?'}</text>`;
//     };

//     const svg = `
// <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <circle cx="20" cy="20" r="19" fill="${color}" stroke="white" stroke-width="1.5"/>
//   <path d="M22.1935 44.8046C21.4094 46.0526 19.5906 46.0526 18.8065 44.8046L6.40362 25.064C5.56679 23.7321 6.52412 22 8.09711 22L32.9029 22C34.4759 22 35.4332 23.7321 34.5964 25.064L22.1935 44.8046Z" fill="white"/>
//   ${assetUrl
//         ? `<image href="${assetUrl}" x="10" y="10" height="20" width="20" />`
//         : getIconContent(categoryKey)
//       }
// </svg>`;

//     return {
//       url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
//       scaledSize: new google.maps.Size(CATEGORY_SVG_MARKER_SIZE, CATEGORY_SVG_MARKER_SIZE * 1.25),
//       anchor: new google.maps.Point(
//         Math.round(CATEGORY_SVG_MARKER_SIZE / 2),
//         Math.round(CATEGORY_SVG_MARKER_SIZE * 1.25),
//       ),
//     };
//   };

//   const formatWeeklyHours = (weekdayText?: string[]) => {
//     if (!weekdayText || weekdayText.length === 0) return undefined;

//     const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//     const dayShort: Record<string, string> = {
//       Monday: 'Mon',
//       Tuesday: 'Tue',
//       Wednesday: 'Wed',
//       Thursday: 'Thu',
//       Friday: 'Fri',
//       Saturday: 'Sat',
//       Sunday: 'Sun',
//     };

//     const parsed = weekdayText
//       .map((line) => {
//         const [day, rest] = line.split(': ');
//         if (!day || !rest) return null;
//         const times = rest.replace(/\u2013|\u2014/g, '-').replace(/\s+/g, ' ').trim();
//         if (times.toLowerCase().startsWith('closed')) return null;
//         return {
//           day,
//           short: dayShort[day] ?? day,
//           index: dayOrder.indexOf(day),
//           times,
//         };
//       })
//       .filter((item): item is { day: string; short: string; index: number; times: string } => !!item)
//       .sort((a, b) => a.index - b.index);

//     if (parsed.length === 0) return undefined;

//     const groups: { start: string; end: string; times: string }[] = [];
//     let current = { start: parsed[0].short, end: parsed[0].short, times: parsed[0].times };
//     for (let i = 1; i < parsed.length; i += 1) {
//       const prev = parsed[i - 1];
//       const next = parsed[i];
//       const isConsecutive = prev.index + 1 === next.index;
//       const sameTimes = next.times === current.times;
//       if (isConsecutive && sameTimes) current.end = next.short;
//       else {
//         groups.push(current);
//         current = { start: next.short, end: next.short, times: next.times };
//       }
//     }
//     groups.push(current);

//     return groups.map((group) =>
//       group.start === group.end ? `${group.start}: ${group.times}` : `${group.start}-${group.end}: ${group.times}`,
//     );
//   };

//   const fetchPlaceDetails = useCallback(
//     (
//       placeId: string,
//       position: google.maps.LatLngLiteral,
//       fallback: { name: string; rating?: number; total?: number },
//       setState: React.Dispatch<React.SetStateAction<PlaceDetailsState | null>>,
//       requestRef: React.MutableRefObject<number>,
//     ) => {
//       if (!mapInstance) return;
//       const currentRequest = ++requestRef.current;
//       setState({ ...fallback, position, isLoading: true });

//       const service = new google.maps.places.PlacesService(mapInstance);
//       service.getDetails(
//         {
//           placeId,
//           fields: [
//             'name',
//             'rating',
//             'user_ratings_total',
//             'formatted_phone_number',
//             'formatted_address',
//             'photos',
//             'editorial_summary',
//             'opening_hours',
//             'website',
//           ],
//         },
//         (place, status) => {
//           if (currentRequest !== requestRef.current) return;
//           if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
//             setState({ ...fallback, placeId, position });
//             return;
//           }

//           const placeAny = place as any;
//           setState({
//             placeId,
//             name: place.name ?? fallback.name,
//             rating: place.rating ?? fallback.rating,
//             total: place.user_ratings_total ?? fallback.total,
//             phone: place.formatted_phone_number ?? undefined,
//             website: place.website ?? undefined,
//             address: place.formatted_address ?? undefined,
//             summary: placeAny?.editorial_summary?.overview ?? undefined,
//             photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 480, maxHeight: 300 }),
//             openNow: place.opening_hours?.open_now ?? undefined,
//             weeklyHours: formatWeeklyHours(place.opening_hours?.weekday_text),
//             position,
//           });
//         },
//       );
//     },
//     [mapInstance],
//   );

//   useEffect(() => {
//     activeCategoryKeysRef.current = new Set(activeCategoryKeys);
//   }, [activeCategoryKeys]);

//   const clearSearchMarkers = useCallback(() => {
//     searchMarkersRef.current.forEach((marker) => marker.setMap(null));
//     searchMarkersRef.current = [];
//     setSelectedSearchPlace((prev) => (prev?.categoryKey ? prev : null));
//   }, []);

//   const clearCategoryMarkers = useCallback((categoryKey: string) => {
//     const existing = categoryMarkersRef.current[categoryKey] ?? [];
//     existing.forEach((marker) => marker.setMap(null));
//     categoryMarkersRef.current[categoryKey] = [];
//     setSelectedSearchPlace((prev) => (prev?.categoryKey === categoryKey ? null : prev));
//   }, []);

//   const clearAllCategoryMarkers = useCallback(() => {
//     Object.keys(categoryMarkersRef.current).forEach((key) => clearCategoryMarkers(key));
//   }, [clearCategoryMarkers]);

//   const clearAllExploreMarkers = useCallback(() => {
//     clearSearchMarkers();
//     clearAllCategoryMarkers();
//   }, [clearSearchMarkers, clearAllCategoryMarkers]);

//   const attachPlaceMarkerClick = useCallback(
//     (
//       place: google.maps.places.PlaceResult,
//       position: google.maps.LatLngLiteral,
//       setState: React.Dispatch<React.SetStateAction<SearchPlaceDetails | null>>,
//       categoryKey?: string,
//     ) => {
//       if (place.place_id) {
//         const wrappedSetter = ((value: PlaceDetailsState | null) => {
//           setState(value ? { ...value, categoryKey } : value);
//         }) as unknown as React.Dispatch<React.SetStateAction<PlaceDetailsState | null>>;
//         fetchPlaceDetails(
//           place.place_id,
//           position,
//           {
//             name: place.name ?? 'Place',
//             rating: place.rating ?? undefined,
//             total: place.user_ratings_total ?? undefined,
//           },
//           wrappedSetter,
//           searchDetailsRequestRef,
//         );
//       } else {
//         setState({
//           name: place.name ?? 'Place',
//           rating: place.rating ?? undefined,
//           total: place.user_ratings_total ?? undefined,
//           position,
//           categoryKey,
//         });
//       }
//     },
//     [fetchPlaceDetails],
//   );

//   const runCategorySearch = useCallback(
//     (
//       query: string,
//       opts: {
//         categoryKey: string;
//         iconColor?: string;
//         viewportOverride?: google.maps.LatLngBounds | null;
//       },
//     ) => {
//       if (!mapInstance) return;
//       const viewportBounds = opts.viewportOverride ?? mapInstance.getBounds();
//       if (!viewportBounds) return;

//       const service = new google.maps.places.PlacesService(mapInstance);
//       const results: google.maps.places.PlaceResult[] = [];
//       const requestId = (categoryRequestIdRef.current[opts.categoryKey] ?? 0) + 1;
//       categoryRequestIdRef.current[opts.categoryKey] = requestId;

//       const handlePage = (
//         pageResults: google.maps.places.PlaceResult[] | null,
//         status: google.maps.places.PlacesServiceStatus,
//         pagination: google.maps.places.PlaceSearchPagination | null,
//       ) => {
//         if (status === google.maps.places.PlacesServiceStatus.OK && pageResults) {
//           results.push(...pageResults);
//         }

//         if (pagination?.hasNextPage) {
//           setTimeout(() => pagination.nextPage(), 1000);
//           return;
//         }

//         if (requestId !== categoryRequestIdRef.current[opts.categoryKey]) return;
//         if (!activeCategoryKeysRef.current.has(opts.categoryKey)) return;

//         const icon = createCategoryPinIcon(opts.iconColor ?? '#ef4444', opts.categoryKey);

//         clearCategoryMarkers(opts.categoryKey);

//         const builtMarkers = results.map((place) => {
//           const loc = place.geometry?.location;
//           if (!loc || !viewportBounds.contains(loc)) return null;

//           const marker = new google.maps.Marker({
//             map: mapInstance,
//             position: loc,
//             title: place.name ?? 'Place',
//             icon,
//             zIndex: 1100,
//             visible: isPointInsideActiveDrawPolygon(loc),
//           });

//           marker.addListener('click', () => {
//             const position = { lat: loc.lat(), lng: loc.lng() };
//             if (!measureModeRef.current) centerOnMeasurePoint(position);
//             applyMeasurePointFromMarker(position, 'poi');
//             attachPlaceMarkerClick(place, position, setSelectedSearchPlace, opts.categoryKey);
//           });
//           return marker;
//         }).filter(Boolean) as google.maps.Marker[];

//         categoryMarkersRef.current[opts.categoryKey] = builtMarkers;
//       };

//       service.nearbySearch(
//         {
//           location: viewportBounds.getCenter(),
//           radius: Math.min(50000, google.maps.geometry.spherical.computeDistanceBetween(viewportBounds.getCenter(), viewportBounds.getNorthEast())),
//           type: opts.categoryKey === 'restaurants' ? 'restaurant' :
//             opts.categoryKey === 'gyms' ? 'gym' :
//               opts.categoryKey === 'hospitals' ? 'hospital' :
//                 opts.categoryKey === 'parks' ? 'park' : undefined,
//           keyword: query,
//         },
//         handlePage
//       );
//     },
//     [
//       applyMeasurePointFromMarker,
//       attachPlaceMarkerClick,
//       centerOnMeasurePoint,
//       clearCategoryMarkers,
//       isPointInsideActiveDrawPolygon,
//       mapInstance,
//     ]
//   );

//   const runTextSearch = useCallback(
//     (
//       query: string,
//       opts?: {
//         onStoreMarkers?: (markers: google.maps.Marker[]) => void;
//         viewportOverride?: google.maps.LatLngBounds | null;
//       },
//     ) => {
//       if (!mapInstance) return;
//       const trimmed = query.trim();
//       if (!trimmed) return;
//       const viewportBounds = opts?.viewportOverride ?? mapInstance.getBounds();
//       if (!viewportBounds) return;

//       const locationBounds = searchPlaceBoundsRef.current;
//       const service = new google.maps.places.PlacesService(mapInstance);
//       const results: google.maps.places.PlaceResult[] = [];
//       const requestId = ++searchRequestIdRef.current;

//       const handlePage = (
//         pageResults: google.maps.places.PlaceResult[] | null,
//         status: google.maps.places.PlacesServiceStatus,
//         pagination: google.maps.places.PlaceSearchPagination | null,
//       ) => {
//         if (status === google.maps.places.PlacesServiceStatus.OK && pageResults) {
//           results.push(...pageResults);
//         }

//         if (pagination?.hasNextPage) {
//           setTimeout(() => pagination.nextPage(), 1500);
//           return;
//         }

//         if (requestId !== searchRequestIdRef.current) return;

//         const icon = createCategoryPinIcon('#ef4444');
//         const filteredByViewport = results.filter((place) => {
//           const location = place.geometry?.location;
//           if (!location) return false;
//           if (!viewportBounds.contains(location)) return false;
//           return true;
//         });
//         const filtered = filteredByViewport.filter((place) => {
//           const location = place.geometry?.location;
//           if (!location) return false;
//           if (locationBounds && !locationBounds.contains(location)) return false;
//           return true;
//         });
//         const finalFiltered = filtered.length > 0 ? filtered : filteredByViewport;

//         clearSearchMarkers();

//         const builtMarkers = finalFiltered.map((place) => {
//           const loc = place.geometry?.location;
//           if (!loc) return null;
//           const marker = new google.maps.Marker({
//             map: mapInstance,
//             position: loc,
//             title: place.name ?? 'Place',
//             icon,
//             zIndex: 1100,
//             visible: isPointInsideActiveDrawPolygon(loc),
//           });
//           marker.addListener('click', () => {
//             setClickedDistrictName(null);
//             setSelectedSchool(null);
//             const position = { lat: loc.lat(), lng: loc.lng() };
//             const current = selectedSearchPlaceRef.current;
//             const sameSelected =
//               !!current &&
//               ((place.place_id && current.placeId && current.placeId === place.place_id) ||
//                 (current.position?.lat === position.lat &&
//                   current.position?.lng === position.lng));

//             if (sameSelected) {
//               searchDetailsRequestRef.current += 1;
//               setSelectedSearchPlace(null);
//               return;
//             }

//             if (!measureModeRef.current) centerOnMeasurePoint(position);
//             applyMeasurePointFromMarker(position, 'poi');
//             attachPlaceMarkerClick(place, position, setSelectedSearchPlace);
//           });
//           return marker;
//         }).filter(Boolean) as google.maps.Marker[];

//         searchMarkersRef.current = builtMarkers;

//         setExploreFeedback(
//           builtMarkers.length === 0
//             ? 'No places found in the current map view. Try a POI term like coffee, grocery, or park.'
//             : null,
//         );

//         opts?.onStoreMarkers?.(builtMarkers);
//       };

//       service.textSearch({ query: trimmed, bounds: viewportBounds }, handlePage);
//     },
//     [
//       applyMeasurePointFromMarker,
//       attachPlaceMarkerClick,
//       centerOnMeasurePoint,
//       clearSearchMarkers,
//       isPointInsideActiveDrawPolygon,
//       mapInstance,
//     ],
//   );

//   const refreshExplorePlaces = useCallback((viewportOverride?: google.maps.LatLngBounds) => {
//     if (!mapInstance) return;
//     const bounds = viewportOverride ?? mapInstance.getBounds();
//     if (!bounds) return;

//     // Refresh active categories
//     activeCategoryKeys.forEach((key) => {
//       const cfg = quickCategories[key as keyof typeof quickCategories];
//       runCategorySearch(cfg.query, {
//         categoryKey: key,
//         iconColor: cfg.color,
//         viewportOverride: bounds,
//       });
//     });

//     // Refresh text search
//     const query = exploreSearchInput.trim();
//     if (query) {
//       runTextSearch(query, { viewportOverride: bounds });
//     }
//   }, [mapInstance, activeCategoryKeys, quickCategories, runTextSearch, exploreSearchInput]);


//   const extractPlaceQuery = useCallback((rawQuery: string) => {
//     const trimmed = rawQuery.trim();
//     if (!trimmed) return '';

//     // Try to capture the trailing location phrase after common prepositions.
//     const match = trimmed.match(/\b(?:in|near|around|at)\s+(.+)$/i);
//     if (match && match[1]) return match[1].trim();

//     return trimmed;
//   }, []);

//   const extractLastLocationPhrase = useCallback((rawQuery: string) => {
//     const trimmed = rawQuery.trim();
//     if (!trimmed) return '';
//     const tokens = trimmed.split(/\b(?:in|near|around|at)\b/gi);
//     if (tokens.length < 2) return trimmed;
//     return tokens[tokens.length - 1].trim();
//   }, []);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;

//     const trimmedQuery = extractPlaceQuery(searchQuery || '');
//     const lastLocation = extractLastLocationPhrase(searchQuery || '');
//     if (!trimmedQuery) return;

//     const service = new google.maps.places.PlacesService(mapInstance);
//     const updateSearchBounds = (geometry?: google.maps.places.PlaceGeometry | null) => {
//       if (!geometry) {
//         searchPlaceBoundsRef.current = null;
//         return;
//       }
//       if (geometry.viewport) {
//         searchPlaceBoundsRef.current = geometry.viewport;
//         return;
//       }
//       const location = geometry.location;
//       if (location) {
//         const bounds = new google.maps.LatLngBounds();
//         bounds.extend(location);
//         searchPlaceBoundsRef.current = bounds;
//         return;
//       }
//       searchPlaceBoundsRef.current = null;
//     };
//     const focusQueryGeometry = (geometry?: google.maps.places.PlaceGeometry | null) => {
//       if (!geometry || !mapInstance) return;
//       suppressNextOnIdleRef.current = true;
//       userMovedMapRef.current = false;
//       if (geometry.viewport) {
//         mapInstance.fitBounds(geometry.viewport, 50);
//         return;
//       }
//       const location = geometry.location;
//       if (location) {
//         mapInstance.panTo(location);
//         mapInstance.setZoom(Math.max(zoom, 12));
//       }
//     };

//     service.findPlaceFromQuery(
//       {
//         query: trimmedQuery,
//         fields: ['place_id', 'name', 'types', 'geometry'],
//       },
//       (results, status) => {
//         if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
//           const place = results[0];
//           const types = place.types ?? [];
//           const isAdmin =
//             types.includes('administrative_area_level_1') ||
//             types.includes('administrative_area_level_2') ||
//             types.includes('locality') ||
//             types.includes('postal_town') ||
//             types.includes('sublocality') ||
//             types.includes('neighborhood') ||
//             types.includes('political');

//           if (isAdmin) {
//             setSelectedPlaceId(place?.place_id ?? null);
//             updateSearchBounds(place?.geometry ?? null);
//             focusQueryGeometry(place?.geometry ?? null);
//             return;
//           }
//         }

//         // Fallback to geocoder if Places doesn't return a place id
//         const geocoder = new google.maps.Geocoder();
//         geocoder.geocode({ address: lastLocation || trimmedQuery }, (geoResults, geoStatus) => {
//           if (geoStatus !== 'OK' || !geoResults || geoResults.length === 0) {
//             console.warn('[place-boundary] place search + geocode failed:', status, geoStatus);
//             return;
//           }

//           setSelectedPlaceId(geoResults[0]?.place_id ?? null);
//           updateSearchBounds(geoResults[0]?.geometry ?? null);
//           focusQueryGeometry(geoResults[0]?.geometry ?? null);
//         });
//       },
//     );
//   }, [isLoaded, mapInstance, searchQuery, extractPlaceQuery, extractLastLocationPhrase, zoom]);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;

//     // Modified by Abhradip Paul showing typescript error
//     const stateLayer = mapInstance.getFeatureLayer(
//       google.maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_1
//     );
//     const countyLayer = mapInstance.getFeatureLayer(
//       google.maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_2
//     );
//     const cityLayer = mapInstance.getFeatureLayer(
//       google.maps.FeatureType.LOCALITY
//     );

//     // const stateLayer = mapInstance.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_1');
//     // const countyLayer = mapInstance.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_2');
//     // const cityLayer = mapInstance.getFeatureLayer('LOCALITY');

//     featureLayersRef.current = {
//       state: stateLayer,
//       county: countyLayer,
//       city: cityLayer,
//     };

//   }, [isLoaded, mapInstance]);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;

//     const { state, county, city } = featureLayersRef.current;
//     // Modified by Abhradip Paul showing typescript error
//     const styleFn = (options: any) => {
//       const isSelected = options.feature.placeId === selectedPlaceId;
//       const isSchoolsActive = showDistricts;
//       const isExploreActive = activeCategoryKeys.length > 0 || exploreSearchInput.trim().length > 0;

//       // Determine the color for the locality border based on the active category
//       let exploreColor = '#1d4ed8'; // Default blue
//       if (activeCategoryKeys.length > 0) {
//         const lastKey = activeCategoryKeys[activeCategoryKeys.length - 1] as keyof typeof quickCategories;
//         if (quickCategories[lastKey]) {
//           exploreColor = quickCategories[lastKey].color;
//         }
//       }

//       if (options.feature.featureType === google.maps.FeatureType.LOCALITY) {
//         let activeColor: string | null = null;

//         if (isExploreActive) {
//           activeColor = exploreColor;
//         } else if (isSchoolsActive) {
//           activeColor = '#1d4ed8'; // District blue
//         } else if (isSelected) {
//           activeColor = '#F07639'; // SF Orange
//         }

//         if (activeColor) {
//           return {
//             strokeColor: activeColor,
//             strokeWeight: 4,
//             strokeOpacity: 1,
//             fillColor: activeColor,
//             fillOpacity: 0.1,
//           };
//         }
//       }
//       return null;
//     };

//     if (state) state.style = styleFn;
//     if (county) county.style = styleFn;
//     if (city) city.style = styleFn;
//   }, [isLoaded, mapInstance, selectedPlaceId, showDistricts, activeCategoryKeys, exploreSearchInput]);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;

//     const clearSchoolMarkers = () => {
//       schoolMarkersRef.current.forEach((marker) => marker.setMap(null));
//       schoolMarkersRef.current = [];
//       setSelectedSchool(null);
//     };

//     if (!showDistricts) {
//       clearSchoolMarkers();
//       return;
//     }

//     let cancelled = false;

//     const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//     const getMatchedEntries = () => {
//       const cache = districtPolygonCacheRef.current;
//       return matchedDistricts
//         .map((feature) => cache.get(getDistrictId(feature)))
//         .filter(Boolean) as DistrictPolygonCacheEntry[];
//     };

//     const collectPlacesForBounds = (bounds: google.maps.LatLngBounds) =>
//       new Promise<google.maps.places.PlaceResult[]>((resolve) => {
//         const service = new google.maps.places.PlacesService(mapInstance);
//         const center = bounds.getCenter();
//         const radius = Math.max(
//           500,
//           google.maps.geometry.spherical.computeDistanceBetween(center, bounds.getNorthEast()),
//         );
//         const cappedRadius = Math.min(radius, 50000);

//         const results: google.maps.places.PlaceResult[] = [];

//         const handlePage = (
//           pageResults: google.maps.places.PlaceResult[] | null,
//           status: google.maps.places.PlacesServiceStatus,
//           pagination: google.maps.places.PlaceSearchPagination | null,
//         ) => {
//           if (status === google.maps.places.PlacesServiceStatus.OK && pageResults) {
//             results.push(...pageResults);
//           }

//           if (pagination && pagination.hasNextPage) {
//             setTimeout(() => pagination.nextPage(), 1500);
//             return;
//           }

//           resolve(results);
//         };

//         service.nearbySearch(
//           {
//             location: center,
//             radius: cappedRadius,
//             type: 'school',
//           },
//           handlePage,
//         );
//       });

//     const run = async () => {
//       const matchedEntries = getMatchedEntries();
//       const allBounds = matchedEntries.flatMap((entry) => entry.bounds);
//       const polygons = matchedEntries.flatMap((entry) => entry.polygons);
//       const currentViewport = mapInstance.getBounds();

//       let boundsToSearch: google.maps.LatLngBounds[] = [];
//       if (allBounds.length > 0) {
//         // Merge district bounds to minimize API calls
//         const merged = allBounds[0];
//         for (let i = 1; i < allBounds.length; i += 1) {
//           merged.union(allBounds[i]);
//         }
//         boundsToSearch = [merged];
//       } else if (currentViewport) {
//         boundsToSearch = [currentViewport];
//       }

//       if (boundsToSearch.length === 0) {
//         clearSchoolMarkers();
//         return;
//       }

//       const allPlaces: google.maps.places.PlaceResult[] = [];
//       for (const bounds of boundsToSearch) {
//         if (cancelled) return;
//         const places = await collectPlacesForBounds(bounds);
//         allPlaces.push(...places);
//         if (boundsToSearch.length > 1) await delay(250);
//       }

//       if (cancelled) return;

//       const uniqueById = new Map<string, google.maps.places.PlaceResult>();
//       for (const place of allPlaces) {
//         if (!place.place_id || !place.geometry?.location) continue;
//         uniqueById.set(place.place_id, place);
//       }

//       const uniquePlaces = Array.from(uniqueById.values());
//       const filtered = polygons.length > 0
//         ? uniquePlaces.filter((place) => {
//           const location = place.geometry?.location;
//           if (!location) return false;
//           return polygons.some((poly) => google.maps.geometry.poly.containsLocation(location, poly));
//         })
//         : uniquePlaces;
//       const placesToRender = filtered.length > 0 ? filtered : uniquePlaces;

//       // Only clear markers right before we redraw to avoid flickering / "icons removed"
//       clearSchoolMarkers();

//       const schoolIconUrl = '/assets/icons/Education.svg';
//       const markers = placesToRender.map((place) => {
//         const location = place.geometry!.location;
//         if (!location?.lat() || !location?.lng()) return;
//         const position = { lat: location.lat(), lng: location.lng() };
//         const marker = new google.maps.Marker({
//           map: mapInstance,
//           position,
//           title: place.name ?? 'School',
//           visible: isPointInsideActiveDrawPolygon(position),
//           zIndex: 1100,
//           icon: {
//             url: schoolIconUrl,
//             scaledSize: new google.maps.Size(CATEGORY_SVG_MARKER_SIZE, CATEGORY_SVG_MARKER_SIZE),
//             anchor: new google.maps.Point(
//               Math.round(CATEGORY_SVG_MARKER_SIZE / 2),
//               Math.round(CATEGORY_SVG_MARKER_SIZE / 2),
//             ),
//           },
//         });

//         marker.addListener('click', () => {
//           setClickedDistrictName(null);
//           setSelectedSearchPlace(null);
//           if (!measureModeRef.current) {
//             centerOnMeasurePoint(position);
//           }
//           const currentSchool = selectedSchoolRef.current;
//           const sameSchoolSelected =
//             !!currentSchool &&
//             ((place.place_id && currentSchool.placeId && currentSchool.placeId === place.place_id) ||
//               (currentSchool.position?.lat === position.lat &&
//                 currentSchool.position?.lng === position.lng));

//           if (sameSchoolSelected) {
//             schoolDetailsRequestRef.current += 1;
//             setSelectedSchool(null);
//             return;
//           }

//           applyMeasurePointFromMarker(position, 'poi');
//           if (place.place_id) {
//             fetchPlaceDetails(
//               place.place_id,
//               position,
//               {
//                 name: place.name ?? 'School',
//                 rating: place.rating ?? undefined,
//                 total: place.user_ratings_total ?? undefined,
//               },
//               setSelectedSchool,
//               schoolDetailsRequestRef,
//             );
//           } else {
//             setSelectedSchool({
//               placeId: place.place_id ?? undefined,
//               name: place.name ?? 'School',
//               rating: place.rating ?? undefined,
//               total: place.user_ratings_total ?? undefined,
//               position,
//             });
//           }
//         });

//         return marker;
//       });

//       (schoolMarkersRef.current as any) = markers.filter(Boolean);
//     };

//     run();
//     return () => {
//       cancelled = true;
//     };
//   }, [
//     isLoaded,
//     mapInstance,
//     mapViewport, // Use the debounced mapViewport instead of matchedDistricts
//     showDistricts,
//     getDistrictId,
//     fetchPlaceDetails,
//     applyMeasurePointFromMarker,
//     centerOnMeasurePoint,
//     isPointInsideActiveDrawPolygon,
//   ]);

//   useEffect(() => {
//     const applyVisibility = (marker: google.maps.Marker) => {
//       marker.setVisible(isPointInsideActiveDrawPolygon(marker.getPosition() as google.maps.LatLng | null));
//     };

//     schoolMarkersRef.current.forEach(applyVisibility);
//     searchMarkersRef.current.forEach(applyVisibility);
//     Object.values(categoryMarkersRef.current).forEach((group) => group.forEach(applyVisibility));

//     const selectedPoi = selectedSearchPlaceRef.current;
//     if (selectedPoi && !isPointInsideActiveDrawPolygon(selectedPoi.position)) {
//       setSelectedSearchPlace(null);
//     }

//     const selectedSchoolPoint = selectedSchoolRef.current;
//     if (selectedSchoolPoint && !isPointInsideActiveDrawPolygon(selectedSchoolPoint.position)) {
//       setSelectedSchool(null);
//     }
//   }, [drawPolygon, isPointInsideActiveDrawPolygon]);

//   useEffect(() => {
//     if (!showDistricts) {
//       setClickedDistrictName(null);
//     }
//   }, [showDistricts]);

//   useEffect(() => {
//     if (!isLoaded || !measureStart || !measureEnd) return;

//     const service = new google.maps.DirectionsService();
//     service.route(
//       {
//         origin: measureStart,
//         destination: measureEnd,
//         travelMode: google.maps.TravelMode.DRIVING,
//       },
//       (result, status) => {
//         if (status === google.maps.DirectionsStatus.OK && result) {
//           setMeasureRoute(result);
//           const leg = result.routes?.[0]?.legs?.[0];
//           setMeasureDuration(leg?.duration?.text || null);
//           setMeasureDistance(leg?.distance?.text || null);
//           setMeasureError(null);
//           return;
//         }

//         setMeasureRoute(null);
//         setMeasureDuration(null);
//         setMeasureDistance(null);
//         let message = 'Unable to calculate a route for those points.';
//         if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
//           message = 'No driving route found between those points.';
//         } else if (status === google.maps.DirectionsStatus.REQUEST_DENIED) {
//           message = 'Directions request denied. Check API key and Directions API enablement.';
//         } else if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
//           message = 'Request limit exceeded. Please try again in a moment.';
//         } else if (status === google.maps.DirectionsStatus.INVALID_REQUEST) {
//           message = 'Invalid route request. Try selecting different points.';
//         }
//         console.warn('DirectionsService error:', status);
//         setMeasureError(message);
//       },
//     );
//   }, [isLoaded, measureStart, measureEnd]);

//   // Listen on the Data layer directly  the Data layer intercepts feature clicks
//   // before the map's onClick fires, so containsLocation on map onClick never triggers.
//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;

//     const listener = mapInstance.data.addListener(
//       'click',
//       (event: google.maps.Data.MouseEvent) => {
//         if (!showDistricts) return;
//         recentDataClickRef.current = true;
//         const name = event.feature.getProperty('DistrictName') as string | null;
//         setClickedDistrictName(name ?? null);
//         // Reset after the current event tick so the guard only blocks the
//         // same-tick map onClick (if it fires), not any future outside clicks.
//         setTimeout(() => { recentDataClickRef.current = false; }, 0);
//       },
//     );

//     return () => {
//       google.maps.event.removeListener(listener);
//     };
//   }, [isLoaded, mapInstance, showDistricts]);

//   // Fires only for map background clicks (outside any Data feature).
//   // The recentDataClickRef guard prevents it from clearing a name that was
//   // just set by the Data layer click above.
//   const handleMapClick = useCallback((event?: google.maps.MapMouseEvent) => {
//     if (drawMode && isTouchDevice && event?.latLng) {
//       const point = event.latLng.toJSON();
//       mobileTapDrawPointsRef.current.push(point);
//       if (!mapInstance) return;
//       if (!freehandPreviewLineRef.current) {
//         freehandPreviewLineRef.current = new google.maps.Polyline({
//           map: mapInstance,
//           path: mobileTapDrawPointsRef.current,
//           clickable: false,
//           strokeColor: '#F57F2E',
//           strokeOpacity: 0.95,
//           strokeWeight: 2,
//           zIndex: 50,
//         });
//       } else {
//         freehandPreviewLineRef.current.setPath(mobileTapDrawPointsRef.current);
//       }
//       return;
//     }

//     if (!recentDataClickRef.current) {
//       setClickedDistrictName(null);
//     }
//     setSelectedMarker(null);
//     onMarkerClick?.('');
//     setSelectedSchool(null);
//     setSelectedSearchPlace(null);
//     setSelectedMarker(null);
//     setHoveredMarker(null);

//     if (!measureMode || !event?.latLng) return;

//     const point = event.latLng.toJSON();
//     if (!measureStart || measureEnd) {
//       setMeasureStart(point);
//       setMeasureEnd(null);
//       setMeasureRoute(null);
//       setMeasureDuration(null);
//       setMeasureDistance(null);
//       setMeasureError(null);
//       return;
//     }

//     setMeasureEnd(point);
//   }, [measureMode, measureStart, measureEnd, onMarkerClick, drawMode, isTouchDevice, mapInstance]);

//   useEffect(() => {
//     if (!isLoaded || !mapInstance) return;
//     const listener = mapInstance.addListener('click', () => {
//       if (recentDataClickRef.current) return;
//       setClickedDistrictName(null);
//       setSelectedSchool(null);
//       setSelectedSearchPlace(null);
//     });
//     return () => {
//       google.maps.event.removeListener(listener);
//     };
//   }, [isLoaded, mapInstance]);

//   const panMarkerIntoVisibleArea = useCallback((position: google.maps.LatLngLiteral) => {
//     if (!mapInstance) return;
//     mapInstance.panTo(position);
//     if (isTouchDevice && useOverlayResultsRail) {
//       window.setTimeout(() => {
//         try {
//           const overlay = projectionOverlayRef.current;
//           const projection = overlay?.getProjection?.();
//           if (!projection) return;
//           const mapDiv = mapInstance.getDiv();
//           const mapHeight = mapDiv?.clientHeight ?? 0;
//           if (!mapHeight) return;
//           const markerPixel = projection.fromLatLngToContainerPixel(
//             new google.maps.LatLng(position.lat, position.lng),
//           );
//           if (!markerPixel) return;
//           const targetY = mapHeight * 0.34;
//           const deltaY = markerPixel.y - targetY;
//           if (Math.abs(deltaY) > 8) {
//             mapInstance.panBy(0, deltaY);
//           }
//         } catch {
//           // no-op
//         }
//       }, 0);
//     }
//   }, [isTouchDevice, mapInstance, useOverlayResultsRail]);

//   const centerOnMarker = useCallback((position: google.maps.LatLngLiteral) => {
//     if (!mapInstance) return;
//     panMarkerIntoVisibleArea(position);
//     if (!measureMode && !measureModeRef.current) {
//       mapInstance.setZoom(Math.max(zoom, 21));
//     }
//   }, [mapInstance, panMarkerIntoVisibleArea, zoom, measureMode]);

//   const isSameMarker = useCallback((a: any, b: any) => {
//     if (!a || !b) return false;
//     if (a.id && b.id) return String(a.id) === String(b.id);
//     return a.lat === b.lat && a.lng === b.lng;
//   }, []);

//   const previewAnchorMarker = useMemo(() => {
//     const allowHoverPreview = !isTouchDevice || !useOverlayResultsRail;
//     const allowTouchPreview = isTouchDevice && !useOverlayResultsRail;
//     const hoverAnchor = allowHoverPreview ? hoveredMarker : null;
//     return hoverAnchor || (allowTouchPreview ? selectedMarker : null);
//   }, [hoveredMarker, isTouchDevice, selectedMarker, useOverlayResultsRail]);

//   const hoverPreview = useMemo(() => {
//     if (!previewAnchorMarker) return null;

//     const source = previewAnchorMarker?.originalData || {};
//     const listing = source?.listing ?? source?.data?.listing ?? {};
//     const property = listing?.property ?? source?.property ?? {};
//     const listPrice =
//       listing?.listPriceLow ??
//       listing?.listPrice ??
//       source?.listPrice ??
//       Number(previewAnchorMarker?.price || 0);
//     const beds = property?.bedroomsTotal;
//     const baths = property?.bathroomsTotal;
//     const sqft = property?.livingArea;
//     const image =
//       listing?.media?.primaryListingImageUrl ??
//       source?.media?.primaryListingImageUrl ??
//       '';
//     const rawStatus =
//       listing?.standardStatus ??
//       listing?.StandardStatus ??
//       listing?.mlsStatus ??
//       listing?.MlsStatus ??
//       listing?.mostRecentStatus ??
//       listing?.currentStatus ??
//       listing?.status ??
//       '';
//     const status = typeof rawStatus === 'string' ? rawStatus.trim() : '';
//     const normalizedStatus = status.toLowerCase();
//     const statusLabel = normalizedStatus.includes('active')
//       ? 'Active'
//       : status || 'For sale';
//     const compactStatusLabel =
//       statusLabel === 'Active'
//         ? 'House for sale'
//         : statusLabel;
//     const listingType =
//       listing?.propertyType ||
//       property?.propertyType ||
//       property?.propertySubType ||
//       'Residential';
//     const address =
//       source?.public?.address?.label ??
//       listing?.address?.unparsedAddress ??
//       source?.address?.unparsedAddress ??
//       'Property preview';

//     return {
//       position: { lat: previewAnchorMarker.lat, lng: previewAnchorMarker.lng },
//       image,
//       priceText: Number(listPrice) > 0 ? formatCurrency(Number(listPrice)) : formatMarkerPriceCompact(Number(previewAnchorMarker?.price || 0)),
//       meta: [beds ? `${beds} bds` : '', baths ? `${baths} ba` : '', sqft ? `${sqft} sqft` : '', compactStatusLabel]
//         .filter(Boolean)
//         .join(' | '),
//       statusLabel,
//       listingType: String(listingType).toUpperCase(),
//       address,
//     };
//   }, [previewAnchorMarker]);


//   const onLoad = useCallback((map: google.maps.Map) => {
//     setMap(map);
//     setCurrentMapZoom(map.getZoom() ?? zoom);
//   }, [zoom]);

//   const onUnmount = () => setMap(null);

//   useEffect(() => {
//     // A new search query should be allowed to auto-fit again.
//     userMovedMapRef.current = false;
//     lastAutoFitQueryRef.current = null;
//   }, [searchQuery]);

//   useEffect(() => {
//     if (!mapInstance) return;
//     const dragListener = mapInstance.addListener('dragstart', () => {
//       userMovedMapRef.current = true;
//     });
//     const zoomListener = mapInstance.addListener('zoom_changed', () => {
//       userMovedMapRef.current = true;
//       setCurrentMapZoom(mapInstance.getZoom() ?? zoom);
//     });
//     return () => {
//       google.maps.event.removeListener(dragListener);
//       google.maps.event.removeListener(zoomListener);
//     };
//   }, [mapInstance, zoom]);

//   useEffect(() => {
//     // If we've already drawn a polygon or are in the middle of a search, 
//     // don't auto-adjust the map as it might trigger an infinite idle loop.
//     if (drawMode || hasActiveDrawPolygon || recentDataClickRef.current) {
//       return;
//     }
//     if (mapInstance && markers.length > 0) {
//       // In overlay-results map mode (mobile/desktop split view), aggressively fitting
//       // to every marker causes jarring zoom-outs (often country-level) on refresh.
//       // Keep current viewport stable and let query/place focus logic drive centering.
//       if (useOverlayResultsRail) return;

//       const currentQueryKey = (searchQuery || '').trim().toLowerCase() || '__no_query__';
//       if (userMovedMapRef.current && lastAutoFitQueryRef.current === currentQueryKey) {
//         return;
//       }
//       const validMarkers = markers.filter(
//         ({ lat, lng }) => typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng),
//       );
//       if (validMarkers.length === 0) return;
//       if (validMarkers.length === 1) {
//         const { lat, lng } = validMarkers[0];
//         mapInstance.setCenter({ lat, lng });
//         mapInstance.setZoom(zoom);
//       } else {
//         const bounds = new window.google.maps.LatLngBounds();
//         validMarkers.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
//         mapInstance.fitBounds(bounds, 50);
//       }
//       lastAutoFitQueryRef.current = currentQueryKey;
//     }
//   }, [mapInstance, markers, zoom, drawMode, hasActiveDrawPolygon, searchQuery, useOverlayResultsRail]);

//   const submitExploreSearch = useCallback(() => {
//     const query = exploreSearchInput.trim();
//     if (!query) {
//       searchRequestIdRef.current += 1;
//       clearSearchMarkers();
//       setExploreFeedback(null);
//       return;
//     }
//     setExploreFeedback(null);
//     runTextSearch(query);
//   }, [clearSearchMarkers, exploreSearchInput, runTextSearch]);

//   const toggleExploreCategory = useCallback((categoryKey: keyof typeof quickCategories) => {
//     setActiveCategoryKeys((prev) => {
//       const exists = prev.includes(categoryKey);
//       if (exists) {
//         categoryRequestIdRef.current[categoryKey] = (categoryRequestIdRef.current[categoryKey] ?? 0) + 1;
//         activeCategoryKeysRef.current.delete(categoryKey);
//         clearCategoryMarkers(categoryKey);
//         setExploreFeedback(null);
//         return prev.filter((k) => k !== categoryKey);
//       }

//       const next = [...prev, categoryKey];
//       activeCategoryKeysRef.current.add(categoryKey);
//       const cfg = quickCategories[categoryKey];
//       setExploreFeedback(null);
//       runCategorySearch(cfg.query, {
//         categoryKey,
//         iconColor: cfg.color,
//       });
//       return next;
//     });
//   }, [clearCategoryMarkers, quickCategories, runCategorySearch]);

//   useEffect(() => {
//     return () => {
//       clearAllExploreMarkers();
//     };
//   }, [clearAllExploreMarkers]);

//   useEffect(() => {
//     if (shouldHideControls) {
//       setMobileToolsExpanded(false);
//       setActiveToolPanel(null);
//     }
//   }, [shouldHideControls]);

//   useEffect(() => {
//     if (!isTouchDevice || activeToolPanel !== 'explore') return;
//     const onPointerDown = (event: PointerEvent) => {
//       const target = event.target as Node | null;
//       if (!target) return;
//       if (controlsDockRef.current?.contains(target)) return;
//       setActiveToolPanel(null);
//     };
//     document.addEventListener('pointerdown', onPointerDown);
//     return () => document.removeEventListener('pointerdown', onPointerDown);
//   }, [isTouchDevice, activeToolPanel]);



//   return isLoaded ? (
//     <div className="relative w-full" style={{ height: containerStyle.height, minHeight: containerStyle.minHeight }}>
//       {showDistricts && clickedDistrictName && (
//         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
//           <div className="rounded-full border border-gray-100 bg-white/95 px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur-sm whitespace-nowrap">
//             {clickedDistrictName}
//           </div>
//         </div>
//       )}
//       <div
//         ref={controlsDockRef}
//         className={cn(
//           'absolute z-30 pointer-events-auto',
//           shouldHideControls ? 'hidden' : '',
//           isTouchDevice
//             ? 'right-3 bottom-[132px]'
//             : 'right-3 top-3 sm:right-4 sm:top-4',
//         )}
//       >
//         <div className="flex items-start gap-2">
//           {!isTouchDevice && activeToolPanel === 'measure' && (
//             <div className="w-[220px] max-w-[72vw] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
//               <div className="flex items-center justify-between">
//                 <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Measure</span>
//                 <button
//                   className={cn(
//                     'rounded-full px-2 py-1 text-[11px] font-semibold',
//                     measureMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700',
//                   )}
//                   onClick={() => {
//                     setMeasureMode((prev) => {
//                       const next = !prev;
//                       if (next) {
//                         setDrawMode(false);
//                         setActiveToolPanel((panel) => (panel === 'draw' ? 'measure' : panel));
//                       } else {
//                         resetMeasure();
//                       }
//                       return next;
//                     });
//                   }}
//                 >
//                   {measureMode ? 'On' : 'Off'}
//                 </button>
//               </div>
//               <div className="mt-2 text-[11px] leading-4 text-gray-600">
//                 {measureMode ? 'Pick listing, then school/place (or click two map points).' : 'Enable route measuring.'}
//               </div>
//               <div className="mt-2 text-[11px]">
//                 {measureDuration && measureDistance ? (
//                   <div>
//                     <div className="font-semibold text-gray-900">{measureDuration}</div>
//                     <div className="text-gray-500">{measureDistance}</div>
//                   </div>
//                 ) : measureError ? (
//                   <div className="text-red-500">{measureError}</div>
//                 ) : (
//                   <div className="text-gray-400">No route selected.</div>
//                 )}
//               </div>
//               {measureMode && (measureStart || measureEnd) ? (
//                 <button
//                   className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
//                   onClick={resetMeasure}
//                 >
//                   Clear
//                 </button>
//               ) : null}
//             </div>
//           )}

//           {!isTouchDevice && activeToolPanel === 'draw' && (
//             <div className="w-[220px] max-w-[72vw] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
//               <div className="flex items-center justify-between">
//                 <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Draw Area</span>
//                 <button
//                   className={cn(
//                     'rounded-full px-2 py-1 text-[11px] font-semibold',
//                     drawMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700',
//                   )}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setDrawMode((prev) => {
//                       const next = !prev;
//                       if (next) {
//                         setMeasureMode(false);
//                         resetMeasure();
//                         setActiveToolPanel((panel) => (panel === 'measure' ? 'draw' : panel));
//                       }
//                       return next;
//                     });
//                   }}
//                 >
//                   {drawMode ? 'On' : 'Off'}
//                 </button>
//               </div>
//               <div className="mt-2 text-[11px] leading-4 text-gray-600">
//                 {drawMode
//                   ? 'Click and drag to draw a freehand area.'
//                   : drawFilteredMarkerIds
//                     ? `${drawFilteredMarkerIds.length} listing${drawFilteredMarkerIds.length === 1 ? '' : 's'} in area.`
//                     : 'Draw a freehand shape to filter current listings.'}
//               </div>
//               <button
//                 className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
//                 onClick={() => {
//                   clearDrawPolygon();
//                   setSelectedMarker(null);
//                 }}
//                 disabled={!drawPolygon}
//               >
//                 Clear Draw
//               </button>
//             </div>
//           )}

//           {activeToolPanel === 'explore' && (
//             <div className={cn(
//               'rounded-xl border border-gray-200 bg-white p-3 shadow-lg',
//               isTouchDevice ? 'w-[260px] max-w-[72vw]' : 'w-[280px] max-w-[80vw]',
//             )}>
//               <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
//                 Explore Search
//               </div>
//               <form
//                 className="flex items-stretch gap-2"
//                 onSubmit={(e) => {
//                   e.preventDefault();
//                   submitExploreSearch();
//                 }}
//               >
//                 <div className="min-w-0 flex-1">
//                   <input
//                     type="text"
//                     value={exploreSearchInput}
//                     onChange={(e) => setExploreSearchInput(e.target.value)}
//                     placeholder="Search places in view"
//                     className="block w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-0 focus:border-gray-400"
//                     style={{
//                       display: 'block',
//                       width: '100%',
//                       height: 36,
//                       minHeight: 36,
//                       lineHeight: '20px',
//                       paddingTop: 0,
//                       paddingBottom: 0,
//                       backgroundColor: '#fff',
//                       borderWidth: 1,
//                     }}
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   className="shrink-0 rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white hover:bg-black"
//                   style={{ height: 36, minWidth: 44 }}
//                 >
//                   Go
//                 </button>
//               </form>
//               <div className="mt-2 flex items-center justify-between gap-2">
//                 <button
//                   type="button"
//                   className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
//                   onClick={() => {
//                     searchRequestIdRef.current += 1;
//                     clearSearchMarkers();
//                     setExploreSearchInput('');
//                     setExploreFeedback(null);
//                   }}
//                 >
//                   Clear Search
//                 </button>
//                 <button
//                   type="button"
//                   className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
//                   onClick={() => setActiveToolPanel(null)}
//                 >
//                   Close
//                 </button>
//               </div>
//               <div className="mt-3 flex flex-wrap gap-2">
//                 {onOverlayChange && (
//                   <button
//                     type="button"
//                     onClick={() => onOverlayChange(overlayValue === 'schools' ? 'none' : 'schools')}
//                     className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
//                     style={{
//                       borderColor: overlayValue === 'schools' ? schoolCategoryColor : '#e5e7eb',
//                       background: overlayValue === 'schools' ? schoolCategoryColor : '#fff',
//                       color: overlayValue === 'schools' ? '#fff' : '#111827',
//                     }}
//                   >
//                     Schools
//                   </button>
//                 )}
//                 {Object.entries(quickCategories).map(([key, cfg]) => {
//                   const active = activeCategoryKeys.includes(key);
//                   return (
//                     <button
//                       key={key}
//                       type="button"
//                       onClick={() => toggleExploreCategory(key as keyof typeof quickCategories)}
//                       className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
//                       style={{
//                         borderColor: active ? cfg.color : '#e5e7eb',
//                         background: active ? cfg.color : '#fff',
//                         color: active ? '#fff' : '#111827',
//                       }}
//                     >
//                       {cfg.label}
//                     </button>
//                   );
//                 })}
//               </div>
//               <div className="mt-2 flex items-center justify-between gap-2">
//                 <button
//                   type="button"
//                   className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
//                   onClick={() => {
//                     Object.keys(categoryMarkersRef.current).forEach((key) => {
//                       categoryRequestIdRef.current[key] = (categoryRequestIdRef.current[key] ?? 0) + 1;
//                     });
//                     activeCategoryKeysRef.current = new Set();
//                     setActiveCategoryKeys([]);
//                     clearAllCategoryMarkers();
//                     if (onOverlayChange && overlayValue === 'schools') onOverlayChange('none');
//                     setExploreFeedback(null);
//                   }}
//                 >
//                   Clear Categories
//                 </button>
//                 {(activeCategoryKeys.length > 0 || overlayValue === 'schools') && (
//                   <span className="text-[10px] text-gray-500">
//                     {activeCategoryKeys.length + (overlayValue === 'schools' ? 1 : 0)} active
//                   </span>
//                 )}
//               </div>
//               {exploreFeedback && (
//                 <div className="mt-2 rounded-md bg-gray-50 px-2.5 py-2 text-[11px] text-gray-600">
//                   {exploreFeedback}
//                 </div>
//               )}
//             </div>
//           )}

//           <div
//             className={cn(
//               'flex flex-col border border-gray-200 bg-white/95 shadow-lg backdrop-blur',
//               isTouchDevice ? 'overflow-hidden rounded-md p-0' : 'gap-2 rounded-xl p-1.5',
//             )}
//           >
//             {isTouchDevice ? (
//               <button
//                 type="button"
//                 title="Map tools"
//                 onClick={() => setMobileToolsExpanded((prev) => !prev)}
//                 className={cn(
//                   'flex h-10 w-10 items-center justify-center bg-white text-gray-700 hover:bg-gray-50',
//                   'border-b border-gray-200',
//                 )}
//                 aria-label="Toggle map tools"
//               >
//                 {mobileToolsExpanded ? (
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                     <path d="M6 6l12 12M18 6 6 18" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
//                   </svg>
//                 ) : (
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                     <path d="M4 7h16M4 12h16M4 17h16" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
//                   </svg>
//                 )}
//               </button>
//             ) : null}

//             <>
//               <button
//                 type="button"
//                 title="Zoom in"
//                 onClick={() => adjustMapZoom(1)}
//                 className={cn(
//                   'flex h-10 w-10 items-center justify-center bg-white text-gray-700 hover:bg-gray-50',
//                   isTouchDevice ? 'border-b border-gray-200' : 'rounded-lg border',
//                 )}
//                 aria-label="Zoom in"
//               >
//                 <span className="text-2xl leading-none">+</span>
//               </button>
//               <button
//                 type="button"
//                 title="Zoom out"
//                 onClick={() => adjustMapZoom(-1)}
//                 className={cn(
//                   'flex h-10 w-10 items-center justify-center bg-white text-gray-700 hover:bg-gray-50',
//                   isTouchDevice ? 'border-b border-gray-200' : 'rounded-lg border',
//                 )}
//                 aria-label="Zoom out"
//               >
//                 <span className="text-3xl leading-none">-</span>
//               </button>
//             </>

//             {(!isTouchDevice || mobileToolsExpanded) ? (
//               <>
//                 <button
//                   type="button"
//                   title="Measure Time"
//                   onClick={() => {
//                     if (isTouchDevice) {
//                       const next = !measureMode;
//                       setMeasureMode(next);
//                       setDrawMode(false);
//                       if (!next) resetMeasure();
//                       setActiveToolPanel(next ? 'measure' : null);
//                       return;
//                     }
//                     setActiveToolPanel((prev) => {
//                       const nextPanel = prev === 'measure' ? null : 'measure';
//                       if (nextPanel === 'measure') {
//                         setDrawMode(false);
//                         setMeasureMode(true);
//                       } else {
//                         setMeasureMode(false);
//                         resetMeasure();
//                       }
//                       return nextPanel;
//                     });
//                   }}
//                   className={cn(
//                     'flex items-center justify-center text-[11px] font-semibold',
//                     isTouchDevice ? 'h-10 w-10 border-b border-gray-200' : 'h-10 w-10 rounded-lg border',
//                     activeToolPanel === 'measure' || measureMode
//                       ? 'border-black bg-black text-white'
//                       : 'bg-white text-gray-700 hover:bg-gray-50',
//                   )}
//                 >
//                   <svg
//                     width="18"
//                     height="18"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     aria-hidden="true"
//                   >
//                     <path
//                       d="M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16Z"
//                       stroke={activeToolPanel === 'measure' || measureMode ? '#fff' : '#6b7280'}
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                     />
//                     <path
//                       d="M12 12l4-2.5"
//                       stroke={activeToolPanel === 'measure' || measureMode ? '#fff' : '#6b7280'}
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                     />
//                     <circle cx="12" cy="12" r="1.2" fill={activeToolPanel === 'measure' || measureMode ? '#fff' : '#6b7280'} />
//                   </svg>
//                 </button>
//                 <button
//                   type="button"
//                   title="Draw Area"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (drawMode) {
//                       if (isTouchDevice) {
//                         finalizeMobileTapDraw();
//                         setActiveToolPanel(null);
//                         return;
//                       }
//                       clearDrawPolygon();
//                       setActiveToolPanel((prev) => (prev === 'draw' ? null : prev));
//                       return;
//                     }
//                     if (!!drawPolygon) {
//                       clearDrawPolygon();
//                       setActiveToolPanel((prev) => (prev === 'draw' ? null : prev));
//                       return;
//                     }
//                     setMeasureMode(false);
//                     resetMeasure();
//                     setActiveToolPanel((prev) => (prev === 'measure' ? null : prev));
//                     setDrawMode(true);
//                     if (isTouchDevice) {
//                       mobileTapDrawPointsRef.current = [];
//                     }
//                   }}
//                   className={cn(
//                     'flex items-center justify-center text-[11px] font-semibold',
//                     isTouchDevice ? 'h-10 w-10 border-b border-gray-200' : 'h-10 w-10 rounded-lg border',
//                     activeToolPanel === 'draw' || drawMode || !!drawPolygon
//                       ? 'border-black bg-black text-white'
//                       : 'bg-white text-gray-700 hover:bg-gray-50',
//                   )}
//                 >
//                   <svg
//                     width="18"
//                     height="18"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     aria-hidden="true"
//                   >
//                     <path
//                       d="M4 20h4.2l10-10a1.8 1.8 0 0 0 0-2.55l-1.65-1.65a1.8 1.8 0 0 0-2.55 0L4 15.8V20Z"
//                       stroke={activeToolPanel === 'draw' || drawMode || !!drawPolygon ? '#fff' : '#6b7280'}
//                       strokeWidth="1.8"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M12.9 7.05 16.95 11.1"
//                       stroke={activeToolPanel === 'draw' || drawMode || !!drawPolygon ? '#fff' : '#6b7280'}
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                     />
//                     <path
//                       d="M4 20l3.2-.7L4.7 16.8 4 20Z"
//                       fill={activeToolPanel === 'draw' || drawMode || !!drawPolygon ? '#fff' : '#6b7280'}
//                     />
//                   </svg>
//                 </button>
//                 <button
//                   type="button"
//                   title="Explore Search"
//                   onClick={() => {
//                     if (isTouchDevice) {
//                       const next = activeToolPanel !== 'explore';
//                       if (!next) {
//                         setActiveToolPanel(null);
//                         return;
//                       }
//                       setMeasureMode(false);
//                       resetMeasure();
//                       setDrawMode(false);
//                       setActiveToolPanel('explore');
//                       setExploreFeedback(null);
//                       return;
//                     }
//                     setActiveToolPanel((prev) => (prev === 'explore' ? null : 'explore'));
//                   }}
//                   className={cn(
//                     'flex items-center justify-center',
//                     isTouchDevice ? 'h-10 w-10 border-b border-gray-200' : 'h-10 w-10 rounded-lg border',
//                     activeToolPanel === 'explore'
//                       ? 'border-black bg-black'
//                       : 'bg-white hover:bg-gray-50',
//                   )}
//                   aria-label="Explore places"
//                 >
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                     <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Zm0 2a5 5 0 1 1 0 10a5 5 0 0 1 0-10Z" fill={activeToolPanel === 'explore' ? '#fff' : '#6b7280'} />
//                     <path d="M15.8 15.8l3.9 3.9" stroke={activeToolPanel === 'explore' ? '#fff' : '#6b7280'} strokeWidth="2" strokeLinecap="round" />
//                   </svg>
//                 </button>
//               </>
//             ) : null}
//           </div>
//         </div>
//       </div>

//       {isTouchDevice && drawMode && !shouldHideControls ? (
//         <div
//           className="absolute inset-0 z-20 touch-none"
//           onPointerDown={handleTouchDrawPointerDown}
//           onPointerMove={handleTouchDrawPointerMove}
//           onPointerUp={handleTouchDrawPointerUp}
//           onPointerCancel={handleTouchDrawPointerUp}
//         />
//       ) : null}

//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         mapContainerClassName="snaphomz-map"
//         onLoad={onLoad}
//         zoom={zoom}
//         center={DEFAULT_COORD}
//         onUnmount={onUnmount}
//         onClick={handleMapClick}
//         onIdle={() => {
//           if (drawMode || hasActiveDrawPolygon) return;
//           if (suppressNextOnIdleRef.current) {
//             suppressNextOnIdleRef.current = false;
//             return;
//           }
//           // Only emit map-move refreshes after a real user map interaction
//           // (drag/zoom). Prevents initial/programmatic idles from overriding
//           // a freshly typed location search with stale previous-area results.
//           if (!userMovedMapRef.current) return;
//           if (mapInstance) {
//             const center = mapInstance.getCenter();
//             const bounds = mapInstance.getBounds();
//             if (center && bounds) {
//               // Debounce viewport-based refreshes to avoid flickering and infinite-zoom loops
//               // when fitBounds is triggered elsewhere.
//               if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
//               refreshTimerRef.current = setTimeout(() => {
//                 setMapViewport(bounds);
//                 refreshExplorePlaces(bounds);
//               }, 150);

//               if (onMapMove) {
//                 onMapMove(
//                   { lat: center.lat(), lng: center.lng() },
//                   bounds
//                 );
//               }
//             }
//           }
//         }}
//         options={{
//           cameraControl: false,
//           fullscreenControl: false,
//           streetViewControl: false,
//           mapTypeControl: false,
//           rotateControl: false,
//           clickableIcons: false,
//           // Use the app's custom zoom controls for consistent placement/styling
//           // across desktop + mobile overlays.
//           zoomControl: false,
//           draggable: !drawMode,
//           scrollwheel: true,
//           gestureHandling: isTouchDevice ? 'greedy' : 'cooperative',
//           draggableCursor: drawMode ? 'crosshair' : undefined,
//           mapId: googleMapsMapId,
//           zoomControlOptions: {
//             position: google.maps.ControlPosition.RIGHT_BOTTOM,
//           },
//           minZoom: 3,
//           restriction: {
//             latLngBounds: {
//               north: 85,
//               south: -85,
//               west: -180,
//               east: 180,
//             },
//             strictBounds: true,
//           },
//           styles: [
//             {
//               featureType: 'administrative',
//               elementType: 'geometry',
//               stylers: [{ visibility: 'simplified' }],
//             },
//             {
//               featureType: 'poi',
//               stylers: [{ visibility: 'off' }],
//             },
//             {
//               featureType: 'road',
//               elementType: 'labels.icon',
//               stylers: [{ visibility: 'off' }],
//             },
//             {
//               featureType: 'transit',
//               stylers: [{ visibility: 'off' }],
//             },
//           ],
//         }}
//       >
//         {districtsLoadingError ? null : null}
//         {markers.map((marker) => {
//           const isMarkerVisible = markerVisibilityMap
//             ? markerVisibilityMap.get(marker.markerKey) === true
//             : true;
//           const isSelectedMarker = marker.markerKey === selectedMarker?.markerKey;
//           const isHoveredMapMarker = marker.markerKey === hoveredMarker?.markerKey;
//           return (
//             <Marker
//               key={marker.markerKey}
//               position={{ lat: marker.lat, lng: marker.lng }}
//               icon={createCustomMarker(marker.price, isSelectedMarker, isHoveredMapMarker)}
//               options={{
//                 clickable: !drawMode && isMarkerVisible,
//                 visible: isMarkerVisible,
//                 zIndex: isSelectedMarker || isHoveredMapMarker ? 2000 : 1500 // Always stay above POI markers
//               }}
//               onMouseOver={() => {
//                 if (drawMode || !isMarkerVisible || isTouchDevice) return;
//                 setHoveredMarker(marker);
//               }}
//               onMouseOut={() => {
//                 if (isTouchDevice) return;
//                 setHoveredMarker((prev: any) =>
//                   prev?.markerKey === marker.markerKey ? null : prev,
//                 );
//               }}
//               onClick={() => {
//                 if (drawMode || !isMarkerVisible) return;
//                 const markerPos = { lat: marker.lat, lng: marker.lng };
//                 const measureSelectionActive = measureMode || measureModeRef.current;
//                 if (measureSelectionActive) {
//                   panMarkerIntoVisibleArea(markerPos);
//                   applyMeasurePointFromMarker(markerPos, 'listing');
//                   if (marker.id && onMarkerClick) onMarkerClick(marker.id);
//                   return;
//                 }
//                 const sameSelected =
//                   !!selectedMarker &&
//                   (String(marker.markerKey) === String(selectedMarker.markerKey) ||
//                     (marker.id && selectedMarker.id && String(marker.id) === String(selectedMarker.id)) ||
//                     (selectedMarker.lat === marker.lat && selectedMarker.lng === marker.lng));
//                 if (sameSelected) {
//                   setSelectedMarker(null);
//                   onMarkerClick?.('');
//                   return;
//                 }
//                 setSelectedMarker(marker);
//                 setHoveredMarker(marker);
//                 centerOnMarker(markerPos);
//                 applyMeasurePointFromMarker(markerPos, 'listing');
//                 if (marker.id && onMarkerClick) onMarkerClick(marker.id);
//               }}
//             />
//           );
//         })}

//         {hoverPreview ? (
//           <InfoWindow
//             position={hoverPreview.position}
//             onCloseClick={() => {
//               setHoveredMarker(null);
//               if (isTouchDevice) {
//                 setSelectedMarker(null);
//               }
//             }}
//             options={{
//               disableAutoPan: true,
//               pixelOffset: new google.maps.Size(0, -42),
//               maxWidth: 320,
//             }}
//           >
//             <div
//               className="snaphomz-info-window w-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
//               style={{ animation: 'snaphomzMapCardIn 180ms ease-out' }}
//             >
//               <div className="relative h-40 w-full overflow-hidden bg-gray-100">
//                 {hoverPreview.image ? (
//                   <img
//                     src={hoverPreview.image}
//                     alt={hoverPreview.address}
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
//                     No photo available
//                   </div>
//                 )}
//                 <div className="absolute left-2 top-2 z-10 rounded-full bg-[#78de2a] px-2 py-0.5 text-[10px] font-semibold text-black shadow-sm">
//                   {hoverPreview.statusLabel}
//                 </div>
//               </div>
//               <div className="space-y-2 px-4 py-3">
//                 <div className="text-[15px] font-bold leading-none text-gray-900">
//                   {hoverPreview.priceText}
//                 </div>
//                 {hoverPreview.meta ? (
//                   <div className="text-[11px] leading-4 text-gray-600">
//                     {hoverPreview.meta}
//                   </div>
//                 ) : null}
//                 <div className="line-clamp-2 min-h-[2rem] text-[12px] leading-4 text-gray-800">{hoverPreview.address}</div>
//                 <div className="pt-1 text-[10px] uppercase tracking-wide text-gray-400">
//                   {hoverPreview.listingType}
//                 </div>
//               </div>
//             </div>
//           </InfoWindow>
//         ) : null}

//         {measureRoute && (
//           <DirectionsRenderer
//             directions={measureRoute}
//             options={{
//               suppressMarkers: true,
//               preserveViewport: true,
//               polylineOptions: {
//                 strokeColor: '#F57F2E',
//                 strokeOpacity: 0.95,
//                 strokeWeight: 5,
//                 zIndex: 999,
//               },
//             }}
//           />
//         )}

//         {measureStart && (
//           <Marker
//             position={measureStart}
//             draggable
//             onDragEnd={(event) => {
//               if (!event?.latLng) return;
//               setMeasureStart(event.latLng.toJSON());
//             }}
//             label={{ text: 'A', color: 'white', fontWeight: '700' }}
//             icon={{
//               path: google.maps.SymbolPath.CIRCLE,
//               scale: 8,
//               fillColor: '#F57F2E',
//               fillOpacity: 1,
//               strokeColor: '#ffffff',
//               strokeWeight: 2,
//             }}
//           />
//         )}
//         {measureEnd && (
//           <Marker
//             position={measureEnd}
//             draggable
//             onDragEnd={(event) => {
//               if (!event?.latLng) return;
//               setMeasureEnd(event.latLng.toJSON());
//             }}
//             label={{ text: 'B', color: 'white', fontWeight: '700' }}
//             icon={{
//               path: google.maps.SymbolPath.CIRCLE,
//               scale: 8,
//               fillColor: '#0EA5A6',
//               fillOpacity: 1,
//               strokeColor: '#ffffff',
//               strokeWeight: 2,
//             }}
//           />
//         )}

//         {selectedSchool && (
//           <InfoWindow
//             position={selectedSchool.position}
//             onCloseClick={() => setSelectedSchool(null)}
//             options={{
//               disableAutoPan: true,
//               pixelOffset: new google.maps.Size(0, -36),
//               maxWidth: 320,
//             }}
//           >
//             <div className="snaphomz-info-window w-[240px] overflow-hidden rounded-xl bg-white shadow-xl">
//               {selectedSchool.photoUrl ? (
//                 <img
//                   src={selectedSchool.photoUrl}
//                   alt={selectedSchool.name}
//                   className="h-28 w-full object-cover"
//                 />
//               ) : (
//                 <div className="flex h-28 w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
//                   No photo available
//                 </div>
//               )}
//               <div className="space-y-1.5 px-3 py-2.5">
//                 <div className="text-sm font-semibold text-gray-900">{selectedSchool.name}</div>
//                 <div className="text-xs text-gray-600">
//                   {selectedSchool.rating ? (
//                     <>
//                       <span className="text-amber-500">?</span>{' '}
//                       {selectedSchool.rating.toFixed(1)}
//                       {selectedSchool.total ? ` (${selectedSchool.total})` : ''}
//                     </>
//                   ) : (
//                     'No ratings yet'
//                   )}
//                 </div>
//                 {selectedSchool.summary && (
//                   <div className="text-[11px] text-gray-600">{selectedSchool.summary}</div>
//                 )}
//                 {selectedSchool.address && (
//                   <div className="text-[11px] text-gray-500">{selectedSchool.address}</div>
//                 )}
//                 {selectedSchool.phone && (
//                   <div className="text-[11px] text-gray-500">{selectedSchool.phone}</div>
//                 )}
//                 {(selectedSchool.openNow !== undefined || selectedSchool.weeklyHours) && (
//                   <div className="space-y-0.5 text-[11px] text-gray-600">
//                     {selectedSchool.openNow !== undefined && (
//                       <div
//                         className={
//                           selectedSchool.openNow
//                             ? 'font-semibold text-green-600'
//                             : 'font-semibold text-red-600'
//                         }
//                       >
//                         {selectedSchool.openNow ? 'Open Now' : 'Closed Now'}
//                       </div>
//                     )}
//                     {selectedSchool.weeklyHours?.map((line) => (
//                       <div key={line}>{line}</div>
//                     ))}
//                   </div>
//                 )}
//                 {selectedSchool.isLoading && (
//                   <div className="text-[11px] text-gray-400">Loading details...</div>
//                 )}
//               </div>
//             </div>
//           </InfoWindow>
//         )}
//         {selectedSearchPlace && (
//           <InfoWindow
//             position={selectedSearchPlace.position}
//             onCloseClick={() => setSelectedSearchPlace(null)}
//             options={{
//               disableAutoPan: true,
//               pixelOffset: new google.maps.Size(0, -36),
//               maxWidth: 320,
//             }}
//           >
//             <div className="snaphomz-info-window w-[240px] overflow-hidden rounded-xl bg-white shadow-xl">
//               {selectedSearchPlace.photoUrl ? (
//                 <img
//                   src={selectedSearchPlace.photoUrl}
//                   alt={selectedSearchPlace.name}
//                   className="h-28 w-full object-cover"
//                 />
//               ) : (
//                 <div className="flex h-28 w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
//                   No photo available
//                 </div>
//               )}
//               <div className="space-y-1.5 px-3 py-2.5">
//                 <div className="text-sm font-semibold text-gray-900">{selectedSearchPlace.name}</div>
//                 <div className="text-xs text-gray-600">
//                   {selectedSearchPlace.rating ? (
//                     <>
//                       <span className="text-amber-500">?</span>{' '}
//                       {selectedSearchPlace.rating.toFixed(1)}
//                       {selectedSearchPlace.total ? ` (${selectedSearchPlace.total})` : ''}
//                     </>
//                   ) : (
//                     'No ratings yet'
//                   )}
//                 </div>
//                 {selectedSearchPlace.summary && (
//                   <div className="text-[11px] text-gray-600">{selectedSearchPlace.summary}</div>
//                 )}
//                 {selectedSearchPlace.address && (
//                   <div className="text-[11px] text-gray-500">{selectedSearchPlace.address}</div>
//                 )}
//                 {selectedSearchPlace.phone && (
//                   <div className="text-[11px] text-gray-500">{selectedSearchPlace.phone}</div>
//                 )}
//                 {(selectedSearchPlace.openNow !== undefined || selectedSearchPlace.weeklyHours) && (
//                   <div className="space-y-0.5 text-[11px] text-gray-600">
//                     {selectedSearchPlace.openNow !== undefined && (
//                       <div
//                         className={
//                           selectedSearchPlace.openNow
//                             ? 'font-semibold text-green-600'
//                             : 'font-semibold text-red-600'
//                         }
//                       >
//                         {selectedSearchPlace.openNow ? 'Open Now' : 'Closed Now'}
//                       </div>
//                     )}
//                     {selectedSearchPlace.weeklyHours?.map((line) => (
//                       <div key={line}>{line}</div>
//                     ))}
//                   </div>
//                 )}
//                 {selectedSearchPlace.isLoading && (
//                   <div className="text-[11px] text-gray-400">Loading details...</div>
//                 )}
//               </div>
//             </div>
//           </InfoWindow>
//         )}
//       </GoogleMap>
//       <style>{`
//         @keyframes snaphomzMapCardIn {
//           from { opacity: 0; transform: translateY(8px) scale(0.98); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//       `}</style>
//     </div>
//   ) : (
//     <SkeletonLoader className="h-[350px] w-full bg-gray-400 md:col-span-9" />
//   );
// };

// export default React.memo(CustomMap);



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
  /** AI-driven POI categories. When this prop changes, the map syncs its
   *  active category keys to match. Valid values: 'restaurants' | 'gyms' | 'hospitals' | 'parks' */
  externalActivePOICategories?: string[];
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
  // Support both flat and { data: {...} } wrapped shapes — must match BuyPropertyCards
  const d = item?.data || item;
  const raw =
    d?.id ??
    d?.listingId ??
    d?.listing_id ??
    d?.listing?.id ??
    d?.listing?.listingId ??
    d?.ListingKey ??
    d?.ListingId ??
    d?.mlsId ??
    d?.mls_id ??
    d?.propertyId;
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
  externalActivePOICategories,
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
  const [hoverCardPixel, setHoverCardPixel] = useState<{ x: number; y: number } | null>(null);
  const hoverClearTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [schoolViewportRefreshTick, setSchoolViewportRefreshTick] = useState(0);
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
  const selectedPlaceMetaRef = React.useRef<{ name: string; shortName?: string; types: string[] }>({
    name: '',
    shortName: undefined,
    types: [],
  });
  const placeBoundaryCacheRef = React.useRef<Map<string, boolean>>(new Map());
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

  const getActiveSearchBounds = useCallback(() => {
    const activePolygon = drawPolygonRef.current ?? drawPolygon;
    if (activePolygon) {
      const path = activePolygon.getPath();
      if (path && path.getLength() > 0) {
        const bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < path.getLength(); i += 1) {
          bounds.extend(path.getAt(i));
        }
        return bounds;
      }
    }
    return mapInstance?.getBounds() ?? null;
  }, [drawPolygon, mapInstance]);

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
      parks: { label: 'Parks', color: '#8B5CF6', query: 'parks' },
    }),
    [],
  );

  const renderExploreCategoryIcon = (key: keyof typeof quickCategories) => {
    if (key === 'restaurants') {
      return (
        <svg viewBox="10 10 20 20" className="h-6 w-6 text-gray-900" aria-hidden="true">
          <path
            d="M25.5 14.5V26C25.5 26.1326 25.4473 26.2598 25.3536 26.3535C25.2598 26.4473 25.1326 26.5 25 26.5C24.8674 26.5 24.7402 26.4473 24.6464 26.3535C24.5527 26.2598 24.5 26.1326 24.5 26V23H21.5C21.3674 23 21.2402 22.9473 21.1464 22.8535C21.0527 22.7598 21 22.6326 21 22.5C21.0232 21.3023 21.1745 20.1105 21.4513 18.945C22.0625 16.4144 23.2213 14.7181 24.8031 14.0406C24.8792 14.0081 24.9621 13.9949 25.0445 14.0022C25.1269 14.0096 25.2061 14.0372 25.2752 14.0828C25.3442 14.1283 25.4009 14.1902 25.4402 14.2631C25.4794 14.3359 25.5 14.4173 25.5 14.5ZM19.4931 14.4181C19.4833 14.3525 19.4606 14.2894 19.4262 14.2327C19.3917 14.1759 19.3464 14.1266 19.2927 14.0875C19.239 14.0485 19.1781 14.0205 19.1135 14.0053C19.0489 13.99 18.9819 13.9878 18.9164 13.9987C18.8509 14.0096 18.7883 14.0334 18.7321 14.0688C18.6759 14.1042 18.6274 14.1504 18.5893 14.2047C18.5511 14.2591 18.5242 14.3205 18.5101 14.3853C18.4959 14.4502 18.4948 14.5172 18.5069 14.5825L18.9931 17.5H17.5V14.5C17.5 14.3674 17.4473 14.2402 17.3536 14.1464C17.2598 14.0527 17.1326 14 17 14C16.8674 14 16.7402 14.0527 16.6464 14.1464C16.5527 14.2402 16.5 14.3674 16.5 14.5V17.5H15.0069L15.4931 14.5825C15.5052 14.5172 15.5041 14.4502 15.4899 14.3853C15.4758 14.3205 15.4489 14.2591 15.4107 14.2047C15.3726 14.1504 15.3241 14.1042 15.2679 14.0688C15.2117 14.0334 15.1491 14.0096 15.0836 13.9987C15.0181 13.9878 14.9511 13.99 14.8865 14.0053C14.8219 14.0205 14.761 14.0485 14.7073 14.0875C14.6536 14.1266 14.6083 14.1759 14.5738 14.2327C14.5394 14.2894 14.5167 14.3525 14.5069 14.4181L14.0069 17.4181C14.0024 17.4452 14.0001 17.4726 14 17.5C14.001 18.2086 14.2524 18.8941 14.7099 19.4353C15.1674 19.9765 15.8014 20.3385 16.5 20.4575V26C16.5 26.1326 16.5527 26.2598 16.6464 26.3535C16.7402 26.4473 16.8674 26.5 17 26.5C17.1326 26.5 17.2598 26.4473 17.3536 26.3535C17.4473 26.2598 17.5 26.1326 17.5 26V20.4575C18.1986 20.3385 18.8326 19.9765 19.2901 19.4353C19.7476 18.8941 19.999 18.2086 20 17.5C19.9999 17.4726 19.9976 17.4452 19.9931 17.4181L19.4931 14.4181Z"
            fill="currentColor"
          />
        </svg>
      );
    }
    if (key === 'gyms') {
      return (
        <svg viewBox="10 10 20 20" className="h-6 w-6 text-gray-900" aria-hidden="true">
          <path
            d="M24.5001 16V24C24.5001 24.2652 24.3948 24.5196 24.2072 24.7071C24.0197 24.8946 23.7653 25 23.5001 25H22.5001C22.2349 25 21.9806 24.8946 21.793 24.7071C21.6055 24.5196 21.5001 24.2652 21.5001 24V20.5H18.5001V24C18.5001 24.2652 18.3948 24.5196 18.2072 24.7071C18.0197 24.8946 17.7653 25 17.5001 25H16.5001C16.2349 25 15.9806 24.8946 15.793 24.7071C15.6055 24.5196 15.5001 24.2652 15.5001 24V16C15.5001 15.7348 15.6055 15.4804 15.793 15.2929C15.9806 15.1054 16.2349 15 16.5001 15H17.5001C17.7653 15 18.0197 15.1054 18.2072 15.2929C18.3948 15.4804 18.5001 15.7348 18.5001 16V19.5H21.5001V16C21.5001 15.7348 21.6055 15.4804 21.793 15.2929C21.9806 15.1054 22.2349 15 22.5001 15H23.5001C23.7653 15 24.0197 15.1054 24.2072 15.2929C24.3948 15.4804 24.5001 15.7348 24.5001 16ZM14.2501 16.5H14.0001C13.7349 16.5 13.4806 16.6054 13.293 16.7929C13.1055 16.9804 13.0001 17.2348 13.0001 17.5V19.5H12.517C12.3878 19.4981 12.2627 19.5452 12.1668 19.6318C12.0709 19.7184 12.0113 19.8381 12.0001 19.9669C11.9956 20.0353 12.0052 20.1039 12.0282 20.1684C12.0513 20.2329 12.0874 20.292 12.1343 20.342C12.1812 20.392 12.2379 20.4319 12.3008 20.459C12.3637 20.4862 12.4316 20.5002 12.5001 20.5H13.0001V22.5C13.0001 22.7652 13.1055 23.0196 13.293 23.2071C13.4806 23.3946 13.7349 23.5 14.0001 23.5H14.2501C14.3164 23.5 14.38 23.4737 14.4269 23.4268C14.4738 23.3799 14.5001 23.3163 14.5001 23.25V16.75C14.5001 16.6837 14.4738 16.6201 14.4269 16.5732C14.38 16.5263 14.3164 16.5 14.2501 16.5ZM28.0001 19.9669C27.9889 19.8384 27.9296 19.7188 27.8339 19.6322C27.7383 19.5456 27.6135 19.4984 27.4845 19.5H27.0001V17.5C27.0001 17.2348 26.8948 16.9804 26.7072 16.7929C26.5197 16.6054 26.2653 16.5 26.0001 16.5H25.7501C25.6838 16.5 25.6202 16.5263 25.5733 16.5732C25.5265 16.6201 25.5001 16.6837 25.5001 16.75V23.25C25.5001 23.3163 25.5265 23.3799 25.5733 23.4268C25.6202 23.4737 25.6838 23.5 25.7501 23.5H26.0001C26.2653 23.5 26.5197 23.3946 26.7072 23.2071C26.8948 23.0196 27.0001 22.7652 27.0001 22.5V20.5H27.5001C27.5687 20.5002 27.6365 20.4862 27.6994 20.459C27.7624 20.4319 27.819 20.392 27.8659 20.342C27.9128 20.292 27.9489 20.2329 27.972 20.1684C27.9951 20.1039 28.0047 20.0353 28.0001 19.9669Z"
            fill="currentColor"
          />
        </svg>
      );
    }
    if (key === 'hospitals') {
      return (
        <svg viewBox="0 0 256 256" className="h-6 w-6 text-gray-900" aria-hidden="true">
          <path
            d="M248,208h-8V128a16,16,0,0,0-16-16H168V48a16,16,0,0,0-16-16H56A16,16,0,0,0,40,48V208H32a8,8,0,0,0,0,16H248a8,8,0,0,0,0-16Zm-24-80v80H168V128ZM56,48h96V208H136V160a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v48H56Zm64,160H88V168h32ZM72,96a8,8,0,0,1,8-8H96V72a8,8,0,0,1,16,0V88h16a8,8,0,0,1,0,16H112v16a8,8,0,0,1-16,0V104H80A8,8,0,0,1,72,96Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    if (key === 'parks') {
      return (
        <svg viewBox="0 0 256 256" className="h-6 w-6 text-gray-900" aria-hidden="true">
          <path
            d="M248,128H200.94l-28-56H192a8,8,0,0,0,0-16H64a8,8,0,0,0,0,16H83.06l-28,56H8a8,8,0,0,0,0,16H47.06L24.84,188.42a8,8,0,0,0,3.58,10.73A7.9,7.9,0,0,0,32,200a8,8,0,0,0,7.17-4.42L64.94,144H191.06l25.78,51.58A8,8,0,0,0,224,200a7.9,7.9,0,0,0,3.57-.85,8,8,0,0,0,3.58-10.73L208.94,144H248a8,8,0,0,0,0-16ZM72.94,128l28-56h54.12l28,56Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return null;
  };

  const renderSchoolExploreIcon = () => (
    <svg viewBox="12 12 16 16" className="h-5 w-5 text-gray-900" aria-hidden="true">
      <path d="M23.0001 24.9525C23.345 24.8166 23.6793 24.6551 24.0001 24.4694V27C24.0001 27.1326 23.9474 27.2598 23.8536 27.3535C23.7599 27.4473 23.6327 27.5 23.5001 27.5C23.3675 27.5 23.2403 27.4473 23.1465 27.3535C23.0528 27.2598 23.0001 27.1326 23.0001 27V24.9525ZM23.7351 19.4256L20.2351 17.5587C20.1183 17.4991 19.9828 17.4877 19.8577 17.527C19.7326 17.5664 19.628 17.6533 19.5663 17.769C19.5047 17.8847 19.491 18.02 19.5282 18.1458C19.5653 18.2715 19.6504 18.3776 19.7651 18.4412L22.6876 20L23.7501 19.4337L23.7351 19.4256ZM27.7351 17.5587L20.2351 13.5587C20.1627 13.5202 20.082 13.5001 20.0001 13.5001C19.9181 13.5001 19.8374 13.5202 19.7651 13.5587L12.2651 17.5587C12.1851 17.6014 12.1182 17.665 12.0715 17.7427C12.0249 17.8204 12.0002 17.9093 12.0002 18C12.0002 18.0906 12.0249 18.1796 12.0715 18.2573C12.1182 18.335 12.1851 18.3986 12.2651 18.4412L14.0001 19.3669V22.3931C13.9996 22.6387 14.09 22.8758 14.2538 23.0587C15.0726 23.9706 16.907 25.5 20.0001 25.5C21.0257 25.5085 22.0436 25.3227 23.0001 24.9525V20.1669L22.6876 20L20.0001 21.4331L14.7395 18.625L13.5626 18L20.0001 14.5669L26.4376 18L25.2638 18.625H25.2601L23.7501 19.4337C23.8261 19.4776 23.8892 19.5408 23.9331 19.6168C23.977 19.6928 24.0001 19.7791 24.0001 19.8669V24.4694C24.6521 24.093 25.2413 23.617 25.7463 23.0587C25.9102 22.8758 26.0006 22.6387 26.0001 22.3931V19.3669L27.7351 18.4412C27.8151 18.3986 27.882 18.335 27.9286 18.2573C27.9753 18.1796 27.9999 18.0906 27.9999 18C27.9999 17.9093 27.9753 17.8204 27.9286 17.7427C27.882 17.665 27.8151 17.6014 27.7351 17.5587Z" fill="currentColor" />
    </svg>
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

      // Only notify parent when IDs actually changed  prevents infinite re-render loop
      // where onDrawFilterChange ? parent re-render ? new markers ? this effect fires again
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
    // onDrawFilterChange intentionally omitted  accessed via ref to keep this callback stable
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
    // onDrawFilterChange accessed via ref ? empty deps ? stable reference.
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
  // without listing it as a dependency (which would cause the effect to re-run  and
  // reset freehandDrawingActiveRef  whenever markers change during an active draw).
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
    // handlePolygonComplete intentionally omitted from deps  accessed via ref so the effect
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
    if (!isLoaded || !mapInstance || districtFeatures.length === 0) return;
    if (!showDistricts) {
      setMatchedDistricts([]);
      return;
    }

    if (!google?.maps?.geometry?.poly?.containsLocation) {
      console.error('[districts] geometry library missing. Check maps loader libraries.');
      return;
    }

    const scopedMarkers = hasActiveDrawPolygon
      ? markers.filter((marker) => isPointInsideActiveDrawPolygon({ lat: marker.lat, lng: marker.lng }))
      : markers;
    if (scopedMarkers.length === 0) {
      setMatchedDistricts([]);
      return;
    }

    const cache = districtPolygonCacheRef.current;
    const matchedIds = new Set<string>();
    const matched: DistrictFeature[] = [];

    for (const marker of scopedMarkers) {
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
  }, [
    isLoaded,
    mapInstance,
    markers,
    showDistricts,
    districtFeatures,
    getDistrictId,
    hasActiveDrawPolygon,
    isPointInsideActiveDrawPolygon,
  ]);

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
    stroke="#F07639"
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
      hospitals: '/assets/icons/HospitalPin.svg?v=3',
      parks: '/assets/icons/ParkPin.svg',
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

  useEffect(() => {
    placeBoundaryCacheRef.current.clear();
  }, [selectedPlaceId]);

  const isLocationInsideSelectedPlace = useCallback((location: google.maps.LatLng) => {
    if (!selectedPlaceId) return Promise.resolve(false);

    const key = `${selectedPlaceId}:${location.lat().toFixed(6)}:${location.lng().toFixed(6)}`;
    const cached = placeBoundaryCacheRef.current.get(key);
    if (cached !== undefined) return Promise.resolve(cached);

    const geocoder = new google.maps.Geocoder();
    return new Promise<boolean>((resolve) => {
      geocoder.geocode({ location }, (geoResults, geoStatus) => {
        if (geoStatus !== 'OK' || !geoResults || geoResults.length === 0) {
          placeBoundaryCacheRef.current.set(key, false);
          resolve(false);
          return;
        }

        const meta = selectedPlaceMetaRef.current;
        const preferredType = meta.types.find((type) =>
          [
            'administrative_area_level_1',
            'administrative_area_level_2',
            'locality',
            'postal_town',
            'sublocality',
            'neighborhood',
            'political',
          ].includes(type),
        );

        const normalizedName = meta.name.trim().toLowerCase();
        const normalizedShort = (meta.shortName || '').trim().toLowerCase();

        const insideByPlaceId = geoResults.some((result) => result.place_id === selectedPlaceId);
        const insideByMeta = !insideByPlaceId && normalizedName
          ? geoResults.some((result) => {
            const comps = result.address_components || [];
            const matchedComponent = preferredType
              ? comps.find((comp) => comp.types?.includes(preferredType))
              : undefined;

            const candidates: string[] = [];
            if (matchedComponent?.long_name) candidates.push(matchedComponent.long_name.toLowerCase());
            if (matchedComponent?.short_name) candidates.push(matchedComponent.short_name.toLowerCase());
            if (result.formatted_address) candidates.push(result.formatted_address.toLowerCase());

            return candidates.some((value) =>
              value === normalizedName ||
              (normalizedShort && value === normalizedShort) ||
              value.includes(normalizedName),
            );
          })
          : false;

        const inside = insideByPlaceId || insideByMeta;
        placeBoundaryCacheRef.current.set(key, inside);
        resolve(inside);
      });
    });
  }, [selectedPlaceId]);

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
      const requestId = opts?.categoryKey
        ? ((categoryRequestIdRef.current[opts.categoryKey] ?? 0) + 1)
        : ++searchRequestIdRef.current;
      if (opts?.categoryKey) categoryRequestIdRef.current[opts.categoryKey] = requestId;
      const viewportBounds = opts?.viewportOverride ?? getActiveSearchBounds();
      if (!viewportBounds) {
        if (opts?.categoryKey) clearCategoryMarkers(opts.categoryKey);
        else clearSearchMarkers();
        return;
      }

      const locationBounds = searchPlaceBoundsRef.current;
      const service = new google.maps.places.PlacesService(mapInstance);
      const results: google.maps.places.PlaceResult[] = [];

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

        const isRequestActive = () => {
          if (opts?.categoryKey) {
            return (
              requestId === categoryRequestIdRef.current[opts.categoryKey] &&
              activeCategoryKeysRef.current.has(opts.categoryKey)
            );
          }
          return requestId === searchRequestIdRef.current;
        };
        if (!isRequestActive()) return;

        void (async () => {
          const icon = createCategoryPinIcon(opts?.iconColor ?? '#ef4444', opts?.categoryKey);
          const isCategorySearch = Boolean(opts?.categoryKey);
          const hasSelectedBoundary = Boolean(selectedPlaceId);
          const filteredByViewport = results.filter((place) => {
            const location = place.geometry?.location;
            if (!location) return false;
            if (!viewportBounds.contains(location)) return false;
            return true;
          });
          const filteredByLocation = filteredByViewport.filter((place) => {
            const location = place.geometry?.location;
            if (!location) return false;
            if (locationBounds && !locationBounds.contains(location)) return false;
            return true;
          });
          // Use strict searched-place boundary behavior for both quick categories
          // and free-text explore search results.
          let finalFiltered = locationBounds ? filteredByLocation : [];

          if (hasSelectedBoundary && finalFiltered.length > 0) {
            const insideChecks = await Promise.all(
              finalFiltered.map((place) => {
                const location = place.geometry?.location;
                if (!location) return Promise.resolve(false);
                return isLocationInsideSelectedPlace(location);
              }),
            );
            if (!isRequestActive()) return;
            finalFiltered = finalFiltered.filter((_, idx) => insideChecks[idx]);
          }

          if (!isRequestActive()) return;
          if (opts?.categoryKey) clearCategoryMarkers(opts.categoryKey);
          else clearSearchMarkers();

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
        })();
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
      isLocationInsideSelectedPlace,
      getActiveSearchBounds,
      mapInstance,
      selectedPlaceId,
    ],
  );

  const refreshActiveExploreCategories = useCallback((viewportOverride?: google.maps.LatLngBounds) => {
    if (!mapInstance || activeCategoryKeys.length === 0) return;
    const bounds = viewportOverride ?? getActiveSearchBounds();
    if (!bounds) return;

    activeCategoryKeys.forEach((key) => {
      const cfg = quickCategories[key as keyof typeof quickCategories];
      if (!cfg) return;
      runTextSearch(cfg.query, {
        categoryKey: key,
        iconColor: cfg.color,
        viewportOverride: bounds,
      });
    });
  }, [mapInstance, activeCategoryKeys, quickCategories, runTextSearch, getActiveSearchBounds]);

  useEffect(() => {
    if (!mapInstance) return;
    const hasExploreSelections = activeCategoryKeys.length > 0 || exploreSearchInput.trim().length > 0;
    if (!hasExploreSelections) return;

    const bounds = getActiveSearchBounds();
    if (!bounds) return;

    activeCategoryKeys.forEach((key) => {
      const cfg = quickCategories[key as keyof typeof quickCategories];
      if (!cfg) return;
      runTextSearch(cfg.query, {
        categoryKey: key,
        iconColor: cfg.color,
        viewportOverride: bounds,
      });
    });

    const query = exploreSearchInput.trim();
    if (query) {
      runTextSearch(query, { viewportOverride: bounds });
    }
  }, [
    mapInstance,
    drawPolygon,
    hasActiveDrawPolygon,
    activeCategoryKeys,
    exploreSearchInput,
    quickCategories,
    runTextSearch,
    getActiveSearchBounds,
  ]);

  useEffect(() => {
    if (!isLoaded || !mapInstance || activeCategoryKeys.length === 0) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const listener = mapInstance.addListener('idle', () => {
      if (drawMode || hasActiveDrawPolygon) return;
      const bounds = mapInstance.getBounds();
      if (!bounds) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        refreshActiveExploreCategories(bounds);
      }, 120);
    });

    return () => {
      if (timer) clearTimeout(timer);
      google.maps.event.removeListener(listener);
    };
  }, [
    isLoaded,
    mapInstance,
    activeCategoryKeys,
    drawMode,
    hasActiveDrawPolygon,
    refreshActiveExploreCategories,
  ]);

  useEffect(() => {
    if (!isLoaded || !mapInstance || !showDistricts) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const listener = mapInstance.addListener('idle', () => {
      if (drawMode || hasActiveDrawPolygon) return;

      const meta = selectedPlaceMetaRef.current;
      const nameLower = (meta.name || '').toLowerCase();
      const shortLower = (meta.shortName || '').toLowerCase();
      const queryLower = (searchQuery || '').toLowerCase();
      const isCaliforniaContext =
        shortLower === 'ca' ||
        nameLower.includes('california') ||
        /\bcalifornia\b/.test(queryLower) ||
        /,\s*ca\b/.test(queryLower) ||
        /\bca\s+\d{5}\b/.test(queryLower);

      // For California district mode, keep existing behavior.
      // Viewport-driven school refresh is only for non-CA fallback mode.
      if (isCaliforniaContext || matchedDistricts.length > 0) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setSchoolViewportRefreshTick((prev) => prev + 1);
      }, 120);
    });

    return () => {
      if (timer) clearTimeout(timer);
      google.maps.event.removeListener(listener);
    };
  }, [
    isLoaded,
    mapInstance,
    showDistricts,
    drawMode,
    hasActiveDrawPolygon,
    matchedDistricts.length,
    searchQuery,
  ]);


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
    selectedPlaceMetaRef.current = {
      name: lastLocation || trimmedQuery,
      shortName: undefined,
      types: [],
    };

    const service = new google.maps.places.PlacesService(mapInstance);
    const updateSearchBounds = (geometry?: google.maps.places.PlaceGeometry | null) => {
      if (!geometry) {
        searchPlaceBoundsRef.current = null;
        return;
      }
      // Prefer bounds (full place extent) over viewport (recommended crop) so
      // boundary filtering and map centering cover the entire place polygon.
      const targetBounds = (geometry as any).bounds ?? geometry.viewport;
      if (targetBounds) {
        searchPlaceBoundsRef.current = targetBounds;
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
      // Prefer bounds over viewport: bounds covers the full extent of the place
      // (entire city polygon), while viewport is just the recommended display crop
      // which can cut off the boundary drawn by the Feature Layer.
      const targetBounds = (geometry as any).bounds ?? geometry.viewport;
      if (targetBounds) {
        // The listings panel overlays the left ~44vw of the map container (max 620px).
        // Using asymmetric padding shifts the effective center into the visible right
        // portion so the city boundary is never hidden behind the panel.
        const leftPanelWidth = typeof window !== 'undefined'
          ? Math.min(620, Math.round(window.innerWidth * 0.44)) + 40
          : 60;
        mapInstance.fitBounds(targetBounds, { top: 60, right: 60, bottom: 60, left: leftPanelWidth });
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
            selectedPlaceMetaRef.current = {
              name: place?.name ?? (lastLocation || trimmedQuery),
              shortName: undefined,
              types,
            };
            // findPlaceFromQuery geometry only has viewport, not bounds.
            // Call getDetails to get the full geometry (including bounds) so
            // fitBounds shows the entire city polygon without cropping.
            if (place?.place_id) {
              service.getDetails(
                { placeId: place.place_id, fields: ['geometry'] },
                (detail, detailStatus) => {
                  const geo = detailStatus === google.maps.places.PlacesServiceStatus.OK
                    ? detail?.geometry ?? place?.geometry
                    : place?.geometry;
                  updateSearchBounds(geo ?? null);
                  focusQueryGeometry(geo ?? null);
                },
              );
            } else {
              updateSearchBounds(place?.geometry ?? null);
              focusQueryGeometry(place?.geometry ?? null);
            }
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

          const primary = geoResults[0];
          const preferredType = (primary?.types || []).find((type) =>
            [
              'administrative_area_level_1',
              'administrative_area_level_2',
              'locality',
              'postal_town',
              'sublocality',
              'neighborhood',
              'political',
            ].includes(type),
          );
          const matchedComp = preferredType
            ? primary?.address_components?.find((comp) => comp.types?.includes(preferredType))
            : undefined;
          selectedPlaceMetaRef.current = {
            name: matchedComp?.long_name || primary?.formatted_address || (lastLocation || trimmedQuery),
            shortName: matchedComp?.short_name || undefined,
            types: primary?.types || [],
          };

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

    // Use textSearch (same as Restaurants / Gyms / Parks)  single API call,
    // no async-chain cancellation risk. District polygon containment is applied
    // as a post-filter so pins only render inside the drawn district borders.
    const cache = districtPolygonCacheRef.current;
    const matchedEntries = matchedDistricts
      .map((feature) => cache.get(getDistrictId(feature)))
      .filter(Boolean) as DistrictPolygonCacheEntry[];
    const polygons = matchedEntries.flatMap((entry) => entry.polygons);
    const meta = selectedPlaceMetaRef.current;
    const nameLower = (meta.name || '').toLowerCase();
    const shortLower = (meta.shortName || '').toLowerCase();
    const queryLower = (searchQuery || '').toLowerCase();
    const isCaliforniaContext =
      shortLower === 'ca' ||
      nameLower.includes('california') ||
      /\bcalifornia\b/.test(queryLower) ||
      /,\s*ca\b/.test(queryLower) ||
      /\bca\s+\d{5}\b/.test(queryLower);
    const useDistrictPolygons = polygons.length > 0;

    // Keep existing California behavior: if districts are expected but not ready/matched, render no schools.
    if (!useDistrictPolygons && isCaliforniaContext) {
      clearSchoolMarkers();
      return;
    }

    const viewportBounds = getActiveSearchBounds();
    if (!viewportBounds) {
      clearSchoolMarkers();
      return;
    }

    const locationBounds = searchPlaceBoundsRef.current;
    const service = new google.maps.places.PlacesService(mapInstance);
    let stale = false;

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const collectPlacesForBounds = (bounds: google.maps.LatLngBounds) =>
      new Promise<google.maps.places.PlaceResult[]>((resolve) => {
        const results: google.maps.places.PlaceResult[] = [];
        let settled = false;
        const finish = (value: google.maps.places.PlaceResult[]) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };

        const handlePage = (
          pageResults: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus,
          pagination: google.maps.places.PlaceSearchPagination | null,
        ) => {
          if (stale) {
            finish([]);
            return;
          }
          if (status === google.maps.places.PlacesServiceStatus.OK && pageResults) {
            results.push(...pageResults);
          }
          // Keep this single-page for speed/stability when many districts are matched.
          // We only need representative school pins per district, not full place exhaust.
          void pagination;
          finish(results);
        };

        const center = bounds.getCenter();
        const radius = Math.max(
          800,
          Math.min(
            50000,
            Math.round(google.maps.geometry.spherical.computeDistanceBetween(center, bounds.getNorthEast())),
          ),
        );

        service.nearbySearch(
          {
            location: center,
            radius,
            type: 'school',
          },
          handlePage,
        );
      });

    const buildDistrictSearchBounds = (entry: DistrictPolygonCacheEntry) => {
      if (!entry.bounds || entry.bounds.length === 0) return null;
      const merged = new google.maps.LatLngBounds();
      entry.bounds.forEach((b) => merged.union(b));
      return merged;
    };

    const run = async () => {
      const allResults: google.maps.places.PlaceResult[] = [];
      if (useDistrictPolygons) {
        for (let i = 0; i < matchedEntries.length; i += 1) {
          if (stale) return;
          const entry = matchedEntries[i];
          if (!entry) continue;
          const searchBounds = buildDistrictSearchBounds(entry);
          if (!searchBounds) continue;
          const places = await collectPlacesForBounds(searchBounds);
          if (stale) return;
          allResults.push(...places);
          if (i < matchedEntries.length - 1) {
            await wait(120);
          }
        }
      } else {
        const places = await collectPlacesForBounds(viewportBounds);
        if (stale) return;
        allResults.push(...places);
      }

      if (stale) return;

      clearSchoolMarkers();

      const uniqueById = new Map<string, google.maps.places.PlaceResult>();
      for (const place of allResults) {
        const loc = place.geometry?.location;
        if (!loc) continue;
        const fallbackKey = `${place.name ?? 'school'}:${loc.lat().toFixed(6)}:${loc.lng().toFixed(6)}`;
        uniqueById.set(place.place_id || fallbackKey, place);
      }
      const uniqueResults = Array.from(uniqueById.values());

      // Mirror strict boundary behavior:
      //   1. Must be within the current viewport
      //   2. Must be within the searched-place bounds (no viewport fallback)
      //   3. For California district mode, must also be inside a matched school-district polygon
      const inViewport = uniqueResults.filter((p) => {
        const loc = p.geometry?.location;
        return loc && viewportBounds.contains(loc);
      });
      const inCity = inViewport.filter((p) => {
        const loc = p.geometry?.location;
        return loc && (!locationBounds || locationBounds.contains(loc));
      });
      const candidatePool = locationBounds ? inCity : [];
      let placesToRender = useDistrictPolygons
        ? candidatePool.filter((p) => {
          const loc = p.geometry?.location;
          return loc && polygons.some((poly) => google.maps.geometry.poly.containsLocation(loc, poly));
        })
        : candidatePool;

      if (selectedPlaceId && placesToRender.length > 0) {
        const insideChecks = await Promise.all(
          placesToRender.map((place) => {
            const loc = place.geometry?.location;
            if (!loc) return Promise.resolve(false);
            return isLocationInsideSelectedPlace(loc);
          }),
        );
        if (stale) return;
        placesToRender = placesToRender.filter((_, idx) => insideChecks[idx]);
      }

      const schoolIconUrl = '/assets/icons/Education.svg';
      const markers = placesToRender.map((place) => {
        const loc = place.geometry?.location;
        if (!loc) return null;
        const position = { lat: loc.lat(), lng: loc.lng() };
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
      }).filter(Boolean) as google.maps.Marker[];

      schoolMarkersRef.current = markers;
    };

    void run();

    return () => {
      stale = true;
    };
  }, [
    isLoaded,
    mapInstance,
    matchedDistricts,
    showDistricts,
    searchQuery,
    schoolViewportRefreshTick,
    getDistrictId,
    fetchPlaceDetails,
    applyMeasurePointFromMarker,
    centerOnMeasurePoint,
    isPointInsideActiveDrawPolygon,
    isLocationInsideSelectedPlace,
    getActiveSearchBounds,
    selectedPlaceId,
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

  // Listen on the Data layer directly  the Data layer intercepts feature clicks
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

  const scheduleHoverClear = useCallback((markerKey: string) => {
    if (hoverClearTimerRef.current) clearTimeout(hoverClearTimerRef.current);
    hoverClearTimerRef.current = setTimeout(() => {
      setHoveredMarker((prev: any) => prev?.markerKey === markerKey ? null : prev);
    }, 120);
  }, []);

  const cancelHoverClear = useCallback(() => {
    if (hoverClearTimerRef.current) {
      clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    if (!previewAnchorMarker) {
      setHoverCardPixel(null);
      return;
    }
    const projection = projectionOverlayRef.current?.getProjection?.();
    if (!projection) {
      setHoverCardPixel(null);
      return;
    }
    const pixel = projection.fromLatLngToContainerPixel(
      new google.maps.LatLng(previewAnchorMarker.lat, previewAnchorMarker.lng),
    );
    if (pixel) setHoverCardPixel({ x: pixel.x, y: pixel.y });
    else setHoverCardPixel(null);
  }, [previewAnchorMarker]);

  const hoverCardStyle = useMemo(() => {
    if (!hoverCardPixel || !mapInstance) return null;
    const CARD_W = 300;
    const CARD_H = 278;
    const PILL_ANCHOR_Y = 40; // anchorY for normal marker (pixels from lat/lng to top of pill)
    const GAP = 4;
    const mapDiv = mapInstance.getDiv();
    const mapW = mapDiv?.clientWidth ?? 800;

    const { x, y } = hoverCardPixel;
    // preferred: card bottom sits just above the pill top
    const pillTop = y - PILL_ANCHOR_Y;
    let top: number;
    if (pillTop - GAP - CARD_H >= 4) {
      top = pillTop - GAP - CARD_H;
    } else {
      // not enough room above: show below the anchor point
      top = y + GAP;
    }
    let left = Math.round(x - CARD_W / 2);
    left = Math.max(8, Math.min(mapW - CARD_W - 8, left));
    return { top, left };
  }, [hoverCardPixel, mapInstance]);

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
      // If a city/place boundary is active, always fit to the place bounds so
      // the full boundary polygon stays visible after markers load.
      if (selectedPlaceId && searchPlaceBoundsRef.current) {
        const leftPanelWidth = typeof window !== 'undefined'
          ? Math.min(620, Math.round(window.innerWidth * 0.44)) + 40
          : 60;
        mapInstance.fitBounds(searchPlaceBoundsRef.current, { top: 60, right: 60, bottom: 60, left: leftPanelWidth });
        lastAutoFitQueryRef.current = currentQueryKey;
        return;
      }
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
  }, [mapInstance, markers, zoom, drawMode, hasActiveDrawPolygon, searchQuery, useOverlayResultsRail, selectedPlaceId]);

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

  // Sync AI-driven POI categories from parent prop
  useEffect(() => {
    if (!externalActivePOICategories || !isLoaded || !mapInstance) return;
    const validKeys = Object.keys(quickCategories) as Array<keyof typeof quickCategories>;
    // Enable keys present in prop but not yet active
    externalActivePOICategories.forEach((key) => {
      if (validKeys.includes(key as keyof typeof quickCategories) && !activeCategoryKeys.includes(key)) {
        toggleExploreCategory(key as keyof typeof quickCategories);
      }
    });
    // Disable keys active internally but removed from prop
    activeCategoryKeys.forEach((key) => {
      if (!externalActivePOICategories.includes(key)) {
        toggleExploreCategory(key as keyof typeof quickCategories);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalActivePOICategories]);

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
        className={cn(
          'absolute z-30 pointer-events-auto',
          shouldHideControls ? 'hidden' : '',
          isTouchDevice ? 'hidden' : '',
          useOverlayResultsRail && !isTouchDevice
            ? 'left-[calc(min(44vw,620px)+16px)] top-3 sm:top-4'
            : 'left-3 top-3 sm:left-4 sm:top-4',
        )}
      >
        <div className="relative flex items-start">
          <div className="inline-flex items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur">
            <button
              type="button"
              title="Explore Search"
              onClick={() => setActiveToolPanel((prev) => (prev === 'explore' ? null : 'explore'))}
              className={cn(
                'flex h-12 w-12 items-center justify-center border-r border-gray-200 text-gray-700 transition-colors',
                activeToolPanel === 'explore' ? 'bg-gray-50' : 'bg-white hover:bg-gray-50',
              )}
              aria-label="Explore places"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Zm0 2a5 5 0 1 1 0 10a5 5 0 0 1 0-10Z" fill="#111827" />
                <path d="M15.8 15.8l3.9 3.9" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

          {activeToolPanel === 'explore' && (
            <div className="flex h-12 items-center gap-2 px-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-1 scrollbar-hide">
                {onOverlayChange && (
                  <button
                    type="button"
                    onClick={() => onOverlayChange(overlayValue === 'schools' ? 'none' : 'schools')}
                    className={cn(
                      'flex h-10 min-w-[68px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[10px] font-medium transition-colors',
                      overlayValue === 'schools'
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                    )}
                  >
                    {renderSchoolExploreIcon()}
                    <span className="leading-tight">Schools</span>
                  </button>
                )}
                {Object.entries(quickCategories).map(([key, cfg]) => {
                  const active = activeCategoryKeys.includes(key);
                  const icon = renderExploreCategoryIcon(key as keyof typeof quickCategories);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleExploreCategory(key as keyof typeof quickCategories)}
                      className={cn(
                        'flex h-10 min-w-[68px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[10px] font-medium transition-colors',
                        active ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                      )}
                    >
                      {icon ?? <span className="h-5 w-5" aria-hidden />}
                      <span className="leading-tight">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              <form
                className="flex shrink-0 items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitExploreSearch();
                }}
              >
                <div className="min-w-0">
                  <input
                    type="text"
                    value={exploreSearchInput}
                    onChange={(e) => setExploreSearchInput(e.target.value)}
                    placeholder="Search places in view"
                    className="block h-10 w-[200px] appearance-none rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none ring-0 focus:border-gray-400 sm:w-[240px]"
                    style={{
                      lineHeight: '20px',
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 shrink-0 rounded-md bg-gray-900 px-3 text-xs font-semibold text-white hover:bg-black"
                >
                  Go
                </button>
              </form>
            </div>
          )}
          </div>
        </div>
      </div>

      <div
        ref={controlsDockRef}
        className={cn(
          'absolute z-30 pointer-events-auto',
          shouldHideControls ? 'hidden' : '',
          isTouchDevice ? 'right-3 bottom-[132px]' : 'right-3 bottom-3 sm:right-4 sm:bottom-4',
        )}
      >
        <div className="flex items-start gap-2">
          {isTouchDevice && activeToolPanel === 'explore' && (
            <div
              className={cn(
                'rounded-xl border border-gray-200 bg-white p-3 shadow-lg',
                'w-[260px] max-w-[72vw]',
              )}
            >
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

            <>
              <button
                type="button"
                title="Zoom in"
                onClick={() => adjustMapZoom(1)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center bg-white text-gray-700 hover:bg-gray-50',
                  isTouchDevice ? 'border-b border-gray-200' : 'rounded-lg border',
                )}
                aria-label="Zoom in"
              >
                <span className="text-2xl leading-none">+</span>
              </button>
              <button
                type="button"
                title="Zoom out"
                onClick={() => adjustMapZoom(-1)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center bg-white text-gray-700 hover:bg-gray-50',
                  isTouchDevice ? 'border-b border-gray-200' : 'rounded-lg border',
                )}
                aria-label="Zoom out"
              >
                <span className="text-3xl leading-none">-</span>
              </button>
            </>

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
                {isTouchDevice ? (
                  <button
                    type="button"
                    title="Explore Search"
                    onClick={() => {
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
                    }}
                    className={cn(
                      'flex items-center justify-center',
                      'h-10 w-10 border-b border-gray-200',
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
                ) : null}
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
          // Only emit map-move refreshes after a real user map interaction
          // (drag/zoom). Prevents initial/programmatic idles from overriding
          // a freshly typed location search with stale previous-area results.
          if (!userMovedMapRef.current) return;
          if (mapInstance && onMapMove) {
            const center = mapInstance.getCenter();
            const bounds = mapInstance.getBounds();
            if (center && bounds) {
              userMovedMapRef.current = false;
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
          // Use the app's custom zoom controls for consistent placement/styling
          // across desktop + mobile overlays.
          zoomControl: false,
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
                cancelHoverClear();
                setHoveredMarker(marker);
              }}
              onMouseOut={() => {
                if (isTouchDevice) return;
                scheduleHoverClear(marker.markerKey);
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

        {/* hover card is now rendered as a custom positioned div outside GoogleMap */}

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
                      <span className="text-amber-500">?</span>{' '}
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
                      <span className="text-amber-500">?</span>{' '}
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

      {/* Smart-positioned hover card — rendered outside GoogleMap so it can't be clipped */}
      {hoverPreview && hoverCardStyle ? (
        <div
          className="pointer-events-auto absolute z-[60]"
          style={{ top: hoverCardStyle.top, left: hoverCardStyle.left }}
          onMouseEnter={cancelHoverClear}
          onMouseLeave={() => {
            setHoveredMarker(null);
            setHoverCardPixel(null);
          }}
        >
          <div
            className="w-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
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
        </div>
      ) : null}

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


