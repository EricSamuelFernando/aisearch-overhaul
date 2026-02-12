'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

// Types
interface College {
  name: string;
  ipeds: string;
  rank: number;
}

interface Major {
  name: string;
  cip: string;
  rank: number;
}

interface DiversityEntry {
  label: string;
  value: number;
  color: string;
}

interface CollegeReadinessData {
  top_colleges: College[];
  top_majors: Major[];
  diversity_breakdown: DiversityEntry[] | { [key: string]: number };
}

// Utility function to generate donut chart segments
function getDonutSegments(data: DiversityEntry[]) {
  // Validate that data is an array
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  let acc = 0;
  return data.map(({ value, color }: DiversityEntry, i: number) => {
    const startAngle = (acc / 100) * 2 * Math.PI;
    acc += value;
    const endAngle = (acc / 100) * 2 * Math.PI;
    const x1 = 50 + 40 * Math.cos(startAngle - Math.PI / 2);
    const y1 = 50 + 40 * Math.sin(startAngle - Math.PI / 2);
    const x2 = 50 + 40 * Math.cos(endAngle - Math.PI / 2);
    const y2 = 50 + 40 * Math.sin(endAngle - Math.PI / 2);
    const largeArc = value > 50 ? 1 : 0;
    const pathData = `
      M ${x1} ${y1}
      A 40 40 0 ${largeArc} 1 ${x2} ${y2}
      L 50 50
      Z
    `;
    return (
      <path
        key={i}
        d={pathData}
        fill={color}
        stroke="#fff"
        strokeWidth="1"
      />
    );
  });
}

const TopCollegesSection = () => {
  const [data, setData] = useState<CollegeReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string>('');

  // Get zip code from localStorage or property data
  useEffect(() => {
    const storedZip = localStorage.getItem('propertyAddress2') || '99623';
    setZipCode(storedZip);
  }, []);

  // Fetch college readiness data
  useEffect(() => {
    if (!zipCode) return;

    const fetchCollegeReadiness = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:4000/schools/college-readiness-by-zip?zipCode=${zipCode}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch college readiness data: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ College Readiness API response:', result);
        setData(result);
      } catch (err) {
        console.error('❌ Error fetching college readiness data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load college readiness data');
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeReadiness();
  }, [zipCode]);

  if (loading) {
    return (
      <section className="p-6 w-full mt-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6 w-full mt-4">
        <div className="text-center py-12 text-red-600">
          <p>Error loading college readiness data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="p-6 w-full mt-4">
        <div className="text-center py-12 text-gray-500">
          <p>No college readiness data available</p>
        </div>
      </section>
    );
  }

  // Validate and get top 3 colleges and majors
  const topColleges = Array.isArray(data.top_colleges) ? data.top_colleges.slice(0, 3) : [];
  const topMajors = Array.isArray(data.top_majors) ? data.top_majors.slice(0, 3) : [];

  // Transform diversity_breakdown from object to array format
  let diversityData: DiversityEntry[] = [];

  if (data.diversity_breakdown && typeof data.diversity_breakdown === 'object') {
    // Define colors for each ethnicity
    const colorMap: { [key: string]: string } = {
      'Asian': '#FFA254',
      'Hispanic': '#FFA785',
      'African American': '#A39A28',
      'Black': '#A39A28',
      'White': '#F9F2D1',
      'Multiracial': '#FFB395',
      'Native American': '#6B3400',
      'Pacific Islander': '#B2B2B2',
      'International': '#E0643B',
      'Unknown': '#D3D3D3',
      'Other': '#C4C4C4'
    };

    // Convert object to array
    diversityData = Object.entries(data.diversity_breakdown).map(([label, value]) => ({
      label,
      value: typeof value === 'number' ? parseFloat((value * 100).toFixed(1)) : 0,
      color: colorMap[label] || '#CCCCCC' // Default gray if not in map
    }));
  }

  console.log('📊 College Readiness Data:', {
    topColleges,
    topMajors,
    diversityData,
    rawData: data
  });

  // If no data at all, show message
  if (topColleges.length === 0 && topMajors.length === 0 && diversityData.length === 0) {
    return (
      <section className="p-6 w-full mt-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
          College Readiness
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p>No college readiness data available for this location</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 w-full mt-4">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
        College Readiness
      </h2>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT SIDE: Top Colleges + Top Majors */}
        <div className="space-y-10">

          {/* Top 3 Colleges */}
          {topColleges.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 3 Colleges</h3>
              <div className="space-y-3">
                {topColleges.map((college) => (
                  <div
                    key={college.rank}
                    className="flex justify-between items-center bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{college.name}</div>
                      <div className="text-xs text-gray-500">Institution ID: {college.ipeds}</div>
                    </div>
                    <div className="text-3xl text-gray-400 font-bold">#{college.rank}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 3 Majors */}
          {topMajors.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 3 Majors</h3>
              <div className="space-y-3">
                {topMajors.map((major) => (
                  <div
                    key={major.rank}
                    className="flex justify-between items-center bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{major.name}</div>
                      <div className="text-xs text-gray-500">CIP: {major.cip}</div>
                    </div>
                    <div className="text-3xl text-gray-400 font-bold">#{major.rank}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show message if no colleges or majors */}
          {topColleges.length === 0 && topMajors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No college or major data available</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Diversity Chart */}
        <div className="flex flex-col">
          {diversityData.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Title with Icon */}
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Student Diversity</h3>
              </div>

              {/* Donut Chart */}
              <div className="flex justify-center mb-6">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {getDonutSegments(diversityData)}
                  </svg>
                  {/* Center white circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Legend - Multi-column grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
                {diversityData.map(({ label, value, color }: DiversityEntry) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-700">
                      {label} ({value}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* Diversity Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Diversity Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Groups:</span>
                    <span className="ml-2 text-sm font-semibold text-gray-900">
                      {diversityData.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Largest Group:</span>
                    <span className="ml-2 text-sm font-semibold text-gray-900">
                      {(() => {
                        const largest = diversityData.reduce((max, item) =>
                          item.value > max.value ? item : max
                          , diversityData[0]);
                        return `${largest.label} (${largest.value}%)`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center py-8 text-gray-500">
                <p>No diversity data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="text-[11px] text-gray-400 mt-8 pt-4 border-t border-gray-200">
        School ratings are provided by Snaphomecollege.org. This information should only be used as a reference.
        Proximity or boundaries shown here are not a guarantee of enrollment. Please reach out to schools directly to verify all information and enrollment eligibility.
      </p>
    </section>
  );
};

export default TopCollegesSection;