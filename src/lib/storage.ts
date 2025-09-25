'use client';
import { AUTH_TOKEN, USER_ROLE, isProd } from '@/shared/constants/env';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import DOMPurify from 'dompurify';

interface StorageProps {
  key: string;
  value?: string | unknown;
}

// Assuming deployment environment
const domain = isProd? 'snaphomz.com' :'localhost';

export const storeCookie = ({ key, value }: StorageProps): void => {
  const date = new Date();
  const expireTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const maxAge = 7 * 60 * 60;

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
