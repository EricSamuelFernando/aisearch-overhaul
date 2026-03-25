'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, Award, BookOpen } from 'lucide-react';
import { resolveCollegeLogo } from '../../../lib/collegeLogos';

// Types
interface College {
  name: string;
  ipeds: string;
  rank: number;
}

interface Major {
  name: string;
  cip_code: string;
  rank: number;
}

interface DiversityEntry {
  label: string;
  value: number;
  color: string;
}

interface CollegeReadinessData {
  zipcode?: string;
  school_name?: string;
  top_colleges: College[];
  top_majors: Major[];
  diversity_breakdown: DiversityEntry[] | { [key: string]: number };
}

// Color Palette based on requirements
const DEMOGRAPHIC_COLORS: { [key: string]: string } = {
  'African American': '#8884d8', // Purple-Blue
  'Asian': '#82ca9d',            // Green
  'Hispanic': '#E07A5F',         // Coral
  'Latino': '#E07A5F',           // Coral (Alias)
  'White': '#ff7c7c',            // Soft Red
  'Multiracial': '#6A4C93',      // Deep Purple
  'Native American': '#d084d0',  // Lavender
  'Pacific Islander': '#ffb347', // Orange
  'International': '#5BC0EB',    // Blue
  'Unknown': '#4B5563',          // Dark Gray (mapped to Other)
  'Other': '#4B5563'             // Dark Gray
};

const TopCollegesSection = ({ 
  initialData, 
  isLoadingFromParent = false 
}: { 
  initialData?: CollegeReadinessData | null;
  isLoadingFromParent?: boolean;
}) => {
  const [data, setData] = useState<CollegeReadinessData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string>('');
  const schoolsApiBaseUrl =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL || 'http://localhost:4000';

  // Sync with initialData if it changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  // Get zip code from localStorage or property data
  useEffect(() => {
    const storedZip = localStorage.getItem('propertyAddress2') || '99623';
    setZipCode(storedZip);
  }, []);

  // Fetch college readiness data
  useEffect(() => {
    if (!zipCode || initialData || isLoadingFromParent) return;

    const fetchCollegeReadiness = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${schoolsApiBaseUrl}/schools/college-readiness-by-zip?zipCode=${encodeURIComponent(zipCode)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch college readiness data: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ College Readiness API response (TopCollegesSection):', result);
        setData(result);
      } catch (err) {
        console.error('❌ Error fetching college readiness data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load college readiness data');
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeReadiness();
  }, [zipCode, initialData]);

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
    // Convert object to array and assign requirement-specific colors
    diversityData = Object.entries(data.diversity_breakdown).map(([label, value]) => {
      const displayLabel = label === 'Unknown' ? 'Other' : label;
      return {
        label: displayLabel,
        value: typeof value === 'number' ? parseFloat((value * 100).toFixed(1)) : 0,
        color: DEMOGRAPHIC_COLORS[displayLabel] || DEMOGRAPHIC_COLORS['Other'] || '#cccccc'
      };
    }).sort((a, b) => b.value - a.value); // Sort by highest percentage
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
        Top Colleges Attended by Graduates From{' '}
        <span className="text-orange-600">
          {data.school_name || 'Richard J. Murphy School'}
        </span>
      </h2>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT SIDE: Top Colleges + Top Majors */}
        <div className="space-y-10">

          {/* Top 3 Colleges */}
          {topColleges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-6 w-6 text-[#F07639]" />
                <h3 className="text-xl font-semibold text-gray-800">Top 3 Colleges</h3>
              </div>
              <div className="space-y-3">
                {topColleges.map((college) => {
                  const { logoSrc, fallbackLogo } = resolveCollegeLogo(college.name);
                  return (
                    <div
                      key={college.rank}
                      className="flex justify-between items-center bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* College Logo */}
                        <div className="w-12 h-12 flex-shrink-0 bg-white rounded-full p-1 flex items-center justify-center border border-orange-100 shadow-sm">
                          <img
                            src={logoSrc}
                            alt={college.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src !== fallbackLogo) {
                                target.src = fallbackLogo;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm lg:text-base">{college.name}</div>
                          <div className="text-xs text-gray-500">Institution ID: {college.ipeds}</div>
                        </div>
                      </div>
                      <div className="text-3xl text-gray-400 font-bold">#{college.rank}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top 3 Majors */}
          {topMajors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-[#F07639]" />
                <h3 className="text-xl font-semibold text-gray-800">Top 3 Majors</h3>
              </div>
              <div className="space-y-3">
                {topMajors.map((major) => (
                  <div
                    key={major.rank}
                    className="flex justify-between items-center bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{major.name}</div>
                      <div className="text-xs text-gray-500">CIP: {major.cip_code}</div>
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              {/* Title */}
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="h-6 w-6 text-[#F07639]" />
                <h3 className="text-xl font-semibold text-gray-900">Student Diversity</h3>
              </div>

              {/* Recharts Donut Chart */}
              <div className="flex justify-center h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diversityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {diversityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md text-sm">
                              <p className="font-bold text-gray-900">{data.label}</p>
                              <p className="text-gray-600">
                                {data.value}% of students
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend - Multi-column grid */}
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-2 mb-6 px-2">
                {diversityData.map(({ label, value, color }: DiversityEntry) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-700 truncate" title={label}>
                      {label}
                    </span>
                    <span className="text-xs text-gray-500 font-medium ml-auto">
                      {value}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Diversity Summary Box */}
              <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Diversity Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm text-gray-600">Total Groups</span>
                    <span className="block text-lg font-bold text-gray-900">
                      {diversityData.length}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Largest Group</span>
                    <span className="block text-sm font-bold text-gray-900">
                      {(() => {
                        const largest = diversityData[0]; // Already sorted
                        return (
                          <span style={{ color: largest.color }}>
                            {largest.label} ({largest.value}%)
                          </span>
                        );
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
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
