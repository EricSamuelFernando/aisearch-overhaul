'use client';

import * as crypto from 'crypto';
import { PropertyQuery } from '@/hooks/api/useFectchSellerProperty';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';

export const extractKeyFromUrl = (url: string): string | null => {
  try {
    const regex =
      /(?:https:\/\/[^\/]+\/)([^\/]+\/[^\/]+\/[^\/]+\.(pdf|txt|docx))/;
    const match = url.match(regex);

    if (match) {
      console.log('Extracted Key:', match[1]);
      return match[1];
    } else {
      console.error('Failed to match URL pattern. Check the URL format.');
      return null;
    }
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
};

// Create a random SHA-256 key
export function generateSHAString(key: string): string {
  const randomString = crypto.randomBytes(6).toString('hex');
  const combinedKey = key + randomString;
  const hash = crypto.createHash('sha256');
  hash.update(combinedKey);
  return hash.digest('hex');
}

export const getCountryCode = (val: string) => `+${val.slice(0, 3)}`;
export const getRawPhoneNumber = (val: string) => `+${val}`;
export const getPhoneNumber = (val: string) => `${val.slice(3, val.length)}`;

export const getInitials = (
  firstName: string | undefined,
  lastName: string | undefined,
): string => {
  const firstInitial = firstName ? firstName[0] : '';
  const lastInitial = lastName ? lastName[0] : '';
  const abbreviation = `${firstInitial}${lastInitial}`.toUpperCase();

  return abbreviation;
};

export function removeNonNumericCharacters(input: string): string {
  return input.replace(/[^0-9]/g, '');
}

export const breakTextIntoLines = (
  text: string,
  maxCharactersPerLine: number,
): string => {
  const words = text.split(' ');
  let currentLineLength = 0;
  let result = '';

  for (const word of words) {
    if (currentLineLength + word.length > maxCharactersPerLine) {
      result += '\n' + word + ' ';
      currentLineLength = word.length + 1; // Add 1 for the space
    } else {
      result += word + ' ';
      currentLineLength += word.length + 1; // Add 1 for the space
    }
  }

  return result.trim(); // Remove trailing whitespace
};

export const getQueryFromUrl = () => {
  const urlQuery = new URLSearchParams(window.location.search);
  const queryFromUrl: PropertyQuery = {};

  for (const [key, value] of urlQuery.entries()) {
    (queryFromUrl as any)[key] = value;
  }

  return queryFromUrl;
};

export const removeQueryFromUrl = () => {
  const baseUrl = window.location.origin + window.location.pathname;
  return baseUrl;
};

export const shortenAddress = (address: string): string => {
  const parts = address?.split(',');
  if (parts?.length > 3) {
    return `${parts.slice(0, 3).join(',')} ...`;
  }
  return address;
};

export const formatSellerDate = (date: Date): string => {
  return `Updated ${date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
};

export const sellerGetInitials = (name: string) => {
  const nameParts = name.trim().split(' ');
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : `${nameParts[0][0]}`;
  return initials.toUpperCase();
};

export function usePropertyHelpers() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id') || '';
  const property_info = useSelector(selectPropertyInformation);

  return { propertyId, property_info };
}

export const getNavItems = (
  propertyId: string,
): { name: string; icon: string; link: string; disabled?: boolean }[] => {
  return [
    {
      name: 'preview',
      icon: '/assets/icons/preview.svg',
      link: `/dashboard/seller/preview/listingpreview?id=${propertyId}`,
    },
    {
      name: 'edit facts',
      icon: '/assets/icons/edit.svg',
      link: `/dashboard/seller/listing/edit?id=${propertyId}`,
    },
    {
      name: 'analytics',
      icon: '/assets/icons/analytics.svg',
      link: '#',
      disabled: true,
    },
    {
      name: 'agreement',
      icon: '/assets/icons/agreement.svg',
      link: `/dashboard/seller/sell-agreement?id=${propertyId}`,
    },
    {
      name: 'add agent',
      icon: '/assets/icons/addAgent.svg',
      link: `/dashboard/seller/add-agent?id=${propertyId}`,
    },
    {
      name: 'document',
      icon: '/assets/icons/documents.png',
      link: `/dashboard/seller/sell-disclosure?id=${propertyId}`,
    },
  ];
};
