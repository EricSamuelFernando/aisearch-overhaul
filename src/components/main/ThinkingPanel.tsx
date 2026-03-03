'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThinkingStep {
  id: string;
  label: string;
  detail?: string;
  agentName?: string;
  durationMs?: number;
}

interface StepDef {
  id: string;
  label: string;
  detail: string;
  agentName: string;
  delayMs: number; // When to make this step "active" relative to start
}

type StepStatus = 'pending' | 'active' | 'done';

interface LiveStep extends StepDef {
  status: StepStatus;
  durationMs?: number;
}

// ─── Intent detection ─────────────────────────────────────────────────────────

type QueryIntent =
  | 'property_search'
  | 'financial_analysis'
  | 'school_search'
  | 'mortgage_calc'
  | 'rent_vs_buy'
  | 'qa_advisory'
  | 'reference'
  | 'compare';

function detectIntent(query: string): QueryIntent {
  const q = query.toLowerCase();

  if (/\brent\s+vs\s+buy\b|\bshould\s+i\s+rent\b|\brent\s+or\s+buy\b/.test(q)) return 'rent_vs_buy';

  if (
    /\bcompare\s+\d+%?\s+down\b|\bcompare\s+\$[\d,.]+\b|\b15\s*[\-\s]?year\b|\b30\s*[\-\s]?year\b|\b15yr\b|\b30yr\b|down\s+payment\s+comparison|afford.*\$[\d,.]+.*(?:home|house|property)/i.test(q) ||
    /\$[\d,.]+\s*(?:m|k)?\s+(?:vs|versus|or)\s+\$[\d,.]+/i.test(q)
  ) return 'financial_analysis';

  if (/\bmortgage\s+payment\b|\bmonthly\s+payment\b|\bwhat.*my\s+payment\b|\bwhat.*(?:payment|borrow)\b|\bcalculate\b|\b(?:monthly|payment)\s+on\s+a\s*\$/i.test(q)) return 'mortgage_calc';

  if (/\bschool\b|\belementary\b|\bhigh\s+school\b|\bstem\b|\bcollege\b|\bdistrict\b|\bgraduate\b|\brating.*school\b|\bschool.*rating\b/.test(q)) return 'school_search';

  if (/\bwhat\s+is\b|\bhow\s+does\b|\bwhen\s+should\b|\bexplain\b|\btell\s+me\s+about\b|\bpmi\b|\bescrow\b|\bclosing\s+cost\b|\bdti\b|\bcredit\s+score\b|\bfha\b|\bconventional\b|\barm\b|\brefinanc/i.test(q)) return 'qa_advisory';

  if (/\b(first|second|third|1st|2nd|3rd|property\s+[#\d]+|#\d+|that\s+(?:house|home|property|one))\b/i.test(q)) return 'reference';

  return 'property_search';
}

// ─── Step library ─────────────────────────────────────────────────────────────

// delayMs now means: minimum time THIS step stays "active" before the next step fires.
// The last step in each sequence has delayMs: 0 — it stays active until the backend responds.
const STEP_LIBRARY: Record<QueryIntent, StepDef[]> = {
  property_search: [
    { id: 's1', label: 'Nova analyzed your request',        detail: 'Routing to PropertySearchAgent',           agentName: 'Nova',                 delayMs: 900  },
    { id: 's2', label: 'PropertySearchAgent activated',     detail: 'Extracting location, price & filters',     agentName: 'PropertySearchAgent',  delayMs: 1500 },
    { id: 's3', label: 'Querying MLS database',             detail: 'Scanning thousands of active listings',    agentName: 'MLS',                  delayMs: 2500 },
    { id: 's4', label: 'Ranking top matches',               detail: 'Scoring by fit, value & neighborhood',    agentName: 'PropertySearchAgent',  delayMs: 2000 },
    { id: 's5', label: 'Generating advisor response',       detail: 'Composing personalised summary',           agentName: 'PropertySearchAgent',  delayMs: 0    },
  ],
  financial_analysis: [
    { id: 'f1', label: 'Nova analyzed your request',        detail: 'Routing to FinancialAdvisorAgent',         agentName: 'Nova',                 delayMs: 800  },
    { id: 'f2', label: 'FinancialAdvisorAgent activated',   detail: 'Parsing financial parameters',             agentName: 'FinancialAdvisorAgent',delayMs: 1200 },
    { id: 'f3', label: 'Computing mortgage scenarios',      detail: 'Calculating P&I, tax, insurance & PMI',   agentName: 'FinancialAdvisorAgent',delayMs: 2000 },
    { id: 'f4', label: 'Calculating DTI & affordability',   detail: 'Checking thresholds vs your income',      agentName: 'FinancialAdvisorAgent',delayMs: 1800 },
    { id: 'f5', label: 'Composing detailed analysis',       detail: 'Building cost table & verdict',           agentName: 'FinancialAdvisorAgent',delayMs: 0    },
  ],
  school_search: [
    { id: 'sc1', label: 'Nova analyzed your request',       detail: 'Routing to SnapGradAgent',                agentName: 'Nova',                 delayMs: 800  },
    { id: 'sc2', label: 'SnapGradAgent activated',          detail: 'Identifying school district & location',  agentName: 'SnapGradAgent',        delayMs: 1200 },
    { id: 'sc3', label: 'Querying school database',         detail: 'Fetching ratings, test scores & programs',agentName: 'SnapGradAgent',        delayMs: 2500 },
    { id: 'sc4', label: 'Ranking by ratings & programs',    detail: 'Scoring STEM, athletics & overall fit',   agentName: 'SnapGradAgent',        delayMs: 1800 },
    { id: 'sc5', label: 'Compiling school report',          detail: 'Generating personalised school summary',  agentName: 'SnapGradAgent',        delayMs: 0    },
  ],
  mortgage_calc: [
    { id: 'm1', label: 'Nova analyzed your request',        detail: 'Routing to SnapInterestAgent',            agentName: 'Nova',                 delayMs: 800  },
    { id: 'm2', label: 'SnapInterestAgent activated',       detail: 'Parsing loan amount, rate & term',        agentName: 'SnapInterestAgent',    delayMs: 1200 },
    { id: 'm3', label: 'Running mortgage calculations',     detail: 'Computing P&I using amortisation formula',agentName: 'SnapInterestAgent',    delayMs: 2000 },
    { id: 'm4', label: 'Preparing payment breakdown',       detail: 'Building monthly cost summary',           agentName: 'SnapInterestAgent',    delayMs: 0    },
  ],
  rent_vs_buy: [
    { id: 'r1', label: 'Nova analyzed your request',        detail: 'Routing to RentVsBuyAgent',               agentName: 'Nova',                 delayMs: 800  },
    { id: 'r2', label: 'RentVsBuyAgent activated',          detail: 'Gathering market & income data',          agentName: 'RentVsBuyAgent',       delayMs: 1200 },
    { id: 'r3', label: 'Analysing market conditions',       detail: 'Checking local price-to-rent ratios',     agentName: 'RentVsBuyAgent',       delayMs: 2000 },
    { id: 'r4', label: 'Calculating 10-year scenarios',     detail: 'Modelling wealth delta, equity & taxes',  agentName: 'RentVsBuyAgent',       delayMs: 2000 },
    { id: 'r5', label: 'Generating recommendation',         detail: 'Building your personalised verdict',      agentName: 'RentVsBuyAgent',       delayMs: 0    },
  ],
  qa_advisory: [
    { id: 'q1', label: 'Nova analyzed your request',        detail: 'Routing to RealEstateAdvisorAgent',       agentName: 'Nova',                 delayMs: 800  },
    { id: 'q2', label: 'RealEstateAdvisorAgent activated',  detail: 'Researching your question',               agentName: 'RealEstateAdvisorAgent',delayMs: 1800 },
    { id: 'q3', label: 'Composing expert answer',           detail: 'Drawing on real estate knowledge base',   agentName: 'RealEstateAdvisorAgent',delayMs: 0    },
  ],
  reference: [
    { id: 'ref1', label: 'Nova analyzed your request',      detail: 'Identifying referenced property',         agentName: 'Nova',                 delayMs: 600  },
    { id: 'ref2', label: 'Loading property details',        detail: 'Retrieving listing data from context',    agentName: 'PropertySearchAgent',  delayMs: 1000 },
    { id: 'ref3', label: 'Generating property summary',     detail: 'Composing detailed property insights',    agentName: 'PropertySearchAgent',  delayMs: 0    },
  ],
  compare: [
    { id: 'c1', label: 'Nova analyzed your request',        detail: 'Identifying properties to compare',       agentName: 'Nova',                 delayMs: 700  },
    { id: 'c2', label: 'Loading comparison data',           detail: 'Retrieving both listing details',         agentName: 'PropertySearchAgent',  delayMs: 1200 },
    { id: 'c3', label: 'Running side-by-side analysis',     detail: 'Scoring value, size & location factors',  agentName: 'PropertySearchAgent',  delayMs: 2000 },
    { id: 'c4', label: 'Generating comparison report',      detail: 'Building verdict with key differences',   agentName: 'PropertySearchAgent',  delayMs: 0    },
  ],
};

// ─── Agent accent colours (subtle, not garish) ────────────────────────────────

function agentDotColor(agentName: string): string {
  const map: Record<string, string> = {
    'Nova':                     'bg-purple-400',
    'PropertySearchAgent':      'bg-[#F58634]',
    'FinancialAdvisorAgent':    'bg-emerald-400',
    'SnapGradAgent':            'bg-sky-400',
    'SnapInterestAgent':        'bg-blue-400',
    'RentVsBuyAgent':           'bg-amber-400',
    'RealEstateAdvisorAgent':   'bg-rose-400',
    'MLS':                      'bg-gray-400',
  };
  return map[agentName] ?? 'bg-gray-400';
}

// ─── Spinner SVG ──────────────────────────────────────────────────────────────

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Duration badge ───────────────────────────────────────────────────────────

function DurationBadge({ ms }: { ms: number }) {
  const s = (ms / 1000).toFixed(1);
  return (
    <span className="ml-auto flex-shrink-0 text-[10px] text-gray-300 tabular-nums font-medium pl-3">
      {s}s
    </span>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────

function StepRow({ step, index }: { step: LiveStep; index: number }) {
  const isPending = step.status === 'pending';
  const isActive  = step.status === 'active';
  const isDone    = step.status === 'done';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: isPending ? 0.35 : 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex items-start gap-2.5 py-1.5 group"
    >
      {/* Status icon */}
      <div className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">
        {isDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
          </motion.div>
        )}
        {isActive && (
          <Spinner className="w-3.5 h-3.5 text-[#F58634]" />
        )}
        {isPending && (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-auto" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className={`text-[12.5px] leading-snug font-medium transition-colors ${
          isDone   ? 'text-gray-400' :
          isActive ? 'text-gray-800' :
                     'text-gray-400'
        }`}>
          {step.label}
        </span>

        {/* Detail — only visible when active */}
        <AnimatePresence>
          {isActive && step.detail && (
            <motion.p
              key="detail"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] text-gray-400 mt-0.5 leading-snug"
            >
              {step.detail}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Agent pill — small, shown when done */}
      {isDone && step.durationMs !== undefined && (
        <DurationBadge ms={step.durationMs} />
      )}
      {isDone && step.durationMs === undefined && (
        <span className={`flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${agentDotColor(step.agentName)}`} />
      )}
    </motion.div>
  );
}

// ─── Collapsed "Thought for Xs" chip ─────────────────────────────────────────

function CollapsedChip({
  totalMs,
  onExpand,
}: {
  totalMs: number;
  onExpand: () => void;
}) {
  const s = (totalMs / 1000).toFixed(1);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onExpand}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[11.5px] text-gray-400 hover:text-gray-600 hover:border-gray-200 hover:bg-gray-100 transition-all group cursor-pointer"
    >
      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
      <span>Thought for <span className="font-medium text-gray-500">{s}s</span></span>
      <ChevronDown className="w-3 h-3 ml-0.5 opacity-40 group-hover:opacity-70 transition-opacity" />
    </motion.button>
  );
}

// ─── Pulsing dots for "Thinking..." header ────────────────────────────────────

function PulsingDots() {
  return (
    <span className="inline-flex items-end gap-[3px] ml-1.5 mb-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-[3.5px] h-[3.5px] rounded-full bg-[#F58634]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

// ─── Skeleton shimmer lines ───────────────────────────────────────────────────

function SkeletonLines() {
  return (
    <div className="mt-4 space-y-2.5 overflow-hidden">
      {[
        'w-[85%]',
        'w-[68%]',
        'w-[78%]',
        'w-[52%]',
      ].map((w, i) => (
        <motion.div
          key={i}
          className={`h-3 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] ${w}`}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15, ease: 'linear' }}
          style={{ backgroundSize: '200% 100%' }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ThinkingPanelProps {
  isThinking: boolean;
  query: string;
  /** Optional actual steps from backend — used when available for real timing */
  backendSteps?: ThinkingStep[];
}

export default function ThinkingPanel({ isThinking, query, backendSteps }: ThinkingPanelProps) {
  const intent = detectIntent(query);
  const stepDefs = STEP_LIBRARY[intent] ?? STEP_LIBRARY.property_search;

  const [liveSteps, setLiveSteps] = useState<LiveStep[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalMs, setTotalMs] = useState(0);

  const startTimeRef  = useRef<number>(0);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stepTimesRef  = useRef<number[]>([]);

  // ── Reset and start animation when thinking begins ────────────────────────
  useEffect(() => {
    if (!isThinking) return;

    // Clear any previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    stepTimesRef.current = [];

    startTimeRef.current = Date.now();
    setIsDone(false);
    setIsExpanded(false);
    setTotalMs(0);

    // Initialise all steps as pending
    setLiveSteps(stepDefs.map((s) => ({ ...s, status: 'pending' })));

    // Sequential chaining: delayMs = how long THIS step stays active before the next fires.
    // Build cumulative delays so each step fires after all previous minActive times have elapsed.
    let cumulativeDelay = 0;
    stepDefs.forEach((step, idx) => {
      const fireAt = cumulativeDelay;
      cumulativeDelay += step.delayMs; // accumulate for the next step

      const timer = setTimeout(() => {
        const now = Date.now();
        stepTimesRef.current[idx] = now;

        setLiveSteps((prev) =>
          prev.map((s, i) => {
            // Steps before the previous one: already done — preserve their durationMs
            if (i < idx - 1) return s;
            // The step just before current: mark done with its exact active duration
            if (i === idx - 1) {
              const startedAt = stepTimesRef.current[idx - 1];
              return {
                ...s,
                status: 'done' as StepStatus,
                durationMs: startedAt !== undefined ? now - startedAt : undefined,
              };
            }
            // Current step: activate
            if (i === idx) return { ...s, status: 'active' as StepStatus };
            // Future steps: keep pending
            return s;
          })
        );
      }, fireAt);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThinking, query]);

  // ── Mark all done when backend responds ──────────────────────────────────
  useEffect(() => {
    if (isThinking || liveSteps.length === 0) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const elapsed = Date.now() - startTimeRef.current;
    setTotalMs(elapsed);

    if (backendSteps && backendSteps.length > 0) {
      // Backend sent actual timing — use it for labels and durations
      const finalSteps = backendSteps.map((bs, i) => ({
        ...(stepDefs[i] ?? { id: bs.id, label: bs.label, detail: '', agentName: bs.agentName ?? '', delayMs: 0 }),
        label: bs.label,
        agentName: bs.agentName ?? stepDefs[i]?.agentName ?? '',
        status: 'done' as StepStatus,
        durationMs: bs.durationMs,
      }));
      setLiveSteps(finalSteps);
    } else {
      // Preserve durations for already-done steps; only compute duration for the last active step
      const now = Date.now();
      setLiveSteps((prev) =>
        prev.map((s, i) => {
          if (s.status === 'done') return s; // keep exact duration already recorded
          return {
            ...s,
            status: 'done' as StepStatus,
            durationMs: stepTimesRef.current[i] !== undefined
              ? now - stepTimesRef.current[i]
              : undefined,
          };
        })
      );
    }

    setIsDone(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThinking]);

  // ── Don't render before first query ──────────────────────────────────────
  if (!isThinking && !isDone) return null;

  // ── Collapsed chip (after response) ──────────────────────────────────────
  if (isDone && !isExpanded) {
    return (
      <div className="flex items-start gap-4 mt-6 ml-1">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#140800] ring-1 ring-[#F58634]/35 shadow-sm flex items-center justify-center">
          <Image
            src="/assets/images/snaphomz-icon-thick.png"
            alt="SnapHomz AI"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        </div>
        <div className="pt-2.5">
          <CollapsedChip totalMs={totalMs} onExpand={() => setIsExpanded(true)} />
        </div>
      </div>
    );
  }

  // ── Expanded steps (done + user opened, or still thinking) ───────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 mt-6 ml-1"
    >
      {/* SnapHomz avatar */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#140800] ring-1 ring-[#F58634]/35 shadow-sm flex items-center justify-center">
        <Image
          src="/assets/images/snaphomz-icon-thick.png"
          alt="SnapHomz AI"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
      </div>

      {/* Panel body */}
      <div className="flex-1 min-w-0 max-w-md">

        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          {isThinking ? (
            <>
              <span className="text-[13.5px] font-semibold text-gray-700 leading-none">
                Thinking
              </span>
              <PulsingDots />
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors group"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
              <span>Thought for <span className="font-medium text-gray-500">{(totalMs / 1000).toFixed(1)}s</span></span>
              <ChevronUp className="w-3 h-3 ml-0.5 opacity-40 group-hover:opacity-70 transition-opacity" />
            </button>
          )}
        </div>

        {/* Step list */}
        <div className="border-l-2 border-gray-100 pl-3 space-y-0">
          {liveSteps.map((step, i) => (
            <StepRow key={step.id} step={step} index={i} />
          ))}
        </div>

        {/* Shimmer skeleton — only while thinking, after first step appears */}
        {isThinking && liveSteps.some(s => s.status !== 'pending') && (
          <SkeletonLines />
        )}
      </div>
    </motion.div>
  );
}
