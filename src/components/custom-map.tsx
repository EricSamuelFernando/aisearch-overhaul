'use client';

import {
  GoogleMap,
  InfoWindow,
  Marker,
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
};

const DEFAULT_COORD = { lat: 36.778, lng: -119.417 };
const libraries: Libraries = ['places', 'geometry'];

type DistrictFeature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, any>>;

type DistrictPolygonCacheEntry = {
  id: string;
  feature: DistrictFeature;
  polygons: google.maps.Polygon[];
  bounds: google.maps.LatLngBounds[];
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
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
  });

  const [mapInstance, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [clickedDistrictName, setClickedDistrictName] = useState<string | null>(null);
  const [districtFeatures, setDistrictFeatures] = useState<DistrictFeature[]>([]);
  const [matchedDistricts, setMatchedDistricts] = useState<DistrictFeature[]>([]);
  const [districtsLoadingError, setDistrictsLoadingError] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<{
    name: string;
    rating?: number;
    total?: number;
    position: google.maps.LatLngLiteral;
  } | null>(null);
  const featureLayersRef = React.useRef<{
    state?: google.maps.FeatureLayer;
    county?: google.maps.FeatureLayer;
    city?: google.maps.FeatureLayer;
  }>({});
  const schoolMarkersRef = React.useRef<google.maps.Marker[]>([]);
  const overlayControlRef = React.useRef<HTMLDivElement | null>(null);

  const districtPolygonCacheRef = React.useRef<Map<string, DistrictPolygonCacheEntry>>(new Map());

    const containerStyle = {
    height: height || '100%',
    width: '100%',
    minHeight: '350px',
    // removed minWidth to avoid forcing horizontal overflow / layout jumps
  };


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


  const extractPlaceQuery = useCallback((rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return '';

    // Try to capture the trailing location phrase after common prepositions.
    const match = trimmed.match(/\b(?:in|near|around|at)\s+(.+)$/i);
    if (match && match[1]) return match[1].trim();

    return trimmed;
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const trimmedQuery = extractPlaceQuery(searchQuery || '');
    if (!trimmedQuery) return;

    const service = new google.maps.places.PlacesService(mapInstance);

    service.findPlaceFromQuery(
      {
        query: trimmedQuery,
        fields: ['place_id', 'name', 'types'],
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
          setSelectedPlaceId(results[0]?.place_id ?? null);
          return;
        }

        // Fallback to geocoder if Places doesn't return a place id
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: trimmedQuery }, (geoResults, geoStatus) => {
          if (geoStatus !== 'OK' || !geoResults || geoResults.length === 0) {
            console.warn('[place-boundary] place search + geocode failed:', status, geoStatus);
            return;
          }

          setSelectedPlaceId(geoResults[0]?.place_id ?? null);
        });
      },
    );
  }, [isLoaded, mapInstance, searchQuery, extractPlaceQuery]);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const stateLayer = mapInstance.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_1');
    const countyLayer = mapInstance.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_2');
    const cityLayer = mapInstance.getFeatureLayer('LOCALITY');

    featureLayersRef.current = {
      state: stateLayer,
      county: countyLayer,
      city: cityLayer,
    };

  }, [isLoaded, mapInstance]);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const { state, county, city } = featureLayersRef.current;
    const styleFn = (options: google.maps.FeatureStyleFunctionOptions) => {
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
    if (!isLoaded || !mapInstance || !onOverlayChange) return;

    if (!overlayControlRef.current) {
      const control = document.createElement('div');
      control.className = 'gm-control-active map-control-overlay';
      control.style.pointerEvents = 'auto';
      control.style.cursor = 'default';

      const label = document.createElement('div');
      label.className = 'map-control-label';
      label.textContent = 'Explore';

      const select = document.createElement('select');
      select.className = 'map-control-select';
      select.style.pointerEvents = 'auto';
      const noneOption = document.createElement('option');
      noneOption.value = 'none';
      noneOption.textContent = 'None';
      const schoolsOption = document.createElement('option');
      schoolsOption.value = 'schools';
      schoolsOption.textContent = 'Schools';
      select.appendChild(noneOption);
      select.appendChild(schoolsOption);
      select.value = overlayValue;

      select.addEventListener('change', (event) => {
        const value = (event.target as HTMLSelectElement).value as 'none' | 'schools';
        onOverlayChange(value);
      });

      const stopEvent = (event: Event) => {
        event.stopPropagation();
      };

      ['mousedown', 'pointerdown', 'click', 'touchstart'].forEach((evt) => {
        control.addEventListener(evt, stopEvent);
        select.addEventListener(evt, stopEvent);
      });

      control.appendChild(label);
      control.appendChild(select);

      overlayControlRef.current = control;
      mapInstance.controls[google.maps.ControlPosition.TOP_LEFT].push(control);
    }

    if (overlayControlRef.current) {
      const select = overlayControlRef.current.querySelector('select');
      if (select) {
        (select as HTMLSelectElement).value = overlayValue;
      }
    }

    return () => {
      if (overlayControlRef.current) {
        const index = mapInstance.controls[google.maps.ControlPosition.TOP_LEFT]
          .getArray()
          .indexOf(overlayControlRef.current);
        if (index > -1) {
          mapInstance.controls[google.maps.ControlPosition.TOP_LEFT].removeAt(index);
        }
        overlayControlRef.current = null;
      }
    };
  }, [isLoaded, mapInstance, onOverlayChange, overlayValue]);



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
          setSelectedSchool({
            name: place.name ?? 'School',
            rating: place.rating ?? undefined,
            total: place.user_ratings_total ?? undefined,
            position,
          });
        });

        return marker;
      });

      schoolMarkersRef.current = markers;
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, mapInstance, matchedDistricts, showDistricts, getDistrictId]);

  useEffect(() => {
    if (!showDistricts) {
      setClickedDistrictName(null);
    }
  }, [showDistricts]);

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
  const handleMapClick = useCallback(() => {
    if (recentDataClickRef.current) return;
    setClickedDistrictName(null);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstance) return;
    const listener = mapInstance.addListener('click', () => {
      if (recentDataClickRef.current) return;
      setClickedDistrictName(null);
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
  }, [mapInstance, markers, zoom]);



  return isLoaded ? (
    <div className="relative w-full" style={{ height: containerStyle.height, minHeight: containerStyle.minHeight }}>
    {showDistricts && clickedDistrictName && (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="rounded-full border border-gray-100 bg-white/95 px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur-sm whitespace-nowrap">
          {clickedDistrictName}
        </div>
      </div>
    )}
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
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          icon={createCustomMarker(marker.price, marker.id === selectedMarker?.id)}
          onClick={() => {
            setSelectedMarker(marker);
            centerOnMarker({ lat: marker.lat, lng: marker.lng });
            if (marker.id && onMarkerClick) onMarkerClick(marker.id);
          }}
        />
      ))}

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
            pixelOffset: new google.maps.Size(0, -34),
            maxWidth: 220,
          }}
        >
          <div className="rounded-lg bg-white/95 px-3 py-2 shadow-lg">
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
