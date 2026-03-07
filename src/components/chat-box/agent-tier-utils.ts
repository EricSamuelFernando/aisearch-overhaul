export interface NegotiationTier {
  id: string;
  name: string;
  commission: number;
  services: string[];
  recommended?: boolean;
}

const TIER_NAME_FALLBACKS = ["Tier 1", "Tier 2", "Tier 3"];

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const toCommissionNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace("%", "").trim();
    const parsed = Number.parseFloat(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const normalizeServices = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toNonEmptyString(entry))
      .filter((entry): entry is string => !!entry);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
};

const isTierLikeObject = (value: Record<string, unknown>): boolean => {
  return [
    "id",
    "tier",
    "name",
    "label",
    "title",
    "services",
    "features",
    "items",
    "commission",
    "rate",
  ].some((key) => key in value);
};

const resolveTierOrder = (tier: Record<string, unknown>, index: number): number => {
  if (typeof tier.tier === "number" && Number.isFinite(tier.tier)) {
    return tier.tier;
  }

  if (typeof tier.tier === "string") {
    const parsed = Number.parseInt(tier.tier, 10);
    if (Number.isFinite(parsed)) return parsed;
  }

  const idAsString = toNonEmptyString(tier.id);
  if (idAsString) {
    const match = idAsString.match(/(\d+)/);
    if (match?.[1]) {
      const parsed = Number.parseInt(match[1], 10);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return index + 1;
};

const parseJsonRecursively = (value: unknown): unknown => {
  let parsed: unknown = value;
  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof parsed !== "string") {
      return parsed;
    }
    const trimmed = parsed.trim();
    if (!trimmed.length) {
      return null;
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return parsed;
    }
  }
  return parsed;
};

const normalizeTierEntry = (
  tier: Record<string, unknown>,
  index: number,
): (NegotiationTier & { __order: number }) | null => {
  const title =
    toNonEmptyString(tier.title) ||
    toNonEmptyString(tier.label) ||
    toNonEmptyString(tier.tierName) ||
    toNonEmptyString(tier.name) ||
    TIER_NAME_FALLBACKS[index] ||
    `Tier ${index + 1}`;

  const commission = toCommissionNumber(
    tier.commission ?? tier.rate ?? tier.percentage ?? tier.fee,
  );
  const services = normalizeServices(
    tier.services ?? tier.features ?? tier.items ?? tier.options ?? tier.benefits,
  );
  const order = resolveTierOrder(tier, index);
  const recommended =
    typeof tier.recommended === "boolean"
      ? tier.recommended
      : /priority/i.test(title) || order === 2;

  return {
    id: toNonEmptyString(tier.id) || `tier-${order}`,
    name: title,
    commission,
    services,
    recommended,
    __order: order,
  };
};

const extractTierEntries = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is Record<string, unknown> =>
        !!entry && typeof entry === "object" && !Array.isArray(entry),
    );
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    if (Array.isArray(objectValue.tiers)) {
      return extractTierEntries(objectValue.tiers);
    }

    if (isTierLikeObject(objectValue)) {
      return [objectValue];
    }

    const namedTierEntries = ["tier1", "tier2", "tier3", "basic", "priority", "premium"]
      .map((key) => objectValue[key])
      .filter(
        (entry): entry is Record<string, unknown> =>
          !!entry && typeof entry === "object" && !Array.isArray(entry),
      );
    if (namedTierEntries.length > 0) {
      return namedTierEntries;
    }

    return Object.values(objectValue).filter(
      (entry): entry is Record<string, unknown> =>
        !!entry && typeof entry === "object" && !Array.isArray(entry),
    );
  }

  return [];
};

export const normalizeAgentTiersPayload = (rawTiers: unknown): NegotiationTier[] => {
  if (rawTiers === null || rawTiers === undefined) {
    return [];
  }

  const parsedPayload = parseJsonRecursively(rawTiers);
  if (!parsedPayload) return [];

  return extractTierEntries(parsedPayload)
    .map((tier, index) => normalizeTierEntry(tier, index))
    .filter((tier): tier is NegotiationTier & { __order: number } => !!tier)
    .sort((a, b) => a.__order - b.__order)
    .map(({ __order, ...tier }) => tier);
};
