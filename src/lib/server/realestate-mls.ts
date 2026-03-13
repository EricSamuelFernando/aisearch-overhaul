type AnyRecord = Record<string, any>;

const RE_API_BASE = process.env.REALESTATE_API_BASE_URL || 'https://api.realestateapi.com';
const US_SUFFIX_RE = /\s*,\s*(?:usa|u\.s\.a\.|united states(?: of america)?)\s*$/i;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const STREET_SUFFIX_RE =
  /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|cir|circle|pl|place|ter|terrace|pkwy|parkway|way|hwy|highway|trl|trail|sq|square)\b/i;

const parseLooseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const normalizeCurrencyNumber = (raw: string): number | null => {
  const cleaned = raw.trim().toLowerCase().replace(/[$,\s]/g, '');
  if (!cleaned) return null;
  const match = cleaned.match(/^(\d+(?:\.\d+)?)([kmb])?$/i);
  if (!match) return parseLooseNumber(cleaned);
  const value = Number(match[1]);
  const suffix = (match[2] || '').toLowerCase();
  const multiplier = suffix === 'k' ? 1_000 : suffix === 'm' ? 1_000_000 : suffix === 'b' ? 1_000_000_000 : 1;
  return Math.round(value * multiplier);
};

const extractPriceRange = (query: string) => {
  const q = query.toLowerCase();
  let min: number | null = null;
  let max: number | null = null;

  const between = q.match(/\bbetween\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)\s+(?:and|to)\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)/i);
  if (between) {
    min = normalizeCurrencyNumber(between[1]);
    max = normalizeCurrencyNumber(between[2]);
    return { min, max };
  }

  const under = q.match(/\b(?:under|below|less than|max(?:imum)?(?: price)?)\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)/i);
  if (under) {
    max = normalizeCurrencyNumber(under[1]);
  }

  const over = q.match(/\b(?:over|above|more than|min(?:imum)?(?: price)?)\s+\$?([\d.,]+(?:\.\d+)?[kmb]?)/i);
  if (over) {
    min = normalizeCurrencyNumber(over[1]);
  }

  return { min, max };
};

const extractBedroomCount = (query: string) => {
  const m = query.match(/\b(\d+)\s*(?:\+?\s*)?(?:bed|beds|bedroom|bedrooms|br)\b/i);
  return m ? Number(m[1]) : null;
};

const extractBathroomCount = (query: string) => {
  const m = query.match(/\b(\d+(?:\.\d+)?)\s*(?:\+?\s*)?(?:bath|baths|bathroom|bathrooms|ba)\b/i);
  return m ? Number(m[1]) : null;
};

const extractZip = (query: string) => {
  const m = query.match(/\b(\d{5})(?:-\d{4})?\b/);
  return m ? m[1] : null;
};

const extractStreetAddress = (query: string) => {
  const trimmed = query.trim();
  // Common address-like input: "123 Main St, City, ST" or "123 Main St"
  const match = trimmed.match(/^(\d+[A-Za-z0-9\s.#/-]*[A-Za-z0-9])(?:,|$)/);
  if (!match?.[1]) return null;
  return match[1].trim().replace(/\s+/g, ' ');
};

const extractStreetNameWithoutNumber = (query: string) => {
  const cleaned = query.replace(US_SUFFIX_RE, '').trim();
  if (!cleaned) return null;
  const firstSegment = cleaned.split(',')[0]?.trim() || '';
  if (!firstSegment) return null;
  if (/^\d/.test(firstSegment)) return null;
  if (!STREET_SUFFIX_RE.test(firstSegment)) return null;
  return firstSegment.replace(/\s+/g, ' ');
};

const STATE_MAP: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
  connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA',
  washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  dc: 'DC', 'district of columbia': 'DC',
};

const extractState = (query: string) => {
  // Prefer a trailing ", CA" / ", ca" / " CA 90210" style token to avoid matching words like "in".
  const trailingAbbrev =
    query.match(/(?:,\s*|\s)([A-Za-z]{2})(?=\s*(?:\d{5}(?:-\d{4})?)?\s*$)/) ||
    query.match(/(?:,\s*|\s)([A-Za-z]{2})(?=\s*$)/);
  if (trailingAbbrev?.[1]) {
    const abbr = trailingAbbrev[1].toUpperCase();
    if (Object.values(STATE_MAP).includes(abbr)) return abbr;
  }

  const m = query.match(/\b([A-Z]{2})\b/);
  if (m && Object.values(STATE_MAP).includes(m[1].toUpperCase())) return m[1].toUpperCase();

  const q = query.toLowerCase();
  const hit = Object.keys(STATE_MAP).find((name) => q.includes(name));
  return hit ? STATE_MAP[hit] : null;
};

const extractCity = (query: string, state?: string | null, zip?: string | null) => {
  const cleaned = query.replace(US_SUFFIX_RE, '').trim();
  // In MLS direct mode, school-ranking phrases should not become part of the location.
  const schoolStripped = cleaned
    .replace(/\bnear\s+top[- ]?rated\s+schools?\b/gi, '')
    .replace(/\btop[- ]?rated\s+schools?\b/gi, '')
    .replace(/\b(?:best|good)\s+schools?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Prefer the location phrase after "in ..." (e.g. "... in Manhattan Beach")
  const inMatch = schoolStripped.match(
    /\bin\s+([A-Za-z .'-]+?)(?:,\s*([A-Za-z]{2}|[A-Za-z .'-]+))?(?:\s+\d{5}(?:-\d{4})?)?\s*$/i,
  );
  if (inMatch?.[1]) {
    const candidate = inMatch[1].trim().replace(/\s+/g, ' ');
    if (candidate.length > 1) return candidate;
  }

  // Common "City, State" or "City, StateName" format (e.g. "Folsom, California")
  const cityStateMatch = schoolStripped.match(
    /^\s*([A-Za-z .'-]+?)\s*,\s*([A-Za-z .'-]{2,})(?:\s+\d{5}(?:-\d{4})?)?(?:\s*,\s*(?:usa|u\.s\.a\.|united states(?: of america)?))?\s*$/i,
  );
  if (cityStateMatch?.[1] && cityStateMatch?.[2]) {
    const first = cityStateMatch[1].trim().replace(/\s+/g, ' ');
    const second = cityStateMatch[2].trim().replace(/\s+/g, ' ');
    const secondAsState =
      (second.length === 2 && Object.values(STATE_MAP).includes(second.toUpperCase())) ||
      Object.prototype.hasOwnProperty.call(STATE_MAP, second.toLowerCase());

    // "Marina Blvd, San Francisco" => street + city
    if (STREET_SUFFIX_RE.test(first) && !/^\d/.test(first) && !secondAsState) {
      if (second.length > 1) return second;
    }

    // Default "City, State" behavior.
    if (first.length > 1) return first;
  }

  // Full-address shape: "123 Main St, San Francisco, CA 94102"
  const addressCityMatch = schoolStripped.match(
    /^\s*\d[^,]*,\s*([A-Za-z .'-]+?)(?:,\s*([A-Za-z]{2}|[A-Za-z .'-]+))?(?:\s+\d{5}(?:-\d{4})?)?\s*$/i,
  );
  if (addressCityMatch?.[1]) {
    const candidate = addressCityMatch[1].trim().replace(/\s+/g, ' ');
    if (candidate.length > 1) return candidate;
  }

  const match = schoolStripped.match(/\b(?:near|around|at)\s+([A-Za-z .'-]+?)(?:,\s*([A-Z]{2}))?(?:\s+\d{5})?(?:\b|$)/i);
  if (match?.[1]) {
    const candidate = match[1].trim().replace(/\s+/g, ' ');
    if (candidate.length > 1 && !/^(homes?|houses?|properties)$/i.test(candidate)) {
      return candidate;
    }
  }
  // Plain city fallback: "Los Angeles", "Manhattan Beach"
  const plain = schoolStripped.trim();
  if (
    plain &&
    !/\d/.test(plain) &&
    !/^(homes?|houses?|properties)$/i.test(plain) &&
    !Object.keys(STATE_MAP).includes(plain.toLowerCase()) &&
    !Object.values(STATE_MAP).includes(plain.toUpperCase())
  ) {
    // Remove trailing state token if present: "Los Angeles CA", "Los Angeles, California"
    let withoutState = plain;
    if (state) {
      withoutState = withoutState
        .replace(new RegExp(`(?:,\\s*)?\\b${escapeRegex(state)}\\b$`, 'i'), '')
        .trim()
        .replace(/[,\s]+$/, '');

      const trailingStateName = Object.keys(STATE_MAP)
        .filter((name) => STATE_MAP[name] === state)
        .sort((a, b) => b.length - a.length)
        .find((name) => {
          const spaced = name.trim().split(/\s+/).map(escapeRegex).join('\\s+');
          return new RegExp(`(?:,\\s*)?\\b${spaced}\\b$`, 'i').test(withoutState);
        });

      if (trailingStateName) {
        const spaced = trailingStateName.trim().split(/\s+/).map(escapeRegex).join('\\s+');
        withoutState = withoutState
          .replace(new RegExp(`(?:,\\s*)?\\b${spaced}\\b$`, 'i'), '')
          .trim()
          .replace(/[,\s]+$/, '');
      }
    }

    if (withoutState.length > 1) return withoutState;
  }

  return null;
};

export const buildMlsSearchPayloadFromQuery = (query: string) => {
  const normalizedQuery = query
    .trim()
    .replace(US_SUFFIX_RE, '');

  const fullAddressLike =
    /^\d/.test(normalizedQuery) &&
    /,/.test(normalizedQuery);
  const address = fullAddressLike ? normalizedQuery : extractStreetAddress(normalizedQuery);
  const streetNameOnly = extractStreetNameWithoutNumber(normalizedQuery);
  const zip = extractZip(normalizedQuery);
  const state = extractState(normalizedQuery);
  const city = extractCity(normalizedQuery, state, zip);
  const beds = extractBedroomCount(normalizedQuery);
  const baths = extractBathroomCount(normalizedQuery);
  const price = extractPriceRange(normalizedQuery);
  const q = normalizedQuery.toLowerCase();

  const payload: AnyRecord = {
    active: true,
    include_photos: true,
    has_photos: true,
    size: 24,
  };

  if (address) payload.address = address;
  else if (streetNameOnly) payload.address = streetNameOnly;
  if (zip) payload.zip = zip;
  if (state) payload.state = state;
  if (city) payload.city = city;
  if (beds !== null) payload.bedrooms = beds;
  if (baths !== null) payload.bathrooms = baths;
  if (price.min !== null) payload.listing_price_min = price.min;
  if (price.max !== null) payload.listing_price_max = price.max;
  if (/\bpool\b/i.test(q)) payload.has_pool = !/\bno pool\b|\bwithout pool\b/i.test(q);
  if (/\bcondo\b|\bcondominium\b/i.test(q)) payload.listing_property_type = 'CONDO';
  if (/\bland\b|\blot\b/i.test(q)) payload.listing_property_type = 'LAND';
  if (/\bmulti[- ]?family\b|\bmfr\b/i.test(q)) payload.property_type = 'MFR';
  // Generic "homes" should not force SFR; allow condos/townhomes/apartments in MLS mode.
  if (/\bsingle[- ]?family\b|\bhouse\b/i.test(q)) payload.property_type = 'SFR';

  if (!zip && !(city && state) && state) payload.state = state;
  return payload;
};

const pickFirst = (...values: any[]) => values.find((v) => v !== undefined && v !== null && v !== '');

const toPhotoList = (media: any, record: any) => {
  const photos =
    media?.photosList ||
    media?.photos ||
    record?.photosList ||
    record?.photos ||
    [];
  return Array.isArray(photos) ? photos : [];
};

export const normalizeMlsSearchRecord = (record: AnyRecord, index: number) => {
  const listing = record.listing || record;
  const media = listing.media || record.media || {};
  const property = listing.property || record.property || {};
  const address = listing.address || record.address || {};
  const photosList = toPhotoList(media, listing);
  const primaryPhoto =
    pickFirst(
      media?.primaryListingImageUrl,
      media?.primaryImage,
      photosList?.[0]?.highRes,
      photosList?.[0]?.midRes,
      photosList?.[0]?.url,
      record?.primaryListingImageUrl,
      record?.primaryImage,
    ) || null;

  const lineAddress = pickFirst(
    address?.unparsedAddress,
    record?.address,
    record?.formattedAddress,
    record?.fullAddress,
    [listing?.street, listing?.city, listing?.state].filter(Boolean).join(', '),
  );

  const city = pickFirst(address?.city, listing?.city, record?.city);
  const state = pickFirst(address?.stateOrProvince, listing?.state, record?.state);
  const zip = pickFirst(address?.zipCode, listing?.zip, record?.zip);
  const lat = parseLooseNumber(pickFirst(property?.latitude, listing?.latitude, record?.latitude, record?.lat));
  const lng = parseLooseNumber(pickFirst(property?.longitude, listing?.longitude, record?.longitude, record?.lon, record?.lng));
  const listPrice = pickFirst(listing?.listPrice, record?.listPrice, record?.price);
  const listingId = pickFirst(listing?.listingId, record?.listingId, record?.listing_id, record?.mlsNumber, record?.id);
  const propertyId = pickFirst(record?.id, listing?.id, record?.propertyId, record?.property_id);

  return {
    ...record,
    ...listing,
    id: propertyId ?? listingId ?? `mls-${index}`,
    listingId,
    propertyId,
    listPrice,
    price: listPrice,
    address: lineAddress,
    city,
    state,
    zip,
    latitude: lat,
    longitude: lng,
    beds: pickFirst(property?.bedroomsTotal, listing?.bedroomsTotal, record?.bedroomsTotal, record?.beds, record?.bedrooms),
    baths: pickFirst(property?.bathroomsTotal, listing?.bathroomsTotal, record?.bathroomsTotal, record?.baths, record?.bathrooms),
    sqft: pickFirst(property?.livingArea, listing?.livingArea, record?.livingArea, record?.sqft, record?.livingSquareFeet),
    hasPool: pickFirst(property?.hasPool, listing?.hasPool, record?.hasPool),
    propertyType: pickFirst(property?.propertyType, listing?.propertyType, record?.propertyType),
    mlsNumber: pickFirst(listing?.mlsNumber, record?.mlsNumber),
    primaryListingImageUrl: primaryPhoto,
    photoListJson: photosList.length ? photosList : undefined,
    media: { ...media, primaryListingImageUrl: primaryPhoto, photosList },
    property: { ...property, latitude: lat, longitude: lng },
    public: {
      ...(record?.public || {}),
      latitude: lat,
      longitude: lng,
    },
    listing: {
      ...(listing.listing ? listing.listing : listing),
      listPriceLow: pickFirst(
        listing?.listPriceLow,
        listing?.listPrice,
        record?.listPriceLow,
        record?.listPrice,
        record?.price,
      ),
      address: {
        ...(listing?.address || address || {}),
        city,
        stateOrProvince: state,
        zipCode: zip,
        unparsedAddress: pickFirst(address?.unparsedAddress, lineAddress),
      },
    },
  };
};

export const extractMlsSearchRecords = (json: any): AnyRecord[] => {
  if (Array.isArray(json)) return json;
  const candidates = [
    json?.results,
    json?.records,
    json?.data?.results,
    json?.data?.records,
    json?.data?.listings,
    json?.listings,
    json?.data,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  if (json?.listing) return [json];
  return [];
};

export const normalizeMlsDetailResponse = (json: any) => {
  const source = json?.data || json?.listing || json || {};
  const address = source?.address || {};
  const property = source?.property || {};
  const media = source?.media || {};
  const homedetails = source?.homedetails || {};
  const schools = source?.schools || {};

  const normalizedData = {
    ...source,
    address,
    property,
    latitude: pickFirst(source?.latitude, property?.latitude),
    longitude: pickFirst(source?.longitude, property?.longitude),
    media: {
      ...media,
      primaryListingImageUrl: media?.primaryListingImageUrl || media?.photosList?.[0]?.highRes || media?.photosList?.[0]?.midRes || null,
      photosList: Array.isArray(media?.photosList) ? media.photosList : [],
    },
    homedetails,
    schools,
    tags: Array.isArray(source?.tags) ? source.tags : [],
    publicRemarks: pickFirst(source?.publicRemarks, source?.remarks, source?.listing?.publicRemarks, ''),
    listPrice: pickFirst(source?.listPrice, source?.price, source?.listing?.listPrice),
    listingId: pickFirst(source?.listingId, source?.listing_id, source?.mlsNumber, source?.id),
  };

  return {
    data: normalizedData,
    property_id: pickFirst(source?.id, source?.property_id, source?.reapid),
    property_detail: {
      data: {
        propertyInfo: {
          ...property,
          livingSquareFeet: pickFirst(property?.livingSquareFeet, property?.livingArea),
          address,
        },
        schools: Array.isArray(source?.schools) ? source.schools : [],
      },
    },
    nearbyHomes: [],
    source: 'mls_bypass',
  };
};

export const realEstatePost = async (path: string, body: AnyRecord) => {
  // MLS add-on endpoints (MLSSearch / MLSDetail) use your MLS-specific API key as x-api-key.
  // Prefer MLS_SNAPHOMZ_API, then fall back to REALESTATE_API_KEY for local/dev flexibility.
  const apiKey = process.env.MLS_SNAPHOMZ_API || process.env.REALESTATE_API_KEY;
  if (!apiKey) throw new Error('REALESTATE_API_KEY is not configured');

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
    'x-api-key': apiKey,
  };
  // Optional extra identity header, only if you explicitly set one.
  if (process.env.REALESTATE_USER_ID) {
    headers['x-user-id'] = process.env.REALESTATE_USER_ID;
  }

  const res = await fetch(`${RE_API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  return { ok: res.ok, status: res.status, json };
};
