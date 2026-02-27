export type ChatIntent = "general" | "property" | "rent-vs-buy";

export type RoutingOptions = {
    enableRentVsBuy?: boolean;
};

const PROPERTY_KEYWORDS = [
    "show",
    "find",
    "list",
    "search",
    "looking for",
    "want",
    "need",
    "houses",
    "house",
    "homes",
    "home",
    "properties",
    "property",
    "apartments",
    "apartment",
    "listing",
    "listings",
];

const RENT_BUY_KEYWORDS = [
    "rent vs buy",
    "rent or buy",
    "buy vs rent",
    "renting vs buying",
    "renting or buying",
    "rent vs own",
    "lease vs buy",
    "lease or buy",
    "compare rent",
    "compare renting and buying",
    "should i rent or buy",
    "is it better to rent or buy",
    "better to rent or buy",
    "mortgage vs rent",
];

const ADVISORY_KEYWORDS = [
    "cost to build",
    "cost of building",
    "cost to add",
    "cost of adding",
    "price of installing",
    "renovation",
    "renovate",
    "remodel",
    "remodeling",
    "addition",
    "extension",
    "convert",
    "conversion",
    "garage conversion",
    "adu",
    "accessory dwelling",
    "ballpark",
    "estimate",
    "expected cost",
    "expect to pay",
    "how much should i pay",
    "how much does",
    "is it a good time to",
    "market trends",
    "labor costs",
    "permit",
    "permits",
    "contractor",
    "construction costs",
    "buildout",
    "build out",
];

const GENERAL_INFO_KEYWORDS = [
    "market",
    "trending",
    "trend",
    "expensive",
    "safe",
    "safety",
    "crime",
    "schools",
    "rates",
    "interest",
    "forecast",
    "inventory",
    "appreciation",
    "affordability",
    "taxes",
    "insurance",
    "what is",
    "how does",
    "mortgage",
    "hoa",
    "escrow",
    "pmi",
    "closing costs",
    "down payment",
    "appraisal",
    "inspection",
    "input_tokens",
    "output_tokens",
    "graph",
    "chart",
];

const SNAPINTEREST_KEYWORDS = [
    "monthly payment",
    "mortgage payment",
    "loan payment",
    "mortgage rate",
    "interest rate",
    "down payment",
    "loan term",
    "amortization",
    "principal",
    "loan amount",
    "balance",
    "refinance",
    "refi",
];

const SCHOOL_KEYWORDS = [
    "school",
    "schools",
    "school district",
    "district",
    "elementary",
    "middle school",
    "high school",
    "private school",
    "public school",
    "college",
    "colleges",
    "university",
    "universities",
    "universtiy",
    "universties",
    "postsecondary",
    "graduate school",
    "grad school",
    "campus",
];

const ADDRESS_SECOND_TOKEN_DISALLOWED = new Set([
    "bed",
    "beds",
    "bedroom",
    "bedrooms",
    "bath",
    "baths",
    "bathroom",
    "bathrooms",
    "market",
    "forecast",
    "trend",
    "trends",
    "mortgage",
    "loan",
    "rate",
    "rates",
    "tax",
    "taxes",
    "price",
    "prices",
    "cost",
    "costs",
    "rent",
    "buy",
    "sell",
    "home",
    "homes",
    "house",
    "houses",
    "property",
    "properties",
]);

const ADDRESS_SUFFIX_RE =
    /\b(street|st|road|rd|avenue|ave|boulevard|blvd|drive|dr|lane|ln|court|ct|place|pl|way|circle|cir|parkway|pkwy|trail|trl|highway|hwy|terrace|ter)\b/i;
const ADDRESS_DIRECTION_RE = /\b(n|s|e|w|ne|nw|se|sw)\b/i;
const STATE_CODE_RE =
    /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i;
const STATE_NAME_RE =
    /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|district of columbia)\b/i;

const normalize = (query: string) => query.toLowerCase();

export const hasGeneralInfoCue = (query: string) => {
    const normalized = normalize(query);
    return GENERAL_INFO_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const hasSchoolCue = (query: string) => {
    const normalized = normalize(query);
    return SCHOOL_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const hasPostsecondaryCue = (query: string) => {
    const normalized = normalize(query);
    if (/(postsecondary|college|colleges|university|universities|campus|graduate school|grad school)/.test(normalized)) {
        return true;
    }
    if (/\buniverstiy\b|\buniversties\b/.test(normalized)) return true;
    return false;
};

export const hasPropertyKeyword = (query: string) =>
    PROPERTY_KEYWORDS.some((keyword) =>
        new RegExp(`\\b${keyword}\\b`, "i").test(query)
    );

const hasAdvisoryCue = (query: string) => {
    const normalized = normalize(query);
    if (ADVISORY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
        return true;
    }
    return (
        /\b(how much|what does it cost|cost)\b.*\b(addition|renovation|remodel|conversion|adu|extension)\b/i.test(
            normalized
        ) ||
        /\b(cost|price)\b.*\b(install|installation|renovation|remodel|addition)\b/i.test(
            normalized
        )
    );
};

const isExplicitListingRequest = (query: string) => {
    const normalized = normalize(query);
    const listingVerbs = [
        "show me",
        "find",
        "list",
        "search",
        "browse",
        "see",
        "looking for",
        "look for",
        "need",
        "want",
    ];
    const listingNouns = [
        "listings",
        "homes",
        "houses",
        "properties",
        "property",
        "apartment",
        "apartments",
        "condo",
        "condos",
        "for sale",
    ];
    const hasVerb = listingVerbs.some((v) => normalized.includes(v));
    const hasNoun = listingNouns.some((n) => normalized.includes(n));
    const buyWithNoun = normalized.includes("buy") && hasNoun;
    return (hasVerb && hasNoun) || buyWithNoun;
};

const hasSnapinterestCue = (query: string) => {
    const normalized = normalize(query);
    return SNAPINTEREST_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const hasPropertyOrdinal = (query: string) => {
    const normalized = normalize(query);
    return (
        /\b(?:property|home|house|listing)\s*#?\s*(?:\d+|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(?:st|nd|rd|th))\b/i.test(
            normalized
        ) ||
        /\b\d+(?:st|nd|rd|th)\s+(?:property|home|house|listing)\b/i.test(normalized)
    );
};

const isRentVsBuyQuery = (query: string) => {
    const normalized = normalize(query);
    const hasExplicitPhrase = RENT_BUY_KEYWORDS.some((keyword) =>
        normalized.includes(keyword)
    );
    const hasRentSignal = /\b(rent|renting|lease|leasing)\b/.test(normalized);
    const hasBuySignal = /\b(buy|buying|own|ownership|purchase)\b/.test(
        normalized
    );
    return hasExplicitPhrase || (hasRentSignal && hasBuySignal);
};

const isLocationListingRequest = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return false;

    const looksLikeQuestion =
        /\?/.test(trimmed) ||
        /^(who|what|when|where|why|how|is|are|do|does|can|should|would)\b/i.test(
            trimmed
        );

    if (looksLikeQuestion) return false;

    const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(trimmed);
    const hasCityState =
        /\b[a-zA-Z]+(?:\s+[a-zA-Z]+)*,\s*[A-Z]{2}\b/.test(trimmed);
    const hasLocationPhrase =
        /\b(in|near|around|at)\s+[a-zA-Z\s,]{2,}/i.test(trimmed);
    const wordCount = trimmed.split(/\s+/).length;
    const shortLocation = wordCount <= 4 && /[a-zA-Z]/.test(trimmed);

    return hasZip || hasCityState || hasLocationPhrase || shortLocation;
};

const isLikelyStreetAddress = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return false;

    const tokens = trimmed.toLowerCase().match(/[a-z0-9]+/g) || [];
    if (tokens.length < 2) return false;
    if (!/^\d{1,6}$/.test(tokens[0])) return false;
    if (ADDRESS_SECOND_TOKEN_DISALLOWED.has(tokens[1])) return false;

    const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(trimmed);
    const hasComma = trimmed.includes(",");
    const hasSuffix = ADDRESS_SUFFIX_RE.test(trimmed);
    const hasDirection = ADDRESS_DIRECTION_RE.test(tokens.slice(1, 3).join(" "));
    const hasState = STATE_CODE_RE.test(trimmed) || STATE_NAME_RE.test(trimmed.toLowerCase());

    // Permit typo/partial address input (e.g. "837 w 103rd stree los angeles california")
    // while still requiring a numeric street-number start.
    return hasSuffix || hasDirection || hasZip || hasState || hasComma || tokens.length >= 3;
};

export const detectIntent = (
    query: string,
    options: RoutingOptions = {}
): ChatIntent => {
    const trimmed = query.trim();
    if (!trimmed) return "general";

    const normalized = trimmed.toLowerCase();
    if (hasPostsecondaryCue(normalized)) return "property";

    const looksLikeQuestion =
        /\?/.test(normalized) ||
        /^(who|what|when|where|why|how|is|are|do|does|can|should|would)\b/i.test(
            normalized
        );
    const hasLocationHint = /\b(in|near|around|at)\b/.test(normalized);
    const hasNumeric = /\d/.test(normalized);
    const hasSearchConstraints = /\b(bed|bath|price|under|over|budget|sqft)\b/.test(
        normalized
    );
    const schoolLocationQuery =
        hasSchoolCue(normalized) &&
        (hasLocationHint || hasNumeric || isLocationListingRequest(trimmed));

    if (isRentVsBuyQuery(normalized)) {
        return options.enableRentVsBuy === false ? "general" : "rent-vs-buy";
    }

    // Advisory questions should route to /question even with numbers or property words.
    if (hasAdvisoryCue(normalized) && !isExplicitListingRequest(normalized)) {
        return "general";
    }

    // SnapInterest questions should route to /question, not property search.
    if (hasSnapinterestCue(normalized) && (hasNumeric || hasPropertyOrdinal(normalized) || looksLikeQuestion)) {
        return "general";
    }

    if (looksLikeQuestion && !hasLocationHint && !hasNumeric && !hasSearchConstraints) {
        return "general";
    }

    if (schoolLocationQuery) return "property";
    if (hasGeneralInfoCue(normalized)) return "general";
    if (isLikelyStreetAddress(trimmed)) return "property";
    if (hasPropertyKeyword(normalized)) return "property";
    if (hasSchoolCue(normalized)) return "property";
    if (isLocationListingRequest(trimmed)) return "property";

    // Follow-up property filter change: short message modifying a property attribute
    // (e.g., "What about 2 bedrooms instead", "how about 4 beds", "actually under $1m")
    // These start with question words but are search refinements, not genuine questions.
    const hasPropertyAttr = /\b(bedroom|bedrooms|bed|beds|bath|baths|bathroom|bathrooms|pool|garage|sqft|square\s+feet|story|stories|floors)\b/i.test(normalized);
    const hasFilterChangeSignal = /\b(instead|what about|how about|actually|only the|show the|more bedrooms|fewer bedrooms)\b/i.test(normalized);
    const msgWordCount = normalized.split(/\s+/).length;
    if (
        hasPropertyAttr &&
        (hasFilterChangeSignal || (looksLikeQuestion && hasNumeric)) &&
        msgWordCount <= 12 &&
        !hasAdvisoryCue(normalized)
    ) {
        return "property";
    }

    return "general";
};
