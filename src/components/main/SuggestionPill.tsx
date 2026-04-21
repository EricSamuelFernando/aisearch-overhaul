'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestionPillProps {
  staticLabel: string;
  staticQuery: string;
  personalizedLabel: string | null;
  personalizedQuery: string | null;
  isPersonalized: boolean;
  transitionDelay: number; // seconds
  onClick: (query: string) => void;
}

export function SuggestionPill({
  staticLabel,
  staticQuery,
  personalizedLabel,
  personalizedQuery,
  isPersonalized,
  transitionDelay,
  onClick,
}: SuggestionPillProps) {
  const [showPersonalized, setShowPersonalized] = useState(false);

  useEffect(() => {
    if (!isPersonalized || !personalizedLabel) return;
    const t = setTimeout(() => setShowPersonalized(true), transitionDelay * 1000);
    return () => clearTimeout(t);
  }, [isPersonalized, personalizedLabel, transitionDelay]);

  const displayLabel = showPersonalized && personalizedLabel ? personalizedLabel : staticLabel;
  const clickQuery   = showPersonalized && personalizedQuery ? personalizedQuery : staticQuery;

  return (
    <motion.button
      type="button"
      onClick={() => onClick(clickQuery)}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: { y: 0, scale: 1 },
        hover: { y: -3, scale: 1.025, transition: { type: 'spring', stiffness: 380, damping: 22 } },
        tap:  { y: 0,  scale: 0.97,  transition: { type: 'spring', stiffness: 500, damping: 28 } },
      }}
      className="group relative w-full p-[1.5px] rounded-2xl bg-transparent cursor-pointer select-none"
    >
      {/* Default border — warm white gradient simulating top-left light source */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/85 via-white/40 to-white/10 transition-opacity duration-300 group-hover:opacity-0" />

      {/* Hover border — orange glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F58634]/85 via-[#F58634]/40 to-[#F58634]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Pill surface — warm white, multi-layer shadow for material depth */}
      <div
        className="relative flex items-center justify-between gap-2 px-4 py-3 rounded-[14px] min-h-[52px] overflow-hidden
          bg-[#FEFCF8]
          transition-shadow duration-200"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.92), 0 1px 2px rgba(0,0,0,0.09), 0 4px 20px rgba(0,0,0,0.13)',
        }}
      >
        {/* Shimmer — diagonal highlight sweeps across on hover */}
        <motion.div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            width: '55%',
            background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            transform: 'skewX(-12deg)',
          }}
          variants={{
            rest: { left: '-60%' },
            hover: { left: '130%', transition: { duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.04 } },
            tap:  { left: '-60%' },
          }}
        />

        {/* Text — crossfade on personalization */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={showPersonalized ? 'personalized' : 'static'}
            className="flex-1 min-w-0 text-[12px] font-semibold text-[#111111] leading-snug text-left whitespace-normal tracking-[-0.01em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {displayLabel}
          </motion.span>
        </AnimatePresence>

        {/* Arrow — slides in + orange tint on hover */}
        <motion.svg
          className="w-3 h-3 flex-shrink-0 text-[#F58634]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
          variants={{
            rest: { opacity: 0, x: -5 },
            hover: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 420, damping: 22, delay: 0.06 } },
            tap:  { opacity: 0, x: -5 },
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </motion.svg>
      </div>
    </motion.button>
  );
}
