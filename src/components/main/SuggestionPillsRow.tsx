'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FlipSuggestionPill } from './FlipSuggestionPill';

const STATIC_PILLS = [
  { label: '3 bed homes in LA',    query: '3 bedroom homes in Los Angeles' },
  { label: 'Buy vs rent today?',   query: 'Should I buy or rent right now in this market?' },
  { label: 'Near top schools',     query: 'Homes near top-rated schools' },
] as const;

// Delay (ms) before flipping — ensures entry animation always plays first,
// even when personalized suggestions arrive instantly from sessionStorage cache.
const MIN_STATIC_DISPLAY_MS = 700;

interface SuggestionPillsRowProps {
  personalizedSuggestions: string[];
  onPillClick: (text: string) => void;
}

export function SuggestionPillsRow({ personalizedSuggestions, onPillClick }: SuggestionPillsRowProps) {
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [readyToFlip, setReadyToFlip] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReadyToFlip(true), MIN_STATIC_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (readyToFlip && personalizedSuggestions.length > 0) {
      setFlipped(STATIC_PILLS.map((_, i) => i < personalizedSuggestions.length));
    }
  }, [readyToFlip, personalizedSuggestions]);

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-5">
      {STATIC_PILLS.map((pill, i) => (
        <motion.div
          key={pill.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.08,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <FlipSuggestionPill
            label={pill.label}
            query={pill.query}
            personalizedText={personalizedSuggestions[i] ?? null}
            flipped={flipped[i]}
            flipDelay={i * 0.13}
            onClick={onPillClick}
          />
        </motion.div>
      ))}
    </div>
  );
}
