'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SuggestionPill } from './SuggestionPill';
import type { Suggestion } from '@/hooks/useSuggestions';

const STATIC_PILLS = [
  { label: 'Homes under $700K',      query: 'Homes under $700,000' },
  { label: 'Buy vs. rent?',          query: 'Should I buy or rent right now in this market?' },
  { label: 'Near top schools',       query: 'Homes near top-rated schools' },
] as const;

// Guard: always show static state first so entry animation plays before text swap,
// even when personalized suggestions arrive instantly from sessionStorage cache.
const MIN_STATIC_DISPLAY_MS = 800;

interface SuggestionPillsRowProps {
  personalizedSuggestions: Suggestion[];
  onPillClick: (text: string) => void;
}

export function SuggestionPillsRow({ personalizedSuggestions, onPillClick }: SuggestionPillsRowProps) {
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [readyToSwap, setReadyToSwap]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReadyToSwap(true), MIN_STATIC_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (readyToSwap && personalizedSuggestions.length > 0) {
      setIsPersonalized(true);
    }
  }, [readyToSwap, personalizedSuggestions]);

  return (
    // Fixed-height wrapper — search bar never shifts regardless of pill state
    <div className="min-h-[80px] flex items-center justify-center mb-6">
      <div className="grid grid-cols-3 gap-3 w-full max-w-[636px] px-1">
        {STATIC_PILLS.map((pill, i) => (
          <motion.div
            key={pill.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.09,
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <SuggestionPill
              staticLabel={pill.label}
              staticQuery={pill.query}
              personalizedLabel={personalizedSuggestions[i]?.label ?? null}
              personalizedQuery={personalizedSuggestions[i]?.query ?? null}
              isPersonalized={isPersonalized}
              transitionDelay={i * 0.22}
              onClick={onPillClick}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
