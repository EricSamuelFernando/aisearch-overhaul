'use client';

import {
  GoogleMap,
  InfoWindow,
  Marker,
  Libraries,
  useJsApiLoader,
} from '@react-google-maps/api';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { googleMapsApiKey } from '@/shared/constants/env';
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
  onMarkerClick?: (id: string) => void;
  onMapMove?: (
    center: google.maps.LatLngLiteral,
    bounds: google.maps.LatLngBounds
  ) => void;
};

const DEFAULT_COORD = { lat: 36.778, lng: -119.417 };
const libraries: Libraries = ['places'];

const CustomMap: React.FC<Props> = ({
  properties = [],
  coord = [],
  width,
  height,
  zoom = 10,
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
    <GoogleMap
      mapContainerStyle={containerStyle}
      mapContainerClassName="snaphomz-map"
      onLoad={onLoad}
      zoom={zoom}
      onUnmount={onUnmount}
      options={{
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: true,
        scrollwheel: true,
        gestureHandling: 'cooperative',
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
    </GoogleMap>
  ) : (
    <SkeletonLoader className="h-[350px] w-full bg-gray-400 md:col-span-9" />
  );
};

export default React.memo(CustomMap);
