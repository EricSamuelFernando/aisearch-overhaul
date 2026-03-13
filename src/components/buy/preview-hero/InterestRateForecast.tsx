'use client';

import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

type HorizonKey = '6m' | '12m' | '24m';

type RawSeries = {
  historical?: {
    dates?: string[];
    rates?: number[];
  };
  forecast?: {
    dates?: string[];
    rates?: number[];
    central?: number[];
  };
};

type ApiResponse = {
  ensemble_6m?: RawSeries;
  ensemble_12m?: RawSeries;
  ensemble_24m?: RawSeries;
  timestamp?: string;
};

type ChartPoint = {
  date: string;
  historical?: number | null;
  forecast?: number | null;
};

const ENDPOINT = '/api/forecast/model-cache';

const HORIZONS: { key: HorizonKey; label: string }[] = [
  { key: '6m', label: '6 months' },
  { key: '12m', label: '12 months' },
  { key: '24m', label: '24 months' },
];

const formatMonth = (value: string) => {
  if (!value) return '';
  // Expecting YYYY-MM-DD
  const year = value.slice(2, 4);
  const month = value.slice(5, 7);
  const map: Record<string, string> = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  };
  const mon = map[month] ?? value;
  return `${mon}'${year}`;
};

const buildSeries = (raw?: RawSeries): ChartPoint[] => {
  const map = new Map<string, ChartPoint>();
  const historicalDates = raw?.historical?.dates ?? [];
  const historicalRates = raw?.historical?.rates ?? [];
  const forecastDates = raw?.forecast?.dates ?? [];
  const forecastRates = raw?.forecast?.rates ?? raw?.forecast?.central ?? [];

  historicalDates.forEach((date, idx) => {
    map.set(date, {
      date,
      historical: historicalRates[idx] ?? null,
      forecast: null,
    });
  });

  forecastDates.forEach((date, idx) => {
    const existing = map.get(date);
    if (existing) {
      existing.forecast = forecastRates[idx] ?? null;
    } else {
      map.set(date, {
        date,
        historical: null,
        forecast: forecastRates[idx] ?? null,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
};

const InterestRateForecast: React.FC = () => {
  const [active, setActive] = React.useState<HorizonKey>('6m');
  const [data, setData] = React.useState<Record<HorizonKey, ChartPoint[]>>({
    '6m': [],
    '12m': [],
    '24m': [],
  });
  const [timestamp, setTimestamp] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(ENDPOINT, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch forecast (${response.status})`);
        }
        const json: ApiResponse = await response.json();
        const nextData = {
          '6m': buildSeries(json.ensemble_6m),
          '12m': buildSeries(json.ensemble_12m),
          '24m': buildSeries(json.ensemble_24m),
        };
        setData(nextData);
        setTimestamp(json.timestamp ?? null);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError(
            'Unable to load forecast data. Please try again in a moment.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const series = data[active] ?? [];

  return (
    <div className="w-full rounded-2xl bg-white border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {timestamp && (
            <p className="text-xs sm:text-sm text-gray-500">
              Updated {timestamp.replace('T', ' ').slice(0, 16)}
            </p>
          )}
        </div>
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          {HORIZONS.map((item) => (
            <button
              key={item.key}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${
                active === item.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64 sm:h-72">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
            Loading forecast...
          </div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-red-600 text-center">
            {error}
          </div>
        ) : series.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
            No forecast data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={formatMonth}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                minTickGap={18}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
              />
              <Tooltip
                formatter={(value: any) =>
                  typeof value === 'number' ? `${value.toFixed(2)}%` : value
                }
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend verticalAlign="top" height={28} />
              <Line
                type="monotone"
                dataKey="historical"
                name="Historical"
                stroke="#111827"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#E8804C"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 4"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default InterestRateForecast;
