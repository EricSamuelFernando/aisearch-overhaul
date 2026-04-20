'use client';
import { useState, useEffect } from 'react';

export interface GeoLocation {
  city: string;
  state: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "US"
}

const SESSION_KEY = 'snaphomz:geolocation:v1';
const GEO_TIMEOUT_MS = 5000;

async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'Snaphomz/1.0 (real-estate-platform)',
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address || {};
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
    const state = addr.state || '';
    const country = addr.country || '';
    const countryCode = (addr.country_code || '').toUpperCase(); // Nominatim returns lowercase
    if (!city && !state) return null;
    return { city, state, country, countryCode };
  } catch {
    return null;
  }
}

/**
 * Detects the user's location via browser Geolocation API + Nominatim reverse geocoding.
 * - Fires on mount, result cached in sessionStorage for the tab lifetime
 * - Returns null location if permission denied or timeout
 * - Non-blocking: loading becomes false as soon as result is known
 */
export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Serve from sessionStorage if available (avoids repeated permission prompts)
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        const parsed: GeoLocation = JSON.parse(cached);
        if (parsed?.countryCode) {
          setLocation(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // corrupted cache — ignore, re-fetch
    }

    if (!navigator?.geolocation) {
      setLoading(false);
      return;
    }

    let settled = false;
    const safetyTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, GEO_TIMEOUT_MS + 1000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(safetyTimer);

        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (geo) {
          try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(geo));
          } catch {
            // storage quota — ignore
          }
          setLocation(geo);
        }
        setLoading(false);
      },
      () => {
        // Permission denied or error
        if (settled) return;
        settled = true;
        clearTimeout(safetyTimer);
        setLoading(false);
      },
      {
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 60 * 60 * 1000, // reuse cached position up to 1 hour
        enableHighAccuracy: false,   // city-level accuracy is sufficient
      }
    );

    return () => clearTimeout(safetyTimer);
  }, []);

  return { location, loading };
}
