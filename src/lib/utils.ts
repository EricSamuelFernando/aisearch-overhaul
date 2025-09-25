import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FormattedDate } from '../interfaces/date.interface';
import { publicDomain } from '@/shared/constants/env';
import { CalendarDay, CalendarTime } from '@/types/global.types';
import { CalendarItem } from '@/types/global.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isObjectEmpty(obj: object | any) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) {
    return '';
  }

  const firstInitial: string = firstName
    ? firstName.charAt(0).toUpperCase()
    : '';
  const lastInitial: string = lastName ? lastName.charAt(0).toUpperCase() : '';

  return `${firstInitial}${lastInitial}`;
}

export function capitalizeEachWord(str: string): string {
  return str.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

export function truncateText(string: string, maxLength: number): string {
  if (!string) return '';

  if (!maxLength || maxLength === 0) return string;
  if (string.length <= maxLength) return string;
  return string.substring(0, maxLength) + '...';
}

export function validateEmail(email: string): boolean {
  const emailRegex: RegExp =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  return emailRegex.test(email);
}

export function getNextYearCalendar(): CalendarItem[] {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-indexed month number (Jan = 0)
  const currentYear = today.getFullYear();

  const calendar: { month: string; days: CalendarDay[] }[] = [];

  for (let month = currentMonth; month < currentMonth + 12; month++) {
    const year = month === 11 ? currentYear + 1 : currentYear; // Handle year overflow for December
    const numDays = new Date(year, month + 1, 0).getDate(); // Get number of days in the month
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

    const monthData: CalendarDay[] = [];

    // Add leading empty days (if any)
    for (let i = 0; i < firstDay; i++) {
      monthData.push({ day: '', date: 0, passed: false, dayLong: '', year: 0 });
    }

    // Add days for the month
    for (let date = 1; date <= numDays; date++) {
      const passed = month === currentMonth && date < today.getDate(); // Check for passed days in current month
      monthData.push({
        day: new Date(year, month, date).toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        dayLong: new Date(year, month, date).toLocaleDateString('en-US', {
          weekday: 'long',
        }),
        date,
        passed,
        year,
      });
    }

    // Add trailing empty days (if any)
    const remainingDays = (7 - ((firstDay + numDays) % 7)) % 7; // Calculate remaining days to fill the week
    for (let i = 0; i < remainingDays; i++) {
      monthData.push({ day: '', date: 0, passed: false, dayLong: '', year: 0 });
    }

    calendar.push({
      month: new Date(year, month, 1).toLocaleDateString('en-US', {
        month: 'long',
      }),
      days: monthData,
    });
  }

  return calendar;
}

export const getNextHours = (nxtHour: number): CalendarTime[] => {
  const currentTime = new Date();
  let nextHour = currentTime.getHours() + 1; // Get the next hour
  let isAM = currentTime.getHours() < 12; // Determine if current time is AM

  const hours = [];

  for (let i = 0; i < nxtHour; i++) {
    const hour = nextHour % 12 || 12; // Convert to 12-hour format
    const ampm = isAM ? 'am' : 'pm'; // Determine AM or PM
    const formattedHour = `${hour < 10 ? '0' : ''}${hour}:00 ${ampm}`; // Format hour as "09:00 am"
    const timeObject = {
      formattedTime: formattedHour,
      hour: nextHour,
      ampm: ampm,
    };
    hours.push(timeObject);

    nextHour++;
    if (nextHour === 12) {
      isAM = !isAM; // Toggle AM/PM if the hour crosses 12
    }
  }

  return hours;
};

export function formatTimeString(timeString: string): string {
  // Parse the date string using appropriate format
  const date = new Date(timeString);

  // Ensure valid date object
  if (isNaN(date.getTime())) {
    throw new Error('Invalid time string format');
  }

  // Pad single-digit values with leading zero
  const pad = (num: number): string => String(num).padStart(2, '0');
  // Format year, month, day, hours, minutes, seconds, and milliseconds
  const year: string = pad(date.getFullYear());
  const month: string = pad(date.getMonth() + 1); // Months are zero-indexed
  const day: string = pad(date.getDate());
  const hours: string = pad(date.getHours());
  const minutes: string = pad(date.getMinutes());
  const seconds: string = pad(date.getSeconds());
  const milliseconds: string = pad(date.getMilliseconds());

  // Format time zone offset in ISO 8601 format (Z or +/-HH:mm)
  const offset: number = date.getTimezoneOffset();
  const timezoneSign: string = offset < 0 ? '+' : '-';
  const timezoneHours: string = pad(Math.floor(Math.abs(offset) / 60));
  const timezoneMinutes: string = pad(Math.abs(offset) % 60);

  // Combine formatted parts
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}

// export function formatCurrency(amount: number, currency: string): string {
//   try {
//     // Check if Intl is available
//     if (typeof Intl === 'undefined') {
//       throw new Error('Intl API is not available');
//     }

//     // Create formatter based on currency
//     const formatter = new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency,
//     });

//     // Format the amount
//     return formatter.format(amount);
//   } catch (error) {
//     console.error('Error formatting currency:', error);
//     // Return a fallback value or handle the error as needed
//     return `${amount} ${currency}`;
//   }
// }

export function formatCurrency(amount: number, currency?: string): string {
  try {
    // Use "USD" as the default currency if undefined
    const currencyCode = currency || 'USD';

    // Create a formatter with 0 fraction digits to remove cents
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // Format the amount and ensure the currency symbol is at the start
    const formatted = formatter.format(amount);

    // Check if the currency symbol is not at the start, and move it if necessary
    if (currencyCode === 'USD' && !formatted.startsWith('$')) {
      return `$${formatted.replace('$', '').trim()}`;
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Return fallback format if error occurs
    return `$${amount.toLocaleString()}`;
  }
}

export const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value}`;
};

export function formatNumberWithCommas(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(dateString: string): FormattedDate {
  const months: string[] = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString();
  let hour = date.getHours();
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert to 12-hour format
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');

  return {
    day,
    month,
    year,
    hour: hour.toString().padStart(2, '0'),
    minute,
    second,
    period,
  };
}

export function formatTime24to12(timeString: string) {
  // Create a date object with the provided time string
  const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  
  // Format the date object to a time string in 12-hour format with AM/PM
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return formattedTime;
}

const baseUrl: string =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/'
    : publicDomain!;

export async function dynamicBlurDataUrl(url: string): Promise<string> {
  const base64str: string = await fetch(
    `${baseUrl}/_next/image?url=${url}&w=16&q=75`,
  ).then(async (res: Response) =>
    Buffer.from(await res.arrayBuffer()).toString('base64'),
  );

  const blurSvg: string = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'>
      <filter id='b' color-interpolation-filters='sRGB'>
        <feGaussianBlur stdDeviation='1' />
      </filter>

      <image preserveAspectRatio='none' filter='url(#b)' x='0' y='0' height='100%' width='100%' 
      href='data:image/avif;base64,${base64str}' />
    </svg>
  `;

  const toBase64 = (str: string): string =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
}

export function getDayInfo(dateString: string): {
  day: string;
  isToday: boolean;
  formattedTime: string;
} {
  const givenDate = new Date(dateString);
  const today = new Date();

  // Check if the given date is today
  const isToday =
    givenDate.getDate() === today.getDate() &&
    givenDate.getMonth() === today.getMonth() &&
    givenDate.getFullYear() === today.getFullYear();

  // Get the day
  const day = givenDate.toLocaleString('default', { weekday: 'long' });

  // Format the time in AM/PM
  let hours = givenDate.getHours();
  const minutes = givenDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
  const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

  return {
    day,
    isToday,
    formattedTime,
  };
}

type AnyObject = { [key: string]: any };

export function removeFalsyValues(obj: AnyObject): AnyObject {
  const result: AnyObject = {};

  Object.keys(obj).forEach((key) => {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== 0 &&
      obj[key] !== '' &&
      !Number.isNaN(obj[key])
    ) {
      result[key] = obj[key];
    }
  });

  return result;
}

export const maskEmail = (email: string): string => {
  if (typeof email !== 'string' || email?.length === 0) return '';

  const [local, domain] = email.split('@');

  let emailId = '';
  let emailDomain = '';
  let emailTDD = '';
  let result = '';

  try {
    if (local.length > 0) {
      emailId = local;
    }
    if (domain.length > 0) {
      const [name, tdd] = domain.split('.');
      emailDomain = name;
      emailTDD = tdd;
    }

    if (local.length < 4) {
      result = `${local.charAt(0)}${'*'.repeat(6)}@${'*'.repeat(
        5,
      )}.${emailTDD}`;
      return result;
    }

    const maskedLocal = local.slice(0, 2) + '*'.repeat(6) + local.slice(-2);
    const maskedDomain = `${'*'.repeat(5)}.${emailTDD}`;

    result = `${maskedLocal}@${maskedDomain}`;
  } catch (error) {
    throw new Error(`Masked Email:${error}`);
  }

  return result;
};

export type UserPropertyPreference = {
  propertyType: string;
  preferredPropertyAddress: string;
  spendAmount: {
    max: number;
    min: number;
  };
};



export const downloadDocumentPreSigned = async (url: string, filename:string ) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl); // cleanup
};
