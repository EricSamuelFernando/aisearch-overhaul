'use client';
import { AUTH_TOKEN, REFRESH_TOKEN, USER_ROLE, isProd } from '@/shared/constants/env';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import DOMPurify from 'dompurify';

interface StorageProps {
  key: string;
  value?: string | unknown;
}

// Assuming deployment environment
const domain = isProd ? 'snaphomz.com' : 'localhost';

export const storeCookie = ({ key, value }: StorageProps): void => {
  const date = new Date();
  const expireTime = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
  const maxAge = 7 * 24 * 60 * 60;

  if (key !== '' && value !== '') {
    setCookie(key, DOMPurify.sanitize(JSON.stringify(value)), {
      expires: expireTime,
      maxAge,
      domain,
      path: '/',
      sameSite: 'strict',
    });
  }
};

export const getAuthToken = (): string | undefined => {
  const authToken = getCookie(AUTH_TOKEN, {
    domain,
    path: '/',
    sameSite: 'strict',
  });
  return typeof authToken === 'string'
    ? JSON.parse(DOMPurify.sanitize(authToken))
    : undefined;
};

export const getActiveUserRole = (): string | undefined => {
  const activeUserRole = getCookie(USER_ROLE, {
    domain,
    path: '/',
    sameSite: 'strict',
  });

  return typeof activeUserRole === 'string' && activeUserRole !== ''
    ? JSON.parse(DOMPurify.sanitize(activeUserRole))
    : 'agent';
};

export const getStoredCookie = (key: string): string | undefined => {
  const cookie = getCookie(key, {
    domain,
    path: '/',
    sameSite: 'strict',
  });

  return typeof cookie === 'string'
    ? JSON.parse(DOMPurify.sanitize(cookie))
    : undefined;
};

export const deleteStorageCookie = ({ key }: StorageProps): void => {
  deleteCookie(key, {
    domain,
    path: '/',
    sameSite: 'strict',
  });
};

export const setLocalItem = ({ key, value }: StorageProps) => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem(
      key,
      DOMPurify.sanitize(JSON.stringify(value)),
    );
  }
};

export const getLocalItem = <T>({ key }: StorageProps): T | null => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const item = window.sessionStorage.getItem(key);
    if (item !== null) {
      try {
        return JSON.parse(DOMPurify.sanitize(item));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Error parsing local storage item: `, err);
      }
    }
  }
  return null;
};

export const removeLocalItem = ({ key }: StorageProps): void => {
  sessionStorage.removeItem(key);
};
export const clearItem = (): void => {
  sessionStorage.clear();
};

/**
 * Nuclear cleanup: remove EVERY piece of auth-related data from
 * cookies, localStorage, and sessionStorage.
 *
 * Call this on logout and on session-expired to guarantee
 * the browser has zero leftover auth state.
 */
export const clearAllAuthStorage = (): void => {
  if (typeof window === 'undefined') return;

  // ── 1. Cookies ────────────────────────────────────────────────────
  deleteStorageCookie({ key: AUTH_TOKEN });
  deleteStorageCookie({ key: USER_ROLE });
  deleteStorageCookie({ key: REFRESH_TOKEN });

  // ── 2. SessionStorage ─────────────────────────────────────────────
  try { sessionStorage.clear(); } catch (_) { /* SSR guard */ }

  // ── 3. Known auth-related localStorage keys ───────────────────────
  const keysToRemove = [
    'userEmail',
    'userAccessToken',
    'userRefreshToken',
    'userDetails',
    'forgotPasswordEmail',
    'token',
    'role',
  ];
  keysToRemove.forEach((k) => {
    try { localStorage.removeItem(k); } catch (_) { /* ignore */ }
  });

  // ── 4. Redux-Persist stored state ─────────────────────────────────
  // persist key is 'root' → stored as 'persist:root' in localStorage
  try { localStorage.removeItem('persist:root'); } catch (_) { /* ignore */ }

  // ── 5. Cognito SDK localStorage items ─────────────────────────────
  // The Cognito JS SDK stores tokens under keys that start with
  // "CognitoIdentityServiceProvider." – remove them all.
  try {
    const cognitoKeys = Object.keys(localStorage).filter(
      (k) =>
        k.startsWith('CognitoIdentityServiceProvider') ||
        k.startsWith('aws.cognito') ||
        k.startsWith('amplify-'),
    );
    cognitoKeys.forEach((k) => localStorage.removeItem(k));
  } catch (_) { /* ignore */ }
};