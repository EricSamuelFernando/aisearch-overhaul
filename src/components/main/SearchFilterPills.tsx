'use client';

import React from 'react';
import type { FilterItem, FilterGroup } from '@/lib/filter-data';
import { FILTER_GROUPS } from '@/lib/filter-data';

export type { FilterItem, FilterGroup };
export { FILTER_GROUPS };

// ─── Filter Pill ──────────────────────────────────────────────────────────────

interface FilterPillProps {
  item: FilterItem;
  selected: boolean;
  highlighted: boolean; // glows when user's typed text matches this filter
  onToggle: (id: string) => void;
}

function FilterPill({ item, selected, highlighted, onToggle }: FilterPillProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onToggle(item.id)}
      className={[
        'flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-full transition-all duration-150 select-none',
        selected
          ? 'bg-[#e8804c] border border-[#e8804c] text-white shadow-[0_2px_8px_rgba(232,128,76,0.28)]'
          : highlighted
          ? 'bg-white border border-[#e8804c]/60 text-gray-700 ring-2 ring-[#e8804c]/15'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-[#e8804c]/40 hover:text-gray-800 hover:bg-gray-50',
      ].join(' ')}
    >
      {item.label}
      {selected && (
        <svg
          className="w-2.5 h-2.5 flex-shrink-0 opacity-80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

interface BeInspiredTag {
  label: string;
  query: string;
}

interface SearchFilterPillsProps {
  selectedFilters: Set<string>;
  onFilterToggle: (id: string) => void;
  highlightedFilters: Set<string>;
  beInspiredTags: BeInspiredTag[];
  selectedBeInspired: Set<string>;
  onBeInspiredClick: (label: string, query: string) => void;
}

export function SearchFilterPills({
  selectedFilters,
  onFilterToggle,
  highlightedFilters,
  beInspiredTags,
  selectedBeInspired,
  onBeInspiredClick,
}: SearchFilterPillsProps) {
  return (
    <div className="px-4 pt-3.5 pb-4 space-y-3">
      {FILTER_GROUPS.map((group, gIdx) => (
        <div key={group.id}>
          {gIdx > 0 && <div className="border-t border-gray-100 mb-3" />}
          <p className="text-[10px] font-semibold text-gray-400 tracking-[0.14em] uppercase mb-2">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.filters.map((filter) => (
              <FilterPill
                key={filter.id}
                item={filter}
                selected={selectedFilters.has(filter.id)}
                highlighted={
                  highlightedFilters.has(filter.id) && !selectedFilters.has(filter.id)
                }
                onToggle={onFilterToggle}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Vibe & Aesthetic */}
      <div>
        <div className="border-t border-gray-100 mb-3" />
        <p className="text-[10px] font-semibold text-gray-400 tracking-[0.14em] uppercase mb-2">Vibe &amp; Aesthetic</p>
        <div className="flex flex-wrap gap-1.5">
          {beInspiredTags.map((tag) => {
            const active = selectedBeInspired.has(tag.label);
            return (
              <button
                key={tag.label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onBeInspiredClick(tag.label, tag.query)}
                className={[
                  'flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border transition-colors',
                  active
                    ? 'bg-[#fff5f0] border-[#e8804c]/50 text-[#c86b3e]'
                    : 'border-gray-200 text-gray-700 hover:bg-[#fff5f0] hover:border-[#e8804c]/50 hover:text-[#c86b3e]',
                ].join(' ')}
              >
                <span className="text-[#e8804c] font-semibold leading-none">{active ? '✓' : '+'}</span>
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
