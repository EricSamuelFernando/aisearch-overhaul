'use client';

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface School {
  name: string;
  rating: string;
  distance: string;
  type?: string;
}

interface ProjectionSignals {
  subjectPpsf: number;
  compPpsfAvg: number;
  daysOnMarket: number | null;
}

interface NeighborhoodCategory {
  label: string;
  icon: string;
  count: number;
  topNames: string[];
}

export interface BuyerDecisionSignalsProps {
  listPrice?: number;
  hoaMonthly?: number;
  taxPercent?: number;
  estimatedMonthlyPayment?: number | null;
  schools?: School[];
  projectionSignals?: ProjectionSignals;
  lat?: number | null;
  lng?: number | null;
  comps?: any[];
  sqft?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcMonthlyPI(principal: number, annualRatePct = 6.8, termYears = 30): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function parseRating(ratingStr: string): number | null {
  if (!ratingStr || ratingStr === 'N/A') return null;
  const m = ratingStr.match(/^(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function ratingStroke(r: number | null) {
  if (r === null) return '#4b5563';
  if (r >= 8) return '#34d399';
  if (r >= 6) return '#a3e635';
  if (r >= 4) return '#fbbf24';
  return '#f87171';
}

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

// ─── Shared card shell ────────────────────────────────────────────────────────

function Card({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: 210,
        minHeight: 220,
        background: '#FFFFFF',
        border: '1px solid #EDE0D0',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}
    >
      {/* Orange top edge */}
      <div className="h-[3px] w-full" style={{ background: '#E8804C' }} />

      <div className="flex flex-col flex-1 p-4">
        {/* Category label */}
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#B07A50' }}>
          {label}
        </p>

        {/* Content slot */}
        <div className="flex-1">{children}</div>

        {/* Icon circle — bottom right */}
        <div className="flex justify-end mt-3">
          <div
            className="h-11 w-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(232,128,76,0.10)', border: '1px solid rgba(232,128,76,0.25)' }}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG icons (lightweight inline) ──────────────────────────────────────────

const IconCalc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8804C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="10" y2="10" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
    <line x1="14" y1="14" x2="16" y2="14" />
    <line x1="8" y1="18" x2="16" y2="18" />
  </svg>
);

const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8804C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconGrad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8804C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconMap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8804C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s-8-6.686-8-12a8 8 0 0 1 16 0c0 5.314-8 12-8 12z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Card 1: Affordability ────────────────────────────────────────────────────

function AffordabilityCard({
  listPrice, hoaMonthly, taxPercent, estimatedMonthlyPayment,
}: Pick<BuyerDecisionSignalsProps, 'listPrice' | 'hoaMonthly' | 'taxPercent' | 'estimatedMonthlyPayment'>) {
  if (!listPrice) {
    return (
      <Card label="Monthly Cost" icon={<IconCalc />}>
        <p className="text-sm" style={{ color: '#9A8878' }}>No price data</p>
      </Card>
    );
  }

  const pi = Math.round(estimatedMonthlyPayment ?? calcMonthlyPI(listPrice * 0.8));
  const tax = Math.round((listPrice * (taxPercent ?? 1.25)) / 100 / 12);
  const hoa = hoaMonthly ?? 0;
  const ins = Math.round((listPrice * 0.0055) / 12);
  const total = pi + tax + hoa + ins;

  const tidbit = hoa > 0
    ? `About $${fmt(pi)} goes toward the mortgage, $${fmt(tax)} in taxes, and $${fmt(hoa)} for HOA each month.`
    : `About $${fmt(pi)} goes toward the mortgage itself — taxes and insurance add roughly $${fmt(tax + ins)}/mo on top.`;

  return (
    <Card label="Monthly Cost" icon={<IconCalc />}>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-[26px] font-bold leading-none" style={{ color: '#1A1512' }}>
          ${fmt(total)}
        </span>
        <span className="text-xs" style={{ color: '#9A8878' }}>/mo</span>
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: '#5A4A3A' }}>{tidbit}</p>
      <p className="mt-2 text-[9px]" style={{ color: '#B0A090' }}>Estimate: 20% down · 30yr · 6.8%</p>
    </Card>
  );
}

// ─── Card 2: Market Position ──────────────────────────────────────────────────

function MarketPositionCard({ projectionSignals }: Pick<BuyerDecisionSignalsProps, 'projectionSignals'>) {
  const { subjectPpsf = 0, compPpsfAvg = 0, daysOnMarket } = projectionSignals ?? {};
  const hasData = subjectPpsf > 0 && compPpsfAvg > 0;
  const deltaPct = hasData ? ((subjectPpsf - compPpsfAvg) / compPpsfAvg) * 100 : 0;
  const absDelta = Math.abs(deltaPct).toFixed(1);

  const signal =
    !hasData
      ? { label: 'Loading…', color: '#9A8878' }
      : deltaPct < -5
      ? { label: `${absDelta}% Below Market`, color: '#16a34a' }
      : deltaPct > 5
      ? { label: `${absDelta}% Above Market`, color: '#dc2626' }
      : { label: 'Fair Value', color: '#d97706' };

  const tidbit = !hasData
    ? null
    : deltaPct < -5
    ? `At $${Math.round(subjectPpsf)}/sqft, this home is priced ${absDelta}% below the area median of $${Math.round(compPpsfAvg)}/sqft — potentially good value.`
    : deltaPct > 5
    ? `At $${Math.round(subjectPpsf)}/sqft, the ask is ${absDelta}% above nearby comps averaging $${Math.round(compPpsfAvg)}/sqft. Worth checking recent sales.`
    : `At $${Math.round(subjectPpsf)}/sqft, this is right in line with the area median of $${Math.round(compPpsfAvg)}/sqft.`;

  const domNote = daysOnMarket !== null && daysOnMarket !== undefined
    ? daysOnMarket === 0 ? ' Listed today.' : ` On the market ${daysOnMarket} day${daysOnMarket === 1 ? '' : 's'}.`
    : '';

  const barWidth = hasData ? Math.min(95, Math.max(5, 50 + deltaPct * 3)) : 50;

  return (
    <Card label="Market Position" icon={<IconChart />}>
      <p className="text-[12px] font-semibold mb-2" style={{ color: signal.color }}>
        {signal.label}
      </p>
      {tidbit && (
        <>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: '#5A4A3A' }}>
            {tidbit}{domNote}
          </p>
          <div className="h-1 w-full rounded-full" style={{ background: '#EDE0D0' }}>
            <div
              className="h-1 rounded-full transition-all duration-700"
              style={{ width: `${barWidth}%`, background: signal.color }}
            />
          </div>
        </>
      )}
    </Card>
  );
}

// ─── Card 3: Schools ──────────────────────────────────────────────────────────

function SchoolsCard({ schools }: Pick<BuyerDecisionSignalsProps, 'schools'>) {
  const top3 = (schools ?? []).slice(0, 3);

  // Build a headline tidbit from the top school
  let tidbit: string | null = null;
  if (top3.length > 0) {
    const topSchool = top3[0];
    const r = parseRating(topSchool.rating);
    const highRated = top3.filter((s) => { const n = parseRating(s.rating); return n !== null && n >= 7; });
    if (highRated.length >= 2) {
      tidbit = `${highRated.length} highly-rated schools nearby, including ${highRated[0].name.split(' ').slice(0, 3).join(' ')}.`;
    } else if (r !== null && r >= 7) {
      tidbit = `${topSchool.name.split(' ').slice(0, 3).join(' ')} (${r}/10) is the top-rated school, just ${topSchool.distance} away.`;
    } else {
      tidbit = `${top3.length} school${top3.length > 1 ? 's' : ''} within the area, closest at ${top3[0].distance}.`;
    }
  }

  return (
    <Card label="Schools Nearby" icon={<IconGrad />}>
      {top3.length === 0 ? (
        <p className="text-sm" style={{ color: '#9A8878' }}>Loading…</p>
      ) : (
        <>
          {tidbit && (
            <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: '#5A4A3A' }}>{tidbit}</p>
          )}
          <div className="space-y-2">
            {top3.map((school, i) => {
              const r = parseRating(school.rating);
              const stroke = ratingStroke(r);
              const circ = 2 * Math.PI * 8;
              const offset = r !== null ? circ - (r / 10) * circ : circ;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative h-6 w-6 flex-shrink-0">
                    <svg viewBox="0 0 20 20" className="h-6 w-6 -rotate-90">
                      <circle cx="10" cy="10" r="8" fill="none" stroke="#EDE0D0" strokeWidth="2.5" />
                      <circle cx="10" cy="10" r="8" fill="none" stroke={stroke} strokeWidth="2.5"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold" style={{ color: '#3D2B1A' }}>
                      {r ?? '–'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium truncate" style={{ color: '#1A1512' }}>{school.name}</p>
                    <p className="text-[9px]" style={{ color: '#9A8878' }}>{school.distance}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <button
        className="mt-2 text-[10px] font-medium hover:opacity-70 transition-opacity text-left"
        style={{ color: '#E8804C' }}
        onClick={() => window.dispatchEvent(new CustomEvent('preview-nav', { detail: '#schools' }))}
      >
        View all ↓
      </button>
    </Card>
  );
}

// ─── Card 4: Neighborhood ─────────────────────────────────────────────────────

const ICONS: Record<string, string> = { dining: '🍽️', grocery: '🛒', parks: '🌳', transit: '🚌' };

function NeighborhoodCard({ lat, lng }: Pick<BuyerDecisionSignalsProps, 'lat' | 'lng'>) {
  const [summary, setSummary] = React.useState<Record<string, NeighborhoodCategory> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const fetchedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!lat || !lng) return;
    const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;
    setLoading(true);
    fetch('/api/neighborhood-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    })
      .then((r) => r.json())
      .then((d) => setSummary(d?.summary ?? null))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return (
    <Card label="Neighborhood" icon={<IconMap />}>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 rounded animate-pulse" style={{ background: '#EDE0D0' }} />
          ))}
        </div>
      ) : !summary ? (
        <p className="text-[11px]" style={{ color: '#9A8878' }}>
          {lat && lng ? 'Unavailable' : 'No location'}
        </p>
      ) : (
        <>
          {(() => {
            const d = summary.dining;
            const g = summary.grocery;
            const p = summary.parks;
            const t = summary.transit;
            const parts: string[] = [];
            if (d?.count > 0) parts.push(`${d.count} dining spot${d.count > 1 ? 's' : ''}${d.topNames[0] ? ` — try ${d.topNames[0].split(' ').slice(0,3).join(' ')}` : ''}`);
            if (g?.count > 0) parts.push(`${g.count} grocer${g.count > 1 ? 'ies' : 'y'} nearby`);
            if (p?.count > 0) parts.push(`${p.count} park${p.count > 1 ? 's' : ''} within a mile`);
            if (t?.count > 0) parts.push(`${t.count} transit stop${t.count > 1 ? 's' : ''} close by`);
            const sentence = parts.length > 0
              ? parts.join('. ') + '.'
              : 'Limited amenities data for this area.';
            return (
              <p className="text-[11px] leading-relaxed" style={{ color: '#5A4A3A' }}>{sentence}</p>
            );
          })()}
        </>
      )}
      <p className="mt-2 text-[9px]" style={{ color: '#B0A090' }}>Within 1 mile · Google Places</p>
    </Card>
  );
}

// ─── Card 5: Neighborhood Comps ───────────────────────────────────────────────

const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8804C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="14" width="4" height="8" rx="1" />
    <rect x="9" y="9" width="4" height="13" rx="1" />
    <rect x="16" y="4" width="4" height="18" rx="1" />
  </svg>
);

function relativeDate(dateStr: string): string {
  try {
    const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
    if (diffDays < 1) return 'today';
    if (diffDays <= 30) return `${diffDays}d ago`;
    if (diffDays <= 365) return `${Math.round(diffDays / 30)}mo ago`;
    return `${Math.round(diffDays / 365)}yr ago`;
  } catch {
    return '';
  }
}

function NeighborhoodCompsCard({ comps, sqft }: Pick<BuyerDecisionSignalsProps, 'comps' | 'sqft'>) {
  const raw = comps ?? [];

  if (raw.length === 0) {
    return (
      <Card label="Sold Nearby" icon={<IconBarChart />}>
        <p className="text-[11px]" style={{ color: '#9A8878' }}>No recent sales data.</p>
      </Card>
    );
  }

  // Filter to similar sqft (±30%), sort newest first, take top 3
  const filtered = raw
    .filter((c: any) => {
      const listing = c?.listing || c;
      const cSqft = listing?.property?.livingArea || listing?.property?.livingSquareFeet || 0;
      if (!sqft || !cSqft) return true;
      return cSqft >= sqft * 0.7 && cSqft <= sqft * 1.3;
    })
    .sort((a: any, b: any) => {
      const aDate = (a?.listing || a)?.closeDate || a?.modificationTimestamp || '';
      const bDate = (b?.listing || b)?.closeDate || b?.modificationTimestamp || '';
      return bDate.localeCompare(aDate);
    })
    .slice(0, 3);

  if (filtered.length === 0) {
    return (
      <Card label="Sold Nearby" icon={<IconBarChart />}>
        <p className="text-[11px]" style={{ color: '#9A8878' }}>No similar recent sales found.</p>
      </Card>
    );
  }

  const ppsfValues = filtered
    .map((c: any) => {
      const listing = c?.listing || c;
      const price = listing?.closePrice || listing?.listPriceLow || listing?.listPrice || 0;
      const cSqft = listing?.property?.livingArea || listing?.property?.livingSquareFeet || 0;
      return price > 0 && cSqft > 0 ? Math.round(price / cSqft) : 0;
    })
    .filter(Boolean) as number[];

  const avgPpsf = ppsfValues.length > 0
    ? Math.round(ppsfValues.reduce((a, b) => a + b, 0) / ppsfValues.length)
    : 0;

  const tidbit = filtered.length === 1
    ? `1 similar home sold nearby${avgPpsf > 0 ? ` at $${fmt(avgPpsf)}/sqft` : ''}.`
    : `${filtered.length} similar homes sold nearby${avgPpsf > 0 ? `, avg $${fmt(avgPpsf)}/sqft` : ''}.`;

  return (
    <Card label="Sold Nearby" icon={<IconBarChart />}>
      <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: '#5A4A3A' }}>{tidbit}</p>
      <div className="space-y-2">
        {filtered.map((c: any, i: number) => {
          const listing = c?.listing || c;
          const price = listing?.closePrice || listing?.listPriceLow || listing?.listPrice || 0;
          const addr = listing?.address;
          const street = addr
            ? `${addr.streetNumber || ''} ${addr.streetName || ''}`.trim()
            : 'Nearby home';
          const cSqft = listing?.property?.livingArea || listing?.property?.livingSquareFeet || 0;
          const beds = listing?.property?.bedroomsTotal || 0;
          const baths = listing?.property?.bathroomsTotal || 0;
          const dateStr = listing?.closeDate || listing?.modificationTimestamp || '';
          const rel = dateStr ? relativeDate(dateStr) : '';

          return (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-[12px] font-semibold" style={{ color: '#1A1512' }}>
                  {price > 0 ? `$${fmt(price)}` : street}
                </span>
                {rel && (
                  <span className="text-[9px] flex-shrink-0" style={{ color: '#9A8878' }}>{rel}</span>
                )}
              </div>
              <span className="text-[9px] leading-snug" style={{ color: '#7A6A5A' }}>
                {price > 0 && street ? `${street} · ` : ''}
                {beds > 0 ? `${beds}bd ` : ''}
                {baths > 0 ? `${baths}ba` : ''}
                {cSqft > 0 ? ` · ${fmt(cSqft)} sqft` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function BuyerDecisionSignals(props: BuyerDecisionSignalsProps) {
  return (
    <div className="col-span-12 mt-6">
      <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: '#7A6A5A' }}>
        Decision Signals
      </p>
      {/* Horizontal scroll — peeks next card */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.decision-signals-row::-webkit-scrollbar { display: none; }`}</style>
        <AffordabilityCard
          listPrice={props.listPrice}
          hoaMonthly={props.hoaMonthly}
          taxPercent={props.taxPercent}
          estimatedMonthlyPayment={props.estimatedMonthlyPayment}
        />
        <MarketPositionCard projectionSignals={props.projectionSignals} />
        <SchoolsCard schools={props.schools} />
        <NeighborhoodCard lat={props.lat} lng={props.lng} />
        <NeighborhoodCompsCard comps={props.comps} sqft={props.sqft} />
        {/* Trailing spacer so last card doesn't sit flush against edge */}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
}
