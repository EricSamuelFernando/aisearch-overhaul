'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThinkingStep {
  id: string;
  label: string;
  title?: string;
  detail?: string;
  bullets?: string[];
  status?: 'pending' | 'active' | 'done' | 'error';
  source?: string;
  metrics?: Record<string, string | number | boolean>;
  started_at?: string;
  ended_at?: string;
  agentName?: string;
  durationMs?: number;
}

interface StepDef {
  id: string;
  label: string;
  title?: string;
  detail: string;
  bullets?: string[];
  source?: string;
  metrics?: Record<string, string | number | boolean>;
  started_at?: string;
  ended_at?: string;
  agentName: string;
  delayMs: number; // When to make this step "active" relative to start
}

type StepStatus = 'pending' | 'active' | 'done' | 'error';

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

function resolveIntent(query: string, intentHint?: string): QueryIntent {
  const normalizedHint = (intentHint || '').trim().toLowerCase();

  if (
    normalizedHint === 'property_search' ||
    normalizedHint === 'financial_analysis' ||
    normalizedHint === 'school_search' ||
    normalizedHint === 'mortgage_calc' ||
    normalizedHint === 'rent_vs_buy' ||
    normalizedHint === 'qa_advisory' ||
    normalizedHint === 'reference' ||
    normalizedHint === 'compare'
  ) {
    return normalizedHint as QueryIntent;
  }

  if (
    normalizedHint === 'general' ||
    normalizedHint === 'question' ||
    normalizedHint === 'answer_question' ||
    normalizedHint === 'advisory' ||
    normalizedHint === 'qa'
  ) return 'qa_advisory';

  if (
    normalizedHint === 'property' ||
    normalizedHint === 'search' ||
    normalizedHint === 'search_properties'
  ) return 'property_search';

  if (
    normalizedHint === 'rent-vs-buy' ||
    normalizedHint === 'rent_vs_buy' ||
    normalizedHint === 'rent_vs_buy_analysis'
  ) return 'rent_vs_buy';

  if (
    normalizedHint === 'mortgage' ||
    normalizedHint === 'snapinterest' ||
    normalizedHint === 'calculate_mortgage'
  ) return 'mortgage_calc';

  if (
    normalizedHint === 'school' ||
    normalizedHint === 'snapgrad' ||
    normalizedHint === 'search_schools'
  ) return 'school_search';

  if (
    normalizedHint === 'reference_property'
  ) return 'reference';

  if (
    normalizedHint === 'comparison' ||
    normalizedHint === 'compare_properties'
  ) return 'compare';

  return detectIntent(query);
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

type QuerySignals = {
  location?: string;
  price?: string;
  beds?: string;
  baths?: string;
  wantsSchools: boolean;
  wantsPool: boolean;
};

function extractQuerySignals(query: string): QuerySignals {
  const q = query.trim();
  const lower = q.toLowerCase();

  const zipMatch = q.match(/\b\d{5}(?:-\d{4})?\b/);
  const inLocationMatch = q.match(/\bin\s+([A-Za-z .'-]+?)(?:,|\s+\d{5}|\s*$)/i);
  const location = zipMatch?.[0] || inLocationMatch?.[1]?.trim();

  const betweenMatch = q.match(/\bbetween\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)\s+(?:and|to)\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)/i);
  const underMatch = q.match(/\b(?:under|below|less than|max(?:imum)?(?: price)?)\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)/i);
  const overMatch = q.match(/\b(?:over|above|more than|min(?:imum)?(?: price)?)\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)/i);
  const price =
    betweenMatch ? `$${betweenMatch[1]}-$${betweenMatch[2]}` :
    underMatch ? `under $${underMatch[1]}` :
    overMatch ? `over $${overMatch[1]}` :
    undefined;

  const bedMatch = q.match(/\b(\d+)\s*(?:\+?\s*)?(?:bed|beds|bedroom|bedrooms|br)\b/i);
  const bathMatch = q.match(/\b(\d+(?:\.\d+)?)\s*(?:\+?\s*)?(?:bath|baths|bathroom|bathrooms|ba)\b/i);

  return {
    location,
    price,
    beds: bedMatch ? `${bedMatch[1]}+ beds` : undefined,
    baths: bathMatch ? `${bathMatch[1]}+ baths` : undefined,
    wantsSchools: /\bschool|district|stem|rating|elementary|middle|high school|college\b/i.test(lower),
    wantsPool: /\bpool\b/i.test(lower),
  };
}

function buildFocusSummary(signals: QuerySignals): string {
  const bits: string[] = [];
  if (signals.location) bits.push(`location ${signals.location}`);
  if (signals.price) bits.push(`budget ${signals.price}`);
  if (signals.beds) bits.push(signals.beds);
  if (signals.baths) bits.push(signals.baths);
  if (signals.wantsSchools) bits.push('school quality');
  if (signals.wantsPool) bits.push('pool preference');
  return bits.length > 0 ? bits.join(', ') : 'your request context';
}

function enrichStepDetail(step: StepDef, intent: QueryIntent, focusSummary: string): string {
  const lowerLabel = step.label.toLowerCase();

  if (lowerLabel.includes('analyzed your request')) {
    return `Classifying intent as ${intent.replace(/_/g, ' ')} and extracting key constraints (${focusSummary}).`;
  }
  if (lowerLabel.includes('activated')) {
    return `Handing off to ${step.agentName} with context: ${focusSummary}.`;
  }
  if (lowerLabel.includes('querying') || lowerLabel.includes('running') || lowerLabel.includes('analysing') || lowerLabel.includes('calculating')) {
    return `${step.detail}. Using ${focusSummary}.`;
  }
  if (lowerLabel.includes('ranking') || lowerLabel.includes('scoring')) {
    return `${step.detail}. Prioritizing best-fit options for your goals.`;
  }
  if (lowerLabel.includes('generating') || lowerLabel.includes('composing') || lowerLabel.includes('compiling') || lowerLabel.includes('preparing')) {
    return `Consolidating findings into a clear recommendation with next-step guidance.`;
  }
  return step.detail;
}

// ─── Agent accent colours (subtle, not garish) ────────────────────────────────

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
    <span className="flex-shrink-0 text-[12px] text-slate-500 tabular-nums font-medium">
      {s}s
    </span>
  );
}

function formatMetricLabel(key: string): string {
  const pretty = String(key || '').replace(/_/g, ' ').trim();
  if (!pretty) return '';
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

function formatMetricValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
  }
  return String(value);
}

function statusBadgeClass(status: StepStatus): string {
  if (status === 'active') return 'bg-[#FFF4EC] text-[#C96B2C] border-[#F5D4BE]';
  if (status === 'done') return 'bg-[#ECFDF3] text-[#0F8A4B] border-[#B7EBCF]';
  if (status === 'error') return 'bg-[#FEF2F2] text-[#B42318] border-[#FECACA]';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

// ─── Step row ─────────────────────────────────────────────────────────────────

function StepRow({ step, index }: { step: LiveStep; index: number }) {
  const isPending = step.status === 'pending';
  const isActive = step.status === 'active';
  const title = step.title || step.label;
  const displayBullets = (step.bullets || [])
    .map((bullet) => String(bullet || '').trim())
    .filter((bullet) => Boolean(bullet))
    .filter((bullet) => !/^incoming query:/i.test(bullet))
    .filter((bullet) => !/^route\s*[:=]/i.test(bullet))
    .filter((bullet) => !/^duration[_\s-]?s\s*[:=]/i.test(bullet));
  const hasBullets = displayBullets.length > 0;
  const showDetail = Boolean(step.detail) && !hasBullets;
  const showBody = showDetail || hasBullets;
  const statusLabel = isActive ? 'Running' : step.status === 'done' ? 'Done' : step.status === 'error' ? 'Error' : 'Pending';
  const metricEntries = Object.entries(step.metrics || {})
    .filter(([key, value]) => {
      if (key === 'duration_s') return false;
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim().length === 0) return false;
      if (typeof value === 'boolean' && value === false) return false;
      return true;
    })
    .slice(0, 6);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: isPending ? 0.35 : 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-2xl border border-slate-200/90 bg-white shadow-sm px-4 sm:px-5 py-3 sm:py-4 text-left"
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[17px] sm:text-[18px] leading-tight font-semibold text-slate-800">
              {title}
            </span>
            {step.source ? (
              <div className="mt-1 text-[12px] sm:text-[13px] text-slate-500">
                {step.source}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(isActive ? 'active' : step.status)}`}>
              {statusLabel}
            </span>
            {step.durationMs !== undefined && step.durationMs >= 100 ? <DurationBadge ms={step.durationMs} /> : null}
            {isActive ? <Spinner className="w-4 h-4 text-[#F58634]" /> : null}
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && showBody && (
          <motion.div
            key={`body-${step.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pl-1 sm:pl-2 pt-2"
          >
            {showDetail ? (
              <p className="text-[15px] sm:text-[16px] text-slate-600 leading-7 text-left">
                {isActive ? <TypewriterText text={step.detail} speedMs={14} /> : step.detail}
              </p>
            ) : null}

            {hasBullets && (
              <ul className="mt-2.5 pl-6 list-disc space-y-1.5 text-[15px] sm:text-[16px] leading-7 text-slate-600 marker:text-slate-400 text-left">
                {displayBullets.map((bullet, bulletIndex) => (
                  <li key={`${step.id}-bullet-${bulletIndex}`}>{bullet}</li>
                ))}
                {isActive && (
                  <li className="list-none ml-[-20px] mt-1">
                    <PulsingDots />
                  </li>
                )}
              </ul>
            )}

            {metricEntries.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {metricEntries.map(([key, value]) => (
                  <span
                    key={`${step.id}-metric-${key}`}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] sm:text-[12px] text-slate-600"
                  >
                    {formatMetricLabel(key)}: {formatMetricValue(value)}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-slate-500 hover:text-slate-700 hover:border-gray-300 hover:bg-gray-100 transition-all group cursor-pointer"
    >
      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
      <span>Thought for <span className="font-medium text-gray-500">{s}s</span></span>
      <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-40 group-hover:opacity-70 transition-opacity" />
    </motion.button>
  );
}

function ThinkingCollapsedChip({ onExpand }: { onExpand: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onExpand}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFF7F1] border border-[#F58634]/30 text-[13px] text-[#C96B2C] hover:text-[#B25B22] hover:border-[#F58634]/45 hover:bg-[#FFF1E8] transition-all group cursor-pointer"
    >
      <Spinner className="w-3.5 h-3.5 text-[#F58634]" />
      <span className="font-medium">Thinking</span>
      <PulsingDots />
      <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-60 group-hover:opacity-90 transition-opacity" />
    </motion.button>
  );
}

// ─── Pulsing dots for "Thinking..." header ────────────────────────────────────

function PulsingDots() {
  return (
    <span className="inline-flex items-end gap-1 ml-1.5 mb-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-[4px] h-[4px] rounded-full bg-[#F58634]"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
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


function TypewriterText({
  text,
  className = '',
  speedMs = 22,
}: {
  text: string;
  className?: string;
  speedMs?: number;
}) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    let index = 0;
    setDisplayedText('');

    const timer = setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, speedMs);

    return () => clearInterval(timer);
  }, [text, speedMs]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        aria-hidden="true"
        className="ml-[1px] inline-block text-[#F58634]"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      >
        |
      </motion.span>
    </span>
  );
}
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
  /** Optional intent hint from routing layer (frontend or backend) */
  intentHint?: string;
  /** Optional actual steps from backend — used when available for real timing */
  backendSteps?: ThinkingStep[];
}

export default function ThinkingPanel({ isThinking, query, intentHint, backendSteps }: ThinkingPanelProps) {
  const intent = resolveIntent(query, intentHint);
  const baseStepDefs = STEP_LIBRARY[intent] ?? STEP_LIBRARY.property_search;
  const focusSummary = buildFocusSummary(extractQuerySignals(query));
  const stepDefs = baseStepDefs.map((step) => ({
    ...step,
    detail: enrichStepDetail(step, intent, focusSummary),
  }));

  const [liveSteps, setLiveSteps] = useState<LiveStep[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalMs, setTotalMs] = useState(0);

  const startTimeRef  = useRef<number>(0);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stepTimesRef  = useRef<number[]>([]);
  const activeStep = liveSteps.find((s) => s.status === 'active');
  const nonPendingSteps = liveSteps.filter((s) => s.status !== 'pending');
  const displayStep =
    isThinking
      ? (activeStep ?? nonPendingSteps[nonPendingSteps.length - 1] ?? liveSteps[0])
      : (nonPendingSteps[nonPendingSteps.length - 1] ?? liveSteps[liveSteps.length - 1]);
  const displayStepIndex = displayStep ? liveSteps.findIndex((s) => s.id === displayStep.id) : -1;
  const completedSteps = liveSteps.filter((s) => s.status !== 'pending');
  const activeThinkingText = activeStep?.title || activeStep?.label || 'Thinking';

  // If backend emits live thinking steps while still processing, prefer those over local simulation.
  useEffect(() => {
    if (!isThinking || !backendSteps || backendSteps.length === 0) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const mappedLiveSteps: LiveStep[] = backendSteps.map((bs, i) => {
      const fallback = stepDefs[i] ?? {
        id: bs.id || `step-${i + 1}`,
        label: bs.label || `Step ${i + 1}`,
        title: bs.title || bs.label || `Step ${i + 1}`,
        detail: '',
        bullets: [],
        source: bs.source || bs.agentName || bs.label || '',
        metrics: {},
        started_at: bs.started_at,
        ended_at: bs.ended_at,
        agentName: bs.agentName ?? '',
        delayMs: 0,
      };
      const resolvedStatus: StepStatus =
        bs.status === 'pending' || bs.status === 'active' || bs.status === 'done' || bs.status === 'error'
          ? bs.status
          : i === backendSteps.length - 1
            ? 'active'
            : 'done';
      return {
        ...fallback,
        id: bs.id || fallback.id,
        label: bs.label || fallback.label,
        title: bs.title || fallback.title || bs.label || fallback.label,
        detail: bs.detail || fallback.detail,
        bullets: Array.isArray(bs.bullets) && bs.bullets.length > 0 ? bs.bullets : fallback.bullets,
        source: bs.source || fallback.source,
        metrics: bs.metrics || fallback.metrics,
        started_at: bs.started_at || fallback.started_at,
        ended_at: bs.ended_at || fallback.ended_at,
        agentName: bs.agentName ?? fallback.agentName,
        durationMs: bs.durationMs,
        status: resolvedStatus,
      };
    });

    if (startTimeRef.current <= 0) {
      const startedTimes = mappedLiveSteps
        .map((step) => (step.started_at ? Date.parse(step.started_at) : NaN))
        .filter((ts) => Number.isFinite(ts) && ts > 0);
      startTimeRef.current = startedTimes.length > 0 ? Math.min(...startedTimes) : Date.now();
    }

    setLiveSteps(mappedLiveSteps);
  }, [isThinking, backendSteps, stepDefs]);

  // ── Reset and start animation when thinking begins ────────────────────────
  useEffect(() => {
    if (!isThinking) return;

    if (backendSteps && backendSteps.length > 0) {
      return;
    }

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

    let elapsed = 0;
    if (backendSteps && backendSteps.length > 0) {
      const sumDuration = backendSteps.reduce((acc, step) => {
        const value = typeof step.durationMs === 'number' && Number.isFinite(step.durationMs) ? step.durationMs : 0;
        return acc + Math.max(0, value);
      }, 0);
      if (sumDuration > 0) {
        elapsed = sumDuration;
      } else {
        const starts = backendSteps
          .map((step) => (step.started_at ? Date.parse(step.started_at) : NaN))
          .filter((ts) => Number.isFinite(ts) && ts > 0);
        const ends = backendSteps
          .map((step) => (step.ended_at ? Date.parse(step.ended_at) : NaN))
          .filter((ts) => Number.isFinite(ts) && ts > 0);
        if (starts.length > 0 && ends.length > 0) {
          elapsed = Math.max(0, Math.max(...ends) - Math.min(...starts));
        }
      }
    }
    if (elapsed <= 0 && startTimeRef.current > 0) {
      elapsed = Math.max(0, Date.now() - startTimeRef.current);
    }
    setTotalMs(elapsed);

    if (backendSteps && backendSteps.length > 0) {
      // Backend sent actual timing — use it for labels and durations
      const finalSteps = backendSteps.map((bs, i) => ({
        ...(stepDefs[i] ?? { id: bs.id, label: bs.label, title: bs.title || bs.label, detail: '', bullets: [], source: bs.source || bs.agentName || bs.label, metrics: {}, agentName: bs.agentName ?? '', delayMs: 0 }),
        id: bs.id || stepDefs[i]?.id || `step-${i + 1}`,
        label: bs.label || stepDefs[i]?.label || `Step ${i + 1}`,
        title: bs.title || stepDefs[i]?.title || bs.label || stepDefs[i]?.label || `Step ${i + 1}`,
        detail: bs.detail || stepDefs[i]?.detail || '',
        bullets: Array.isArray(bs.bullets) && bs.bullets.length > 0 ? bs.bullets : stepDefs[i]?.bullets,
        source: bs.source || stepDefs[i]?.source,
        metrics: bs.metrics || stepDefs[i]?.metrics,
        started_at: bs.started_at || stepDefs[i]?.started_at,
        ended_at: bs.ended_at || stepDefs[i]?.ended_at,
        agentName: bs.agentName ?? stepDefs[i]?.agentName ?? '',
        status: (bs.status === 'error' ? 'error' : 'done') as StepStatus,
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
    startTimeRef.current = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThinking]);

  // ── Don't render before first query ──────────────────────────────────────
  if (!isThinking && !isDone) return null;

  // ── Collapsed chip (after response) ──────────────────────────────────────
  if (!isExpanded) {
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
          {isThinking ? (
            <ThinkingCollapsedChip onExpand={() => setIsExpanded(true)} />
          ) : (
            <CollapsedChip totalMs={totalMs} onExpand={() => setIsExpanded(true)} />
          )}
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
      <div className="flex-1 min-w-0 max-w-3xl rounded-2xl border border-slate-200/90 bg-white/80 shadow-sm p-4 sm:p-5">

        {/* Header row */}
        <div className="flex items-center gap-2.5 mb-4">
          {isThinking ? (
            <button
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-2 text-[14px] text-slate-600 hover:text-slate-800 transition-colors group"
            >
              <TypewriterText
                text={activeThinkingText}
                className="text-[18px] sm:text-[19px] font-semibold text-slate-800 leading-tight group-hover:text-slate-900"
                speedMs={18}
              />
              <PulsingDots />
              <ChevronUp className="w-4 h-4 ml-0.5 opacity-50 group-hover:opacity-80 transition-opacity" />
            </button>
          ) : (
            <button
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-slate-700 transition-colors group"
            >
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
              <span>Thought for <span className="font-medium text-gray-500">{(totalMs / 1000).toFixed(1)}s</span></span>
              <ChevronUp className="w-4 h-4 ml-0.5 opacity-40 group-hover:opacity-70 transition-opacity" />
            </button>
          )}
        </div>

        {/* Streaming step view while thinking; full trace after completion */}
        {isThinking ? (
          displayStep ? (
            <div className="space-y-1.5">
              {liveSteps.length > 1 && displayStepIndex >= 0 && (
                <p className="text-[12px] text-slate-500 uppercase tracking-[0.14em] font-medium">
                  Step {displayStepIndex + 1} of {liveSteps.length}
                </p>
              )}
              <StepRow
                key={`${displayStep.id}-${displayStep.status}-${displayStep.durationMs ?? 0}`}
                step={displayStep}
                index={0}
              />
            </div>
          ) : null
        ) : (
          completedSteps.length > 0 ? (
            <div className="space-y-3">
              {completedSteps.map((step, idx) => (
                <StepRow
                  key={`${step.id}-${step.status}-${step.durationMs ?? 0}`}
                  step={step}
                  index={idx}
                />
              ))}
            </div>
          ) : null
        )}
      </div>
    </motion.div>
  );
}
