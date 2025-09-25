'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface PropertyDetailsCardProps {
  data: { [key: string]: any };
}

const labelFormatter = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ');
};

const renderValue = (value: any): React.ReactNode => {
  if (value instanceof Error) return 'Error occurred';
  if (Array.isArray(value)) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'object') return renderNestedObject(value);
  return value;
};

const renderNestedObject = (value: any): React.ReactNode => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(value).map(([nestedKey, nestedValue]) => {
        if (Array.isArray(nestedValue)) return null;
        return (
          <div
            key={nestedKey}
            className="rounded-xl border-2 border-dotted border-orange-500 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-sm text-gray-500">{labelFormatter(nestedKey)}</div>
            <div className="mt-1 text-base font-medium text-gray-800">
              {renderValue(nestedValue)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PropertyDetailsCard: React.FC<PropertyDetailsCardProps> = ({ data }) => {
  const excludedKeys = ['latitude', 'longitude', 'address'];

  const nonNestedFields: [string, any][] = [];
  const nestedFields: [string, any][] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0
    ) {
      nestedFields.push([key, value]);
    } else if (!excludedKeys.includes(key) && !Array.isArray(value)) {
      nonNestedFields.push([key, value]);
    }
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Property Information</h2>

      {/* Non-nested fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {nonNestedFields.map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border-2 border-dotted border-orange-500 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-sm text-gray-500">{labelFormatter(key)}</div>
            <div className="mt-1 text-base font-medium text-gray-800">
              {renderValue(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Nested fields (collapsible) */}
      {nestedFields.map(([key, value]) => (
        <div key={key} className="rounded-md bg-gray-50 p-3 border border-gray-200">
          <button
            className="w-full text-left text-lg font-semibold focus:outline-none"
            onClick={() => toggleSection(key)}
          >
            {labelFormatter(key)}{' '}
            <span className="float-right text-sm text-gray-500">
              {openSections[key] ? '▲' : '▼'}
            </span>
          </button>
          {openSections[key] && (
            <div className="mt-3">{renderNestedObject(value)}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PropertyDetailsCard;
