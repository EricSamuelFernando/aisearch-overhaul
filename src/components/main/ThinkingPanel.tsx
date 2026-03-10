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
        { id: 's1', label: 'Got it, finding homes for you', detail: 'Understanding what you\'re looking for.', agentName: 'Nova', delayMs: 800 },
        { id: 's2', label: 'Searching listings', detail: 'Scanning active listings in your area.', agentName: 'Home Finder', delayMs: 1400 },
        { id: 's3', label: 'Filtering by your preferences', detail: 'Applying your price, size, and location filters.', agentName: 'Home Finder', delayMs: 1800 },
        { id: 's4', label: 'Picking the best matches', detail: 'Choosing homes that best fit what you\'re after.', agentName: 'Home Finder', delayMs: 1600 },
        { id: 's5', label: 'Putting your results together', detail: 'Writing up a summary of the top homes for you.', agentName: 'Nova', delayMs: 0 },
    ],
    financial_analysis: [
        { id: 'f1', label: 'Got it, analysing your finances', detail: 'Understanding your financial scenario.', agentName: 'Nova', delayMs: 700 },
        { id: 'f2', label: 'Running cost projections', detail: 'Estimating monthly costs, down payment, and total spend.', agentName: 'Financial Advisor', delayMs: 1800 },
        { id: 'f3', label: 'Checking your affordability', detail: 'Seeing how this fits within your budget.', agentName: 'Financial Advisor', delayMs: 1500 },
        { id: 'f4', label: 'Comparing your options', detail: 'Laying out the trade-offs between different scenarios.', agentName: 'Financial Advisor', delayMs: 1400 },
        { id: 'f5', label: 'Preparing your financial summary', detail: 'Pulling together a clear picture of your options.', agentName: 'Nova', delayMs: 0 },
    ],
    school_search: [
        { id: 'sc1', label: 'Got it, looking into schools', detail: 'Understanding what kind of schools you need.', agentName: 'Nova', delayMs: 800 },
        { id: 'sc2', label: 'Finding schools in the area', detail: 'Locating schools in the district you asked about.', agentName: 'School Scout', delayMs: 1200 },
        { id: 'sc3', label: 'Checking ratings and programs', detail: 'Looking at test scores, STEM, sports, and other programs.', agentName: 'School Scout', delayMs: 2000 },
        { id: 'sc4', label: 'Ranking by best fit', detail: 'Sorting by the things that matter most for your family.', agentName: 'School Scout', delayMs: 1500 },
        { id: 'sc5', label: 'Preparing your school summary', detail: 'Writing up the best options for you.', agentName: 'Nova', delayMs: 0 },
    ],
    mortgage_calc: [
        { id: 'm1', label: 'Got it, running the numbers', detail: 'Understanding your mortgage question.', agentName: 'Nova', delayMs: 700 },
        { id: 'm2', label: 'Calculating your monthly payments', detail: 'Working out principal, interest, taxes, and insurance.', agentName: 'Mortgage Calculator', delayMs: 1800 },
        { id: 'm3', label: 'Checking current rate ranges', detail: 'Looking at what rates are available right now.', agentName: 'Mortgage Calculator', delayMs: 1200 },
        { id: 'm4', label: 'Preparing your breakdown', detail: 'Putting together a clear cost summary for you.', agentName: 'Nova', delayMs: 0 },
    ],
    rent_vs_buy: [
        { id: 'r1', label: 'Got it, comparing your options', detail: 'Understanding your rent vs buy question.', agentName: 'Nova', delayMs: 700 },
        { id: 'r2', label: 'Looking at the cost of buying', detail: 'Factoring in mortgage, taxes, maintenance, and equity.', agentName: 'Financial Advisor', delayMs: 1600 },
        { id: 'r3', label: 'Looking at the cost of renting', detail: 'Estimating rent, insurance, and opportunity cost.', agentName: 'Financial Advisor', delayMs: 1400 },
        { id: 'r4', label: 'Comparing both scenarios', detail: 'Running the numbers over 5, 10, and 30 years.', agentName: 'Financial Advisor', delayMs: 1600 },
        { id: 'r5', label: 'Writing your recommendation', detail: 'Summarising which option makes more sense for you.', agentName: 'Nova', delayMs: 0 },
    ],
    qa_advisory: [
        { id: 'q1', label: 'Got it, looking that up', detail: 'Understanding your real estate question.', agentName: 'Nova', delayMs: 700 },
        { id: 'q2', label: 'Looking that up for you', detail: 'Searching our real estate knowledge base.', agentName: 'Real Estate Advisor', delayMs: 1800 },
        { id: 'q3', label: 'Writing your answer', detail: 'Putting together a clear, helpful response.', agentName: 'Nova', delayMs: 0 },
    ],
    reference: [
        { id: 'ref1', label: 'Got it, finding that property', detail: 'Looking up the property you mentioned.', agentName: 'Nova', delayMs: 700 },
        { id: 'ref2', label: 'Pulling up the details', detail: 'Retrieving the listing info, photos, and key facts.', agentName: 'Home Finder', delayMs: 1600 },
        { id: 'ref3', label: 'Preparing a summary', detail: 'Putting together what you need to know.', agentName: 'Nova', delayMs: 0 },
    ],
    compare: [
        { id: 'c1', label: 'Got it, comparing those properties', detail: 'Identifying the properties you want to compare.', agentName: 'Nova', delayMs: 700 },
        { id: 'c2', label: 'Loading both properties', detail: 'Pulling up the full details for each listing.', agentName: 'Home Finder', delayMs: 1400 },
        { id: 'c3', label: 'Comparing features and value', detail: 'Looking at price, size, location, and condition.', agentName: 'Home Finder', delayMs: 1600 },
        { id: 'c4', label: 'Writing your comparison', detail: 'Putting together a side-by-side breakdown.', agentName: 'Nova', delayMs: 0 },
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
            className="rounded-2xl border border-slate-200/90 bg-white shadow-sm px-3 sm:px-5 py-3 sm:py-4 text-left overflow-hidden"
        >
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full text-left"
            >
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                        {step.source ? (
                            <div className="text-[12px] sm:text-[13px] text-slate-500">
                                {step.source}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <span className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${statusBadgeClass(isActive ? 'active' : step.status)}`}>
                            {statusLabel}
                        </span>
                        {step.durationMs !== undefined && step.durationMs >= 100 ? (
                            <span className="hidden sm:inline-flex">
                                <DurationBadge ms={step.durationMs} />
                            </span>
                        ) : null}
                        {!isActive && step.status === 'done' ? <Check className="w-3.5 h-3.5 text-emerald-500 sm:hidden" strokeWidth={2.5} /> : null}
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
                        className="pl-0.5 sm:pl-2 pt-2"
                    >
                        {showDetail ? (
                            <p className="text-[15px] sm:text-[16px] text-slate-600 leading-7 text-left break-words">
                                {isActive ? <TypewriterText text={step.detail} speedMs={14} /> : step.detail}
                            </p>
                        ) : null}

                        {hasBullets && (
                            <ul className="mt-2.5 pl-4 sm:pl-6 list-disc space-y-1.5 text-[15px] sm:text-[16px] leading-7 text-slate-600 marker:text-slate-400 text-left">
                                {displayBullets.map((bullet, bulletIndex) => (
                                    <li key={`${step.id}-bullet-${bulletIndex}`}>{bullet}</li>
                                ))}
                                {isActive && (
                                    <li className="list-none mt-1">
                                        <PulsingDots />
                                    </li>
                                )}
                            </ul>
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
    const safeMs = Math.max(800, totalMs);
    const s = (safeMs / 1000).toFixed(1);
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

function coerceDurationMs(value: unknown): number | undefined {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return undefined;

    // Guard against epoch timestamps accidentally sent as durations.
    if (numeric > 1e11) return undefined;

    // Backend may send second-based durations for short steps.
    if (numeric < 1000 && numeric <= 300) return numeric * 1000;

    // Ignore implausibly large single-step durations.
    if (numeric > 60 * 60 * 1000) return undefined;

    return numeric;
}

function parseTimestampToMs(value?: string): number | undefined {
    if (!value) return undefined;

    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
        // Epoch seconds.
        if (numeric >= 1e9 && numeric < 1e11) return numeric * 1000;
        // Epoch milliseconds.
        if (numeric >= 1e11) return numeric;
    }

    const parsed = Date.parse(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
interface ThinkingPanelProps {
    isThinking: boolean;
    query: string;
    /** Optional intent hint from routing layer (frontend or backend) */
    intentHint?: string;
    /** Optional actual steps from backend — used when available for real timing */
    backendSteps?: ThinkingStep[];
    /** Optional fallback elapsed time when backend emits no steps */
    forceDoneMs?: number;
    /** Render inside an existing assistant bubble instead of standalone row */
    embedded?: boolean;
}

export default function ThinkingPanel({ isThinking, query, intentHint, backendSteps, forceDoneMs, embedded = false }: ThinkingPanelProps) {
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

    const startTimeRef = useRef<number>(0);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const stepTimesRef = useRef<number[]>([]);
    const activeStep = liveSteps.find((s) => s.status === 'active');
    const nonPendingSteps = liveSteps.filter((s) => s.status !== 'pending');
    const displayStep =
        isThinking
            ? (activeStep ?? nonPendingSteps[nonPendingSteps.length - 1] ?? liveSteps[0])
            : (nonPendingSteps[nonPendingSteps.length - 1] ?? liveSteps[liveSteps.length - 1]);
    const displayStepIndex = displayStep ? liveSteps.findIndex((s) => s.id === displayStep.id) : -1;
    const completedSteps = liveSteps.filter((s) => s.status !== 'pending');
    const fallbackCompletedSteps: LiveStep[] =
        completedSteps.length > 0
            ? completedSteps
            : stepDefs.slice(0, Math.min(2, stepDefs.length)).map((step) => ({
                ...step,
                status: 'done' as StepStatus,
                durationMs:
                    typeof forceDoneMs === 'number' && forceDoneMs > 0
                        ? Math.max(400, Math.floor(forceDoneMs / Math.max(1, Math.min(2, stepDefs.length))))
                        : 800,
            }));
    const activeThinkingText = activeStep?.title || activeStep?.label || 'Thinking';
    const expandPanel = () => {
        setIsDone(true);
        setIsExpanded(true);
    };

    // If backend emits live thinking steps while still processing, prefer those over local simulation.
    useEffect(() => {
        if (!isThinking || !backendSteps || backendSteps.length === 0) return;

        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        const mappedLiveSteps: LiveStep[] = backendSteps.map((bs, i) => {
            const resolvedStatus: StepStatus =
                bs.status === 'pending' || bs.status === 'active' || bs.status === 'done' || bs.status === 'error'
                    ? bs.status
                    : i === backendSteps.length - 1
                        ? 'active'
                        : 'done';
            return {
                id: bs.id || `step-${i + 1}`,
                label: bs.title || bs.label || `Step ${i + 1}`,
                title: bs.title || bs.label || `Step ${i + 1}`,
                detail: bs.detail || '',
                bullets: Array.isArray(bs.bullets) && bs.bullets.length > 0 ? bs.bullets : [],
                source: bs.source || bs.agentName || '',
                metrics: bs.metrics || {},
                started_at: bs.started_at,
                ended_at: bs.ended_at,
                agentName: bs.agentName || bs.source || '',
                durationMs: coerceDurationMs(bs.durationMs),
                status: resolvedStatus,
                delayMs: 0,
            };
        });

        if (startTimeRef.current <= 0) {
            const startedTimes = mappedLiveSteps
                .map((step) => parseTimestampToMs(step.started_at))
                .filter((ts): ts is number => typeof ts === 'number');
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
        if (isThinking) return;
        // Allow continuing even when liveSteps is empty — backendSteps may have arrived
        // on a fresh mount (standalone panel unmounted → embedded panel remounted).
        if (liveSteps.length === 0 && (!backendSteps || backendSteps.length === 0)) return;

        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        let elapsed = 0;
        if (backendSteps && backendSteps.length > 0) {
            const sumDuration = backendSteps.reduce((acc, step) => {
                const value = coerceDurationMs(step.durationMs) ?? 0;
                return acc + Math.max(0, value);
            }, 0);
            if (sumDuration > 0) {
                elapsed = sumDuration;
            } else {
                const starts = backendSteps
                    .map((step) => parseTimestampToMs(step.started_at))
                    .filter((ts): ts is number => typeof ts === 'number');
                const ends = backendSteps
                    .map((step) => parseTimestampToMs(step.ended_at))
                    .filter((ts): ts is number => typeof ts === 'number');
                if (starts.length > 0 && ends.length > 0) {
                    elapsed = Math.max(0, Math.max(...ends) - Math.min(...starts));
                }
            }
        }
        if (elapsed <= 0 && startTimeRef.current > 0) {
            elapsed = Math.max(0, Date.now() - startTimeRef.current);
        }
        const fallbackMs = typeof forceDoneMs === 'number' && forceDoneMs > 0 ? forceDoneMs : 1200;
        setTotalMs(elapsed > 0 ? elapsed : fallbackMs);

        if (backendSteps && backendSteps.length > 0) {
            // Backend sent actual steps — use them directly, no STEP_LIBRARY fallback
            const finalSteps: LiveStep[] = backendSteps.map((bs, i) => ({
                id: bs.id || `step-${i + 1}`,
                label: bs.title || bs.label || `Step ${i + 1}`,
                title: bs.title || bs.label || `Step ${i + 1}`,
                detail: bs.detail || '',
                bullets: Array.isArray(bs.bullets) && bs.bullets.length > 0 ? bs.bullets : [],
                source: bs.source || bs.agentName || '',
                metrics: bs.metrics || {},
                started_at: bs.started_at,
                ended_at: bs.ended_at,
                agentName: bs.agentName || bs.source || '',
                status: (bs.status === 'error' ? 'error' : 'done') as StepStatus,
                durationMs: coerceDurationMs(bs.durationMs),
                delayMs: 0,
            }));
            setLiveSteps(finalSteps);
        } else {
            // Preserve durations for already-done steps; only compute duration for the last active step.
            // If prev is empty (fresh embedded mount with no backend steps), leave liveSteps empty
            // — the forceDoneMs fallback effect will populate from STEP_LIBRARY instead.
            const now = Date.now();
            setLiveSteps((prev) => {
                if (prev.length === 0) return prev;
                return prev.map((s, i) => {
                    if (s.status === 'done') return s; // keep exact duration already recorded
                    return {
                        ...s,
                        status: 'done' as StepStatus,
                        durationMs: stepTimesRef.current[i] !== undefined
                            ? now - stepTimesRef.current[i]
                            : undefined,
                    };
                });
            });
        }

        setIsDone(true);
        startTimeRef.current = 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isThinking, backendSteps]);
    // If backend omitted steps, still show a post-answer "Thought for Xs" + expandable trace.
    useEffect(() => {
        if (isThinking) return;
        if (backendSteps && backendSteps.length > 0) return;
        if (typeof forceDoneMs !== 'number' || forceDoneMs <= 0) return;

        setTotalMs(forceDoneMs);
        setLiveSteps((prev) => {
            if (prev.length > 0) {
                return prev.map((step) => ({ ...step, status: 'done' as StepStatus }));
            }
            return stepDefs.map((step) => ({ ...step, status: 'done' as StepStatus }));
        });
        setIsDone(true);
    }, [isThinking, backendSteps, forceDoneMs, stepDefs]);

    // ── Don't render before first query ──────────────────────────────────────
    if (!isThinking && !isDone) {
        if (embedded) {
            const fallbackMs = typeof forceDoneMs === 'number' && forceDoneMs > 0 ? forceDoneMs : 1200;
            return (
                <div className="mb-3 flex items-start justify-start w-full self-start pointer-events-auto">
                    <CollapsedChip totalMs={fallbackMs} onExpand={expandPanel} />
                </div>
            );
        }
        return null;
    }

    // ── Collapsed chip (after response) ──────────────────────────────────────
    if (!isExpanded) {
        const collapsedChip = isThinking
            ? <ThinkingCollapsedChip onExpand={expandPanel} />
            : <CollapsedChip totalMs={totalMs} onExpand={expandPanel} />;

        if (embedded) {
            return <div className="mb-3 flex items-start justify-start w-full self-start pointer-events-auto">{collapsedChip}</div>;
        }

        return (
            <div className="flex items-start gap-4 mt-6 ml-1">
                <div className="flex-shrink-0 w-[45px] h-[45.18px] flex items-center justify-center">
                    <Image
                        src="/assets/images/Group14455(1).svg"
                        alt="Snaphomz AI"
                        width={45}
                        height={45}
                        className="w-[45px] h-[45.18px] object-contain"
                    />
                </div>
                <div className="pt-2.5">
                    {collapsedChip}
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
            className={embedded ? 'w-full mb-3 overflow-hidden' : 'flex items-start gap-4 mt-6 ml-1'}
        >
            {/* SnapHomz avatar */}
            {!embedded && (
                <div className="flex-shrink-0 w-[45px] h-[45.18px] flex items-center justify-center">
                    <Image
                        src="/assets/images/Group14455(1).svg"
                        alt="Snaphomz AI"
                        width={45}
                        height={45}
                        className="w-[45px] h-[45.18px] object-contain"
                    />
                </div>
            )}

            {/* Panel body */}
            <div className={`flex-1 min-w-0 overflow-hidden shadow-sm ${embedded ? 'w-full max-w-none rounded-xl border border-slate-200/90 bg-white p-3 sm:p-5' : 'max-w-3xl rounded-2xl border border-slate-200/90 bg-white/80 p-4 sm:p-5'}`}>

                {/* Header row */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    {isThinking ? (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="inline-flex items-center gap-2 text-[14px] text-slate-600 hover:text-slate-800 transition-colors group"
                        >
                            <span className="text-[18px] sm:text-[19px] font-semibold text-slate-800 leading-tight group-hover:text-slate-900">Working on it</span>
                            <PulsingDots />
                            <ChevronUp className="w-4 h-4 ml-0.5 opacity-50 group-hover:opacity-80 transition-opacity" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-slate-700 transition-colors group"
                        >
                            <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                            <span>Thought for <span className="font-medium text-gray-500">{(Math.max(800, totalMs > 0 ? totalMs : (typeof forceDoneMs === 'number' && forceDoneMs > 0 ? forceDoneMs : 0)) / 1000).toFixed(1)}s</span></span>
                            <ChevronUp className="w-4 h-4 ml-0.5 opacity-40 group-hover:opacity-70 transition-opacity" />
                        </button>
                    )}
                </div>

                {/* Streaming step view while thinking; full trace after completion */}
                {isThinking ? (
                    nonPendingSteps.length > 0 ? (
                        <div className="space-y-1.5">
                            {liveSteps.length > 1 && displayStepIndex >= 0 && (
                                <p className="text-[12px] text-slate-500 uppercase tracking-[0.14em] font-medium">
                                    Step {displayStepIndex + 1} of {liveSteps.length}
                                </p>
                            )}
                            {nonPendingSteps.map((step, idx) => (
                                <StepRow
                                    key={`${step.id}-${step.status}-${step.durationMs ?? 0}`}
                                    step={step}
                                    index={idx}
                                />
                            ))}
                        </div>
                    ) : null
                ) : (
                    fallbackCompletedSteps.length > 0 ? (
                        <div className="space-y-3">
                            {fallbackCompletedSteps.map((step, idx) => (
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