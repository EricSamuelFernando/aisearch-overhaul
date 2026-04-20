/**
 * intelligence.ts — Buyer Intelligence Module
 *
 * Pure computation layer. No I/O, no side effects.
 * All functions are stateless and independently testable.
 *
 * Extensibility: to add a new intelligence signal (e.g. neighbourhood affinity,
 * school-district preference, price-negotiation pattern), add:
 *   1. A field to BuyerProfile + schema.ts
 *   2. A computation here (updateProfileIntelligence)
 *   3. A line in buildIntelligenceBlock
 * Nothing in route.ts or claude.ts needs to change.
 */

import { BuyerProfile, MLSSearchParams, VisualContext } from "@/types/ai-assistant";

// ── Visual label extraction ──────────────────────────────────────────────────

/**
 * Derive a short human-readable label from a visual search for storage in
 * visualPreferences. Uses the first description_keyword (already clean + normalized)
 * and falls back to the first 45 chars of visual_query if no keywords provided.
 * This label becomes the map key in BuyerProfile.visualPreferences.
 */
export function extractVisualLabel(visualQuery: string, descKeywords: string[] = []): string {
  if (descKeywords.length > 0) {
    // First keyword is always the primary term e.g. "hardwood floors", "blue kitchen"
    return descKeywords[0].trim().toLowerCase();
  }
  // Fallback: trim visual_query to a readable length, drop trailing punctuation
  return visualQuery.slice(0, 45).replace(/[,\s]+$/, "").toLowerCase();
}

// ── MLS feature extraction ───────────────────────────────────────────────────

/** Extract named feature flags from raw search params for frequency tracking. */
export function extractFeatures(params: MLSSearchParams): string[] {
  const features: string[] = [];
  if (params.has_pool)                              features.push("pool");
  if (params.has_basement)                          features.push("basement");
  if (params.is_water_front)                        features.push("waterfront");
  if (params.is_water_view)                         features.push("water view");
  if (params.is_mountain_view)                      features.push("mountain view");
  if (params.is_city_view)                          features.push("city view");
  if (params.is_park_view)                          features.push("park view");
  if (params.stories === 1)                         features.push("single story");
  if (params.listing_association_fee_max === 0)     features.push("no HOA");
  if (params.lot_size_min && params.lot_size_min >= 21780) features.push("large lot");
  if (params.year_built_min && params.year_built_min >= 2015) features.push("newer construction");
  if (params.living_area_min && params.living_area_min >= 3000) features.push("large sq ft");
  return features;
}

// ── Math helpers ─────────────────────────────────────────────────────────────

// Cap the effective window so early low-budget searches don't permanently drag down the average.
const INTELLIGENCE_WINDOW = 10;

/**
 * Windowed running average — weight is capped at INTELLIGENCE_WINDOW so old
 * searches don't permanently drag down the result.
 * count = the NEW total count (after including this value).
 */
export function runningAvg(
  current: number | null,
  newValue: number,
  count: number,
): number {
  if (current === null || count <= 1) return newValue;
  const w = Math.min(count, INTELLIGENCE_WINDOW);
  return (current * (w - 1) + newValue) / w;
}

// ── Intelligence update ──────────────────────────────────────────────────────

/**
 * Compute the intelligence fields to merge into BuyerProfile after a search.
 * Returns only the fields that changed — caller merges with spread.
 * Pure function: takes current profile + new search event, returns delta.
 * visualContext is optional — only present on visual/aesthetic queries.
 */
export function updateProfileIntelligence(
  current: BuyerProfile,
  params: MLSSearchParams,
  _resultCount: number,
  visualContext?: VisualContext,
): Partial<BuyerProfile> {
  const newCount = current.searchCount + 1;

  // topCities — frequency map keyed by "City,ST"
  const locationKey = [params.city, params.state].filter(Boolean).join(",");
  const topCities = { ...current.topCities };
  if (locationKey) {
    topCities[locationKey] = (topCities[locationKey] ?? 0) + 1;
  }

  // Running averages — only update when the search actually specified the param
  const avgBudgetMax =
    params.listing_price_max != null
      ? runningAvg(current.avgBudgetMax, params.listing_price_max, newCount)
      : current.avgBudgetMax;

  const avgBudgetMin =
    params.listing_price_min != null
      ? runningAvg(current.avgBudgetMin, params.listing_price_min, newCount)
      : current.avgBudgetMin;

  const avgBedroomsMin =
    params.bedrooms_min != null
      ? runningAvg(current.avgBedroomsMin, params.bedrooms_min, newCount)
      : current.avgBedroomsMin;

  // featureFrequency — MLS filter flags used in this search (pool, waterfront, etc.)
  const featureFrequency = { ...current.featureFrequency };
  for (const feature of extractFeatures(params)) {
    featureFrequency[feature] = (featureFrequency[feature] ?? 0) + 1;
  }

  // visualPreferences — aesthetic/visual features from visual_query searches
  // Only incremented when a visual_query was actually set by Haiku
  const visualPreferences = { ...current.visualPreferences };
  if (visualContext?.visualQuery) {
    const label = extractVisualLabel(
      visualContext.visualQuery,
      visualContext.descKeywords ?? [],
    );
    visualPreferences[label] = (visualPreferences[label] ?? 0) + 1;
  }

  return {
    topCities,
    avgBudgetMax,
    avgBudgetMin,
    avgBedroomsMin,
    featureFrequency,
    visualPreferences,
    searchCount: newCount,
    lastActiveAt: new Date().toISOString(),
  };
}

// ── Haiku context block ──────────────────────────────────────────────────────

/**
 * Build the intelligence block injected into Haiku's INTENT_SYSTEM_PROMPT.
 * Returns empty string for brand-new users (session 1) so there's no noise.
 * Called on the hot path — must be synchronous and fast.
 */
export function buildIntelligenceBlock(profile: BuyerProfile): string {
  const hasBehavioral = profile.searchCount > 0;
  const hasVisual = Object.keys(profile.visualPreferences ?? {}).length > 0;
  const hasStated =
    profile.preferredLocations.length > 0 ||
    profile.budgetMax != null ||
    profile.budgetMin != null ||
    profile.bedroomsMin != null ||
    profile.bathroomsMin != null ||
    profile.mustHaves.length > 0 ||
    profile.dealBreakers.length > 0 ||
    profile.propertyTypes.length > 0;

  if (!hasBehavioral && !hasStated && !hasVisual) return "";

  const lines: string[] = ["\n## Buyer Intelligence — apply as search defaults"];

  if (hasBehavioral) {
    lines.push(`Derived from ${profile.searchCount} actual search(es):`);

    // Show only the single top city — never list secondary cities; the router has one city field
    // and will merge multiple city names into a garbage string
    const topCity = Object.entries(profile.topCities).sort(([, a], [, b]) => b - a)[0];
    if (topCity) {
      lines.push(`- Primary market: ${topCity[0]} (${topCity[1]}x) → use as city default when user doesn't specify. One city only — never combine.`);
    }

    if (profile.avgBudgetMax != null) {
      lines.push(`- Typical budget max: $${Math.round(profile.avgBudgetMax).toLocaleString()} → use as listing_price_max default only`);
    }
    if (profile.avgBedroomsMin != null) {
      lines.push(`- Typical bedrooms min: ${Math.round(profile.avgBedroomsMin)}`);
    }

    // Only show MLS features used at least twice — single use may be noise
    const topFeatures = Object.entries(profile.featureFrequency)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    if (topFeatures.length > 0) {
      lines.push(`- Frequently searched features: ${topFeatures.map(([f, n]) => `${f} (${n}x)`).join(", ")}`);
    }

    // Visual/aesthetic preferences — threshold of 1 so interview-stated aesthetics appear immediately
    const topVisual = Object.entries(profile.visualPreferences ?? {})
      .filter(([, count]) => count >= 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);
    if (topVisual.length > 0) {
      lines.push(`- Aesthetic preferences: ${topVisual.map(([f, n]) => `${f} (${n}x)`).join(", ")}`);
      lines.push(`  → When no explicit visual query given, consider setting visual_query for top aesthetic.`);
    }
  }

  if (hasStated) {
    lines.push("Stated preferences:");
    if (profile.preferredLocations.length > 0) {
      lines.push(`- Preferred locations: ${profile.preferredLocations.join(", ")}`);
    }
    if (profile.budgetMax != null || profile.budgetMin != null) {
      const budgetStr = [
        profile.budgetMin ? `$${profile.budgetMin.toLocaleString()}` : null,
        profile.budgetMax ? `$${profile.budgetMax.toLocaleString()}` : null,
      ]
        .filter(Boolean)
        .join(" – ");
      lines.push(`- Budget: ${budgetStr}`);
    }
    if (profile.bedroomsMin != null)            lines.push(`- Bedrooms min: ${profile.bedroomsMin}`);
    if (profile.bathroomsMin != null)           lines.push(`- Bathrooms min: ${profile.bathroomsMin}`);
    if (profile.mustHaves.length > 0)           lines.push(`- Must-haves: ${profile.mustHaves.join(", ")}`);
    if (profile.dealBreakers.length > 0)        lines.push(`- Deal-breakers: ${profile.dealBreakers.join(", ")}`);
    if (profile.propertyTypes.length > 0)       lines.push(`- Property types: ${profile.propertyTypes.join(", ")}`);
  }

  // Personal context — life facts from the Home Pilot interview.
  // Surface the routing-relevant ones so Haiku can use them as search defaults.
  const ctx = profile.personalContext ?? {};
  const ctxEntries = Object.entries(ctx).slice(0, 8);
  if (ctxEntries.length > 0) {
    lines.push("Personal context (use to enrich search defaults):");
    for (const [k, v] of ctxEntries) {
      lines.push(`- ${k.replace(/_/g, " ")}: ${v}`);
    }
    // Derived routing hints so Haiku doesn't have to infer
    if (ctx.household_composition) {
      const hh = ctx.household_composition.toLowerCase();
      if (hh.includes("kid") || hh.includes("child") || hh.includes("baby")) {
        lines.push("  → Has children: prefer SFR, school district proximity, yard");
      }
    }
    if (ctx.work_style && ctx.work_style.toLowerCase().includes("home")) {
      lines.push("  → Works from home: home office is a likely must-have");
    }
  }

  lines.push(
    "Rules:",
    "- Use typical budget max as listing_price_max default when user doesn't specify a price ceiling.",
    "- Never set listing_price_min from behavioral data — only set it when the user explicitly states a minimum price.",
    "- If user says 'show me homes' with no city, use their primary market as the city.",
    "- Never override explicit user specifications — these are defaults only.",
  );

  return lines.join("\n");
}

// ── Relative refinement ──────────────────────────────────────────────────────

/**
 * Detect relative refinement terms in a user message and compute a param
 * delta against the last search context. Returns null if no relative term found.
 *
 * Called in route.ts BEFORE the Haiku routing call so the pre-adjusted values
 * are injected into the Last search context block. Haiku sees the result —
 * never needs to do arithmetic itself.
 */
export function applyRelativeRefinement(
  message: string,
  lastParams: MLSSearchParams,
): Partial<MLSSearchParams> | null {
  const msg = message.toLowerCase();
  const delta: Partial<MLSSearchParams> = {};
  let matched = false;

  // ── Price ──
  if (/\b(cheaper|more affordable|lower (?:budget|price)|less expensive|bring (?:it )?down|drop the price)\b/.test(msg)) {
    if (lastParams.listing_price_max != null) {
      delta.listing_price_max = Math.round(lastParams.listing_price_max * 0.8);
      matched = true;
    }
  } else if (/\b(more expensive|higher[- ]end|step it up|pricier|upscale)\b/.test(msg)) {
    if (lastParams.listing_price_max != null) {
      delta.listing_price_max = Math.round(lastParams.listing_price_max * 1.3);
      matched = true;
    }
  }

  // ── Living area ──
  if (/\b(bigger|larger|more space|more sq(?:uare)?(?:\s?ft)?|spacious(?:er)?)\b/.test(msg)) {
    delta.living_area_min = (lastParams.living_area_min ?? 2000) + 500;
    matched = true;
  } else if (/\b(smaller|less space|more compact|cozy(?:er)?)\b/.test(msg)) {
    delta.living_area_min = Math.max(800, (lastParams.living_area_min ?? 2000) - 500);
    matched = true;
  }

  // ── Year built ──
  if (/\b(newer|more recent|recently built|new(?:er)? construction|modern build)\b/.test(msg)) {
    delta.year_built_min = 2015;
    matched = true;
  } else if (/\b(older|historic(?:al)?|vintage|character home)\b/.test(msg)) {
    delta.year_built_max = 1980;
    matched = true;
  }

  // ── Bedrooms ──
  if (/\b(more bedrooms?|one more bed(?:room)?|extra bed(?:room)?|bigger family|add a bed)\b/.test(msg)) {
    delta.bedrooms_min = (lastParams.bedrooms_min ?? 3) + 1;
    matched = true;
  } else if (/\b(fewer bedrooms?|one (?:less|fewer) bed(?:room)?|smaller family)\b/.test(msg)) {
    delta.bedrooms_min = Math.max(1, (lastParams.bedrooms_min ?? 3) - 1);
    matched = true;
  }

  // ── Result count ──
  if (/\b(show me more|more results?|more options?|see more|more listings?|show more)\b/.test(msg)) {
    delta.size = 12;
    matched = true;
  }

  return matched ? delta : null;
}

// ── Supermemory content builders ─────────────────────────────────────────────

/**
 * Build a clean, concise content string for Supermemory on the search path.
 * Writes intent + outcome only — NO raw listing data, addresses, or prices.
 * Keeps Supermemory's vector space focused on behavioral signals.
 */
export function buildSearchMemoryContent(
  params: MLSSearchParams,
  resultCount: number,
  resolvedLocation: string,
  newSearchCount: number,
  visualContext?: VisualContext,
): string {
  const parts: string[] = [`User searched: ${resolvedLocation || "unspecified location"}.`];

  if (params.bedrooms_min)      parts.push(`${params.bedrooms_min}+ bedrooms.`);
  if (params.listing_price_max) parts.push(`Budget under $${(params.listing_price_max / 1000).toFixed(0)}k.`);
  if (params.listing_price_min) parts.push(`Budget from $${(params.listing_price_min / 1000).toFixed(0)}k.`);
  if (params.year_built_min)    parts.push(`Built after ${params.year_built_min}.`);

  const features = extractFeatures(params);
  if (features.length > 0) parts.push(`MLS features: ${features.join(", ")}.`);

  // Visual/aesthetic context — write the label, not the full expanded visual_query
  if (visualContext?.visualQuery) {
    const label = extractVisualLabel(visualContext.visualQuery, visualContext.descKeywords ?? []);
    parts.push(`Visual preference: "${label}"${visualContext.roomHint && visualContext.roomHint !== "any" ? ` (${visualContext.roomHint})` : ""}.`);
    if (resultCount === 0) {
      parts.push(`No visual matches found — rare or hard-to-photograph feature.`);
    }
  }

  parts.push(
    resultCount === 0 && !visualContext?.visualQuery
      ? "MLS returned no results — niche or constrained search."
      : `MLS returned ${resultCount} result(s).`,
    `Lifetime search #${newSearchCount} for this user.`,
  );

  return parts.join(" ");
}

/**
 * Build a clean content string for Supermemory on the answer path.
 * Only call this when the response actually contains a preference signal —
 * skip for pure greetings or general Q&A.
 */
export function buildAnswerMemoryContent(signal: string): string {
  return `User preference signal: ${signal}`;
}
