'use client';

import { useEffect, useRef } from 'react';
import { getAuthToken } from '@/lib/storage';
import { getIsAuthExpired, performTokenRefresh } from '@/lib/api/axios';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Decodes a JWT and returns its payload.
 * Returns null if the token is malformed.
 */
function decodeJwt(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '='
    );
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * TokenRefreshProvider
 *
 * Runs a background timer that silently refreshes the access token
 * BEFORE it expires so the user never gets logged out automatically.
 *
 * Refresh is scheduled 5 minutes before expiry. If the token has no
 * expiry or is already very close to expiring, it refreshes immediately.
 *
 * This component renders nothing.
 */
export default function TokenRefreshProvider() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      // Not logged in — nothing to refresh
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const scheduleRefresh = () => {
      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);

      if (getIsAuthExpired()) return;

      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) return;

      const payload = decodeJwt(token as string);
      if (!payload?.exp) {
        // Token has no expiry — nothing to schedule
        return;
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const expiresInSec = payload.exp - nowSec;

      // Refresh 5 minutes before expiry (or immediately if < 5 min left)
      const BUFFER_SEC = 5 * 60;
      const delaySec = Math.max(expiresInSec - BUFFER_SEC, 0);
      const delayMs = delaySec * 1000;

      // Cap at ~23 hours to avoid setTimeout overflow for very long tokens
      const maxDelayMs = 23 * 60 * 60 * 1000;
      const safeDelayMs = Math.min(delayMs, maxDelayMs);

      timerRef.current = setTimeout(async () => {
        if (getIsAuthExpired()) return;

        try {
          await performTokenRefresh();
          // After successful refresh, schedule the next one
          scheduleRefresh();
        } catch (err) {
          console.warn('Proactive token refresh failed, will retry in 1 min:', err);
          // Retry in 1 minute instead of giving up immediately
          timerRef.current = setTimeout(() => scheduleRefresh(), 60_000);
        }
      }, safeDelayMs);
    };

    scheduleRefresh();

    // Also re-schedule when the tab becomes visible again (user returns after idle)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !getIsAuthExpired()) {
        scheduleRefresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn]);

  return null;
}
