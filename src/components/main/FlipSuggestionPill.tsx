'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface FlipSuggestionPillProps {
  label: string;
  query: string;
  personalizedText: string | null;
  flipped: boolean;
  flipDelay: number;
  onClick: (text: string) => void;
}

export function FlipSuggestionPill({
  label,
  query,
  personalizedText,
  flipped,
  flipDelay,
  onClick,
}: FlipSuggestionPillProps) {
  const handleClick = () => {
    onClick(flipped && personalizedText ? personalizedText : query);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      title={flipped && personalizedText ? personalizedText : query}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="group relative w-[196px] h-[50px] cursor-pointer select-none hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-150 ease-out"
      style={{ perspective: '900px' }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{
          duration: 0.55,
          delay: flipDelay,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        {/* ── Front Face ── */}
        <div
          className="absolute inset-0 flex items-center justify-center px-5 rounded-full bg-white/95 border border-white/30 shadow-[0_2px_20px_rgba(0,0,0,0.18)] text-gray-800 text-[13px] font-medium text-center leading-tight group-hover:bg-white group-hover:shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-all duration-200"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {label}
        </div>

        {/* ── Back Face ── personalized */}
        <div
          className="absolute inset-0 flex items-center gap-2 px-4 rounded-full bg-white border border-[#F58634]/30 shadow-[0_4px_24px_rgba(245,134,52,0.2)] group-hover:border-[#F58634]/60 group-hover:shadow-[0_6px_28px_rgba(245,134,52,0.28)] transition-all duration-200"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Sparkles className="w-3 h-3 text-[#F58634] flex-shrink-0" />
          <span className="text-[11.5px] text-gray-700 leading-snug line-clamp-2 min-w-0 group-hover:text-gray-900 transition-colors duration-150">
            {personalizedText || label}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
