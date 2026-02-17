import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        google: any;
    }
}

type MapMarker = {
    lat: number;
    lon: number;
    label?: string;
    role?: "home" | "school";
    name?: string;
};

type InteractiveSchoolMapPanelProps = {
    title?: string;
    radiusMiles?: number;
    markers?: MapMarker[];
    fallbackImageUrl?: string;
    listCount?: number;
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const loadGoogleMaps = () => {
    if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error("Missing key"));
    if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
    if (window.google?.maps) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            "script[data-google-maps]"
        );
        if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Load error")), {
                once: true,
            });
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly`;
        script.async = true;
        script.defer = true;
        script.dataset.googleMaps = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Load error"));
        document.head.appendChild(script);
    });
};

const InteractiveSchoolMapPanel = ({
    title,
    radiusMiles,
    markers,
    fallbackImageUrl,
    listCount,
}: InteractiveSchoolMapPanelProps) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        loadGoogleMaps()
            .then(() => setIsReady(true))
            .catch(() => setLoadError(true));
    }, []);

    useEffect(() => {
        if (!isReady || !mapRef.current || !markers || markers.length === 0) return;
        const google = window.google;
        if (!google?.maps) return;

        const map = new google.maps.Map(mapRef.current, {
            center: { lat: markers[0].lat, lng: markers[0].lon },
            zoom: 13,
            mapTypeId: "roadmap",
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
            clickableIcons: false,
            styles: [
                { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "simplified" }] },
                { featureType: "poi", stylers: [{ visibility: "off" }] },
                { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                { featureType: "transit", stylers: [{ visibility: "off" }] },
            ],
        });

        const bounds = new google.maps.LatLngBounds();
        const info = new google.maps.InfoWindow();

        const svgIcon = (type: "home" | "school", labelText?: string) => {
            const fill = type === "home" ? "#F57C2B" : "#2F6DF6";
            const labelLength = labelText ? labelText.length : 0;
            const fontSize = labelLength >= 2 ? 12 : 14;
            const glyph =
                type === "home"
                    ? `<path d="M18 10.2l7 5.7v9.9a1.2 1.2 0 0 1-1.2 1.2H12.2a1.2 1.2 0 0 1-1.2-1.2v-9.9l7-5.7z" fill="#ffffff"/>`
                    : "";
            const numberText =
                type === "school" && labelText
                    ? `<text x="18" y="19" text-anchor="middle" font-family="'SF Pro Text', -apple-system, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${labelText}</text>`
                    : "";
            const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.2" flood-color="#000" flood-opacity="0.18"/>
            </filter>
          </defs>
          <path d="M18 2c8.3 0 15 6.7 15 15 0 10.1-11.2 21.4-14 24.4a1.5 1.5 0 0 1-2.1 0C14.2 38.4 3 27.1 3 17 3 8.7 9.7 2 18 2z" fill="${fill}" filter="url(#shadow)"/>
          <circle cx="18" cy="17" r="10.2" fill="rgba(255,255,255,0.15)"/>
          ${glyph}
          ${numberText}
        </svg>`;
            return {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
                scaledSize: new google.maps.Size(34, 46),
                anchor: new google.maps.Point(17, 44),
            };
        };

        let schoolIndex = 1;
        markers.forEach((marker) => {
            const role = marker.role ?? "school";
            const label =
                marker.label ??
                (role === "home" ? "H" : String(Math.min(schoolIndex, 9)));
            if (role === "school") schoolIndex += 1;

            const gMarker = new google.maps.Marker({
                position: { lat: marker.lat, lng: marker.lon },
                map,
                icon: svgIcon(role, label),
            });

            bounds.extend(gMarker.getPosition()!);

            if (marker.name) {
                gMarker.addListener("click", () => {
                    info.setContent(
                        `<div style="font-family: 'SF Pro Text', -apple-system, sans-serif; font-size:12px; padding:2px 0;">
               <strong>${marker.name}</strong>
             </div>`
                    );
                    info.open({ anchor: gMarker, map });
                });
            }
        });

        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, 80);
        }
    }, [isReady, markers]);

    const markerCount = markers?.length ? Math.max(markers.length - 1, 0) : 0;
    const listCountSafe = listCount ?? markerCount;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 via-white to-sky-50 px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-gray-800">
                        {title ?? "Nearby schools map"}
                    </p>
                    <p className="text-xs text-gray-500">
                        Showing {listCountSafe} schools
                        {radiusMiles ? ` within ${radiusMiles.toFixed(1)} miles` : ""}.
                    </p>
                    <p className="text-xs text-gray-400">Pins 1-10 match the list order.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
                        Home
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                        School
                    </span>
                </div>
            </div>

            <div className="relative h-72 w-full">
                {!loadError && GOOGLE_MAPS_API_KEY ? (
                    <div ref={mapRef} className="h-full w-full" />
                ) : fallbackImageUrl ? (
                    <img
                        src={fallbackImageUrl}
                        alt="School map"
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                        Map unavailable
                    </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent" />
            </div>
        </div>
    );
};

export default InteractiveSchoolMapPanel;

