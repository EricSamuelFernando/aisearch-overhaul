export type ObjectString = { [key: string]: string };

export type FilterType<T> = {
  field: keyof T;
  value: string | number | object;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type CalendarDay = {
  day: string;
  date: number;
  passed: boolean;
  dayLong: string;
  year: number;
};

export type CalendarItem = {
  month: string;
  days: CalendarDay[];
};

export type CalendarTime = {
  formattedTime: string;
  hour: number;
  ampm: string;
};

export enum OfferStatusEnum {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  rejected = 'rejected',
}
