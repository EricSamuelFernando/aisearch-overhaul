'use client';

import React from 'react';
import { Sparkles, ChevronUp, ChevronDown, Home, MapPin, GraduationCap } from 'lucide-react';
import { PROPERTY_DETAIL_SEARCH_AI_URL } from '@/shared/constants/env';

type PropertyTakeawaysAIProps = {
  property?: any;
  nearbySchools?: any[];
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getAddressLabel = (candidate: any): string => {
  if (!candidate) return '';
  const address =
    candidate?.address ||
    candidate?.listing?.address ||
    candidate?.public?.address ||
    {};

  return (
    address?.unparsedAddress ||
    address?.label ||
    [address?.street, address?.city, address?.stateOrProvince, address?.zipCode]
      .filter(Boolean)
      .join(', ')
  );
};

const normalizeInstitutionName = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:]+$/, '');

const collectInstitutionNames = (nearbySchools: any[] = [], collegeReadiness?: any): string[] => {
  const names = new Set<string>();

  nearbySchools.forEach((school) => {
    const schoolName = normalizeInstitutionName(
      school?.name || school?.school_name || school?.schoolName || ''
    );
    if (schoolName.length >= 4) {
      names.add(schoolName);
    }
  });

  const source = collegeReadiness || {};

  const baseSchoolName = normalizeInstitutionName(source?.school_name || '');
  if (baseSchoolName.length >= 4) {
    names.add(baseSchoolName);
  }

  if (Array.isArray(source?.top_colleges)) {
    source.top_colleges.forEach((college: any) => {
      const collegeName = normalizeInstitutionName(college?.name || '');
      if (collegeName.length >= 4) {
        names.add(collegeName);
      }
    });
  }

  return Array.from(names);
};

const buildHighlightRegex = (addressLabel: string, institutionNames: string[] = []): RegExp | null => {
  const normalizedAddress = addressLabel?.trim();
  const addressPattern = normalizedAddress ? escapeRegExp(normalizedAddress) : null;
  const institutionPattern =
    institutionNames.length > 0
      ? institutionNames
        .map(escapeRegExp)
        .sort((a, b) => b.length - a.length)
        .join('|')
      : null;

  const patterns = [
    addressPattern,
    institutionPattern,
    String.raw`\$\d[\d,]*(?:\.\d+)?`,
    String.raw`\b(?:19|20)\d{2}\b`,
    String.raw`\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:full\s+)?(?:bedrooms?|beds?|bathrooms?|baths?)\b`,
    String.raw`\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\s?(?:sq(?:uare)?\s?(?:feet|foot)|sq(?:\.|\s)?ft|sqft|sf)\b`,
    String.raw`\b(?:single-?family home|paid-off solar panels?|solar panels?|upgraded appliances|smart-?home(?:\sautomation)?|suitable for families|ideal for families)\b`,
    String.raw`\b[A-Z][A-Za-z'.&-]*(?:\s+[A-Z][A-Za-z'.&-]*){0,6}\s(?:Elementary|Middle|High)(?:\sSchool)?\b`,
    String.raw`\b[A-Z][A-Za-z'.&-]*(?:\s+[A-Z][A-Za-z'.&-]*){0,8}\s(?:University|College)\b`,
    String.raw`\b(?:California State University,?\s*Sacramento|University of Southern California)\b`,
    String.raw`\b(?:CSU(?:\s+[A-Z][A-Za-z'.&-]+)?|USC)\b`,
  ].filter(Boolean) as string[];

  if (!patterns.length) return null;
  return new RegExp(`(${patterns.join('|')})`, 'gi');
};

const highlightText = (text: string, highlightRegex: RegExp | null): React.ReactNode => {
  if (!text || !highlightRegex) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(highlightRegex.source, highlightRegex.flags);

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }

    parts.push(
      <strong key={`${match[0]}-${start}`} className="font-medium text-gray-800">
        {match[0]}
      </strong>
    );

    cursor = end;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts.length ? parts : text;
};

const splitIntoSummaryParagraphs = (summaryText: string): string[] => {
  const byLineBreaks = summaryText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (byLineBreaks.length > 1) {
    if (byLineBreaks.length <= 3) return byLineBreaks;
    return [byLineBreaks[0], byLineBreaks[1], byLineBreaks.slice(2).join(' ')];
  }

  const sentences = summaryText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 3) return sentences;

  const intro = sentences[0];
  const remainder = sentences.slice(1);

  if (remainder.length <= 2) {
    return [intro, remainder.join(' ')];
  }

  const splitPoint = Math.ceil(remainder.length / 2);
  const secondParagraph = remainder.slice(0, splitPoint).join(' ');
  const thirdParagraph = remainder.slice(splitPoint).join(' ');

  return [intro, secondParagraph, thirdParagraph].filter(Boolean);
};

const toNumeric = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCount = (value: number | null): string | null => {
  if (value === null) return null;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const truncateText = (value: string, maxLength = 220): string => {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
};

const uniqueItems = (items: string[]): string[] =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

type StoryAccent = {
  subtitleText: string;
  iconBg: string;
  iconText: string;
  toggleText: string;
  toggleHoverText: string;
  border: string;
  cardBg: string;
};

const STORY_ACCENTS: Record<'home' | 'neighborhood' | 'schools', StoryAccent> = {
  home: {
    subtitleText: 'text-[#F57F2E]',
    iconBg: '',
    iconText: 'text-[#F57F2E]',
    toggleText: 'text-[#F57F2E]',
    toggleHoverText: 'hover:text-[#E16F20]',
    border: 'border-[#F1E3D3]',
    cardBg: 'bg-[#FFF9F2]',
  },
  neighborhood: {
    subtitleText: 'text-[#F57F2E]',
    iconBg: '',
    iconText: 'text-[#F57F2E]',
    toggleText: 'text-[#F57F2E]',
    toggleHoverText: 'hover:text-[#E16F20]',
    border: 'border-[#F1E3D3]',
    cardBg: 'bg-[#FFF9F2]',
  },
  schools: {
    subtitleText: 'text-[#F57F2E]',
    iconBg: '',
    iconText: 'text-[#F57F2E]',
    toggleText: 'text-[#F57F2E]',
    toggleHoverText: 'hover:text-[#E16F20]',
    border: 'border-[#F1E3D3]',
    cardBg: 'bg-[#FFF9F2]',
  },
};

type PropertyStorySectionProps = {
  title: string;
  subtitle?: string;
  description: string;
  highlights: string[];
  accent: StoryAccent;
  icon: React.ReactNode;
  highlightRegex: RegExp | null;
  navigateHash: string;
};

const PropertyStorySection: React.FC<PropertyStorySectionProps> = ({
  title,
  subtitle,
  description,
  highlights,
  accent,
  icon,
  highlightRegex,
  navigateHash,
}) => {
  const DEFAULT_VISIBLE_HIGHLIGHTS = 2;
  const visibleHighlights = highlights.slice(0, DEFAULT_VISIBLE_HIGHLIGHTS);

  const handleShowMoreClick = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('preview-nav', { detail: navigateHash }));
    if (window.location.hash !== navigateHash) {
      window.history.replaceState(null, '', navigateHash);
    }
  };

  return (
    <div
      className={`rounded-2xl border ${accent.border} ${accent.cardBg} p-4 sm:p-5 shadow-[0_4px_20px_-18px_rgba(15,23,42,0.4)] h-full min-h-[320px] sm:min-h-[380px] flex flex-col`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <span className={`inline-flex shrink-0 items-center justify-center mt-0.5 ${accent.iconBg} ${accent.iconText}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="mt-0.5 text-base font-semibold leading-tight text-gray-900 sm:text-lg">{title}</h3>
          {subtitle && <p className={`mt-0.5 text-xs font-semibold ${accent.subtitleText}`}>{subtitle}</p>}
        </div>
      </div>

      <div className="min-h-0">
        <p className="mt-3 text-[13px] leading-6 text-gray-700">
          {highlightText(description, highlightRegex)}
        </p>

        {highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {visibleHighlights.map((point, index) => (
              <li key={`${index}-${point.slice(0, 24)}`} className="text-[13px] leading-5 text-gray-700">
                {highlightText(point, highlightRegex)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleShowMoreClick}
          className={`inline-flex items-center gap-1 rounded-full border border-current/20 bg-white/80 px-2 py-0.5 text-[11px] font-semibold transition-colors ${accent.toggleText} ${accent.toggleHoverText}`}
        >
          Show more
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const PropertyTakeawaysAI: React.FC<PropertyTakeawaysAIProps> = ({
  property,
  nearbySchools,
}) => {
  const schoolsApiBaseUrl =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL || 'http://localhost:4000';
  const [summary, setSummary] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [resolvedProperty, setResolvedProperty] = React.useState<any>(null);
  const [resolvingProperty, setResolvingProperty] = React.useState(false);
  const [institutionNames, setInstitutionNames] = React.useState<string[]>([]);
  const [collegeReadinessData, setCollegeReadinessData] = React.useState<any>(null);
  const resolveAttemptedRef = React.useRef(false);
  const sourceProperty = resolvedProperty || property;
  const addressLabel = React.useMemo(() => getAddressLabel(sourceProperty), [sourceProperty]);
  const highlightRegex = React.useMemo(
    () => buildHighlightRegex(addressLabel, institutionNames),
    [addressLabel, institutionNames]
  );
  const summaryParagraphs = React.useMemo(() => splitIntoSummaryParagraphs(summary), [summary]);

  const homeSnapshot = React.useMemo(() => {
    const coreProperty =
      sourceProperty?.property ||
      sourceProperty?.listing?.property ||
      sourceProperty?.public?.property ||
      {};

    const beds = toNumeric(coreProperty?.bedroomsTotal ?? coreProperty?.bedrooms ?? coreProperty?.beds);
    const baths = toNumeric(coreProperty?.bathroomsTotal ?? coreProperty?.bathrooms ?? coreProperty?.baths);
    const sqft = toNumeric(coreProperty?.livingArea ?? coreProperty?.squareFeet ?? coreProperty?.sqft);
    const yearBuilt = toNumeric(coreProperty?.yearBuilt ?? coreProperty?.year_built);

    const metrics = [
      beds !== null ? `${formatCount(beds)} Beds` : null,
      baths !== null ? `${formatCount(baths)} Baths` : null,
      sqft !== null ? `${sqft.toLocaleString('en-US')} sq ft` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    return { beds, baths, sqft, yearBuilt, metrics };
  }, [sourceProperty]);

  const summaryLower = React.useMemo(() => summary.toLowerCase(), [summary]);

  const schoolNames = React.useMemo(
    () => uniqueItems(institutionNames.filter((name) => /(Elementary|Middle|High|School)/i.test(name))),
    [institutionNames]
  );

  const collegeNames = React.useMemo(() => {
    const fromApi = Array.isArray(collegeReadinessData?.top_colleges)
      ? collegeReadinessData.top_colleges.map((college: any) => normalizeInstitutionName(college?.name || ''))
      : [];
    const fromSummary = institutionNames.filter((name) => /(University|College|CSU|USC)/i.test(name));
    return uniqueItems([...fromApi, ...fromSummary]).slice(0, 3);
  }, [collegeReadinessData, institutionNames]);

  const neighborhoodSubtitle = React.useMemo(() => {
    const tags: string[] = [];
    if (/walkable|walkability/.test(summaryLower)) tags.push('Walkability');
    if (/family|families/.test(summaryLower)) tags.push('Family-friendly');
    if (/amenities|shopping|restaurants?|dining/.test(summaryLower)) tags.push('Amenities');
    if (/safe|safety/.test(summaryLower)) tags.push('Safety');
    if (/parks?/.test(summaryLower)) tags.push('Parks');
    if (!tags.length) tags.push('Lifestyle', 'Amenities', 'Community');
    return uniqueItems(tags).slice(0, 3).join(' · ');
  }, [summaryLower]);

  const schoolsSubtitle = React.useMemo(() => {
    const tags: string[] = [];
    if (nearbySchools?.length) tags.push(`${nearbySchools.length} Nearby Schools`);
    if ((nearbySchools || []).some((school: any) => school?.rating && school.rating !== 'N/A')) tags.push('Ratings');
    if (collegeNames.length > 0) tags.push('College Readiness');
    if (!tags.length) tags.push('Nearby Schools', 'College Readiness');
    return tags.slice(0, 3).join(' · ');
  }, [collegeNames.length, nearbySchools]);

  const homeDescription = React.useMemo(
    () =>
      summaryParagraphs[0] ||
      summary ||
      'Core property facts and value-driving features are summarized below.',
    [summary, summaryParagraphs]
  );

  const neighborhoodDescription = React.useMemo(
    () =>
      summaryParagraphs[1] ||
      summaryParagraphs[0] ||
      'Neighborhood context focuses on day-to-day livability, access, and family fit.',
    [summaryParagraphs]
  );

  const schoolsDescription = React.useMemo(
    () =>
      summaryParagraphs[2] ||
      summaryParagraphs[1] ||
      'Education context combines nearby school signals with college-readiness pathways.',
    [summaryParagraphs]
  );

  const homeHighlights = React.useMemo(() => {
    const points: string[] = [];

    if (homeSnapshot.yearBuilt) points.push(`Built in ${homeSnapshot.yearBuilt}.`);
    if (homeSnapshot.beds !== null && homeSnapshot.baths !== null) {
      points.push(`${formatCount(homeSnapshot.beds)} bedrooms and ${formatCount(homeSnapshot.baths)} full bathrooms.`);
    }
    if (homeSnapshot.sqft !== null) {
      points.push(`${homeSnapshot.sqft.toLocaleString('en-US')} square feet of living area.`);
    }
    if (/single-?family home/.test(summaryLower)) points.push('Single-family home layout.');
    if (/paid-off solar|solar panels/.test(summaryLower)) points.push('Paid-off solar panels can lower long-term energy costs.');
    if (/upgraded appliances/.test(summaryLower)) points.push('Upgraded appliances add move-in-ready value.');
    if (/smart home|automation/.test(summaryLower)) points.push('Smart-home upgrades improve everyday convenience.');
    if (/suitable for families|ideal for families/.test(summaryLower)) points.push('Property profile is suitable for families.');

    return uniqueItems(points).slice(0, 4);
  }, [homeSnapshot.baths, homeSnapshot.beds, homeSnapshot.sqft, homeSnapshot.yearBuilt, summaryLower]);

  const neighborhoodHighlights = React.useMemo(() => {
    const points: string[] = [];

    if (/quiet neighborhood|quiet area/.test(summaryLower)) points.push('Located in a quiet residential setting.');
    if (/new construction|newly developed/.test(summaryLower)) points.push('Surrounded by newer development and improving infrastructure.');
    if (/walkable|walkability/.test(summaryLower)) points.push('Walkability supports daily convenience.');
    if (/parks?/.test(summaryLower)) points.push('Nearby parks provide outdoor options.');
    if (/shopping|restaurants?|dining|amenities/.test(summaryLower)) points.push('Dining and amenity access supports day-to-day lifestyle.');
    if (/safe|safety/.test(summaryLower)) points.push('Community context suggests a stable neighborhood profile.');
    if (/suitable for families|family|families/.test(summaryLower)) points.push('Neighborhood context aligns with family-friendly living.');
    if ((nearbySchools || []).length > 0) points.push(`${nearbySchools?.length} nearby schools support local convenience.`);

    if (!points.length) {
      points.push('Balanced residential location with access to essential services.');
    }

    return uniqueItems(points).slice(0, 4);
  }, [nearbySchools, summaryLower]);

  const schoolHighlights = React.useMemo(() => {
    const points: string[] = [];

    (nearbySchools || [])
      .filter((school: any) => school?.name)
      .slice(0, 2)
      .forEach((school: any) => {
        const ratingSuffix = school?.rating && school.rating !== 'N/A' ? ` (${school.rating})` : '';
        points.push(`${school.name}${ratingSuffix}.`);
      });

    if (collegeReadinessData?.school_name) {
      points.push(`College-readiness data references ${collegeReadinessData.school_name}.`);
    }

    if (collegeNames.length > 0) {
      points.push(`Top university pathways include ${collegeNames.slice(0, 2).join(' and ')}.`);
    }

    if (schoolNames.length > 0) {
      points.push(`Nearby school options include ${schoolNames.slice(0, 2).join(' and ')}.`);
    }

    if (!points.length) {
      points.push('School and college-readiness indicators are available for this area.');
    }

    return uniqueItems(points).slice(0, 4);
  }, [collegeNames, collegeReadinessData, nearbySchools, schoolNames]);

  React.useEffect(() => {
    const hasDetails = (candidate: any) => {
      if (!candidate) return false;
      const addr =
        candidate?.address ||
        candidate?.listing?.address ||
        candidate?.public?.address ||
        null;
      const price =
        candidate?.listPrice ||
        candidate?.listing?.listPriceLow ||
        candidate?.public?.listPrice ||
        null;
      const core =
        candidate?.property ||
        candidate?.listing?.property ||
        candidate?.public?.property ||
        {};
      return Boolean(
        addr?.zipCode ||
        addr?.unparsedAddress ||
        addr?.label ||
        price ||
        core?.bedroomsTotal ||
        core?.bathroomsTotal ||
        core?.livingArea ||
        candidate?.publicRemarks ||
        candidate?.remarks
      );
    };

    if (hasDetails(property)) {
      setResolvedProperty(property);
      return;
    }

    if (resolveAttemptedRef.current) return;

    const listingId =
      property?.listingId ||
      property?.listing?.listingId ||
      property?.public?.listingId ||
      Number(localStorage.getItem('listingId'));
    const propertyId =
      property?.id ||
      property?.propertyId ||
      Number(localStorage.getItem('propertyId'));

    if (!listingId) return;

    resolveAttemptedRef.current = true;
    setResolvingProperty(true);

    fetch(PROPERTY_DETAIL_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search/preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: Number(listingId),
        propertyId: propertyId ? Number(propertyId) : undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          setResolvedProperty(data.data);
        }
      })
      .catch(() => null)
      .finally(() => {
        setResolvingProperty(false);
      });
  }, [property]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchTakeaways = async () => {
      try {
        setLoading(true);
        setError(null);
        setCollegeReadinessData(null);
        const initialInstitutionNames = collectInstitutionNames(nearbySchools || []);
        if (isMounted) {
          setInstitutionNames(initialInstitutionNames);
        }

        const sourceProperty = resolvedProperty || property;
        if (!sourceProperty) {
          return;
        }

        const addressFromStorage = {
          unparsedAddress: localStorage.getItem('propertyAddress') || '',
          stateOrProvince: localStorage.getItem('stateOrProvince') || '',
          zipCode: localStorage.getItem('propertyAddress2') || '',
        };

        const address =
          sourceProperty?.address ||
          sourceProperty?.listing?.address ||
          sourceProperty?.public?.address ||
          (addressFromStorage.zipCode ? addressFromStorage : null);

        const listPrice =
          sourceProperty?.listPrice ||
          sourceProperty?.listing?.listPriceLow ||
          sourceProperty?.public?.listPrice ||
          Number(localStorage.getItem('listPrice')) ||
          null;

        const coreProperty =
          sourceProperty?.property ||
          sourceProperty?.listing?.property ||
          sourceProperty?.public?.property ||
          {};

        const homedetails =
          sourceProperty?.homedetails ||
          sourceProperty?.listing?.homedetails ||
          {};

        const publicRemarks = sourceProperty?.publicRemarks || sourceProperty?.remarks || '';
        const tags = Array.isArray(sourceProperty?.tags) ? sourceProperty.tags : [];

        const hasDetails =
          Boolean(address?.unparsedAddress || address?.label || publicRemarks || address?.zipCode) ||
          Boolean(listPrice) ||
          Boolean(coreProperty?.bedroomsTotal || coreProperty?.bathroomsTotal || coreProperty?.livingArea) ||
          Boolean(tags.length);

        if (!hasDetails) {
          return;
        }

        const zipCode = address?.zipCode || localStorage.getItem('propertyAddress2') || '';
        console.log('ðŸ“ Takeaways resolving zipCode:', zipCode);

        let collegeReadiness: any = null;
        if (zipCode) {
          try {
            const fetchUrl = `${schoolsApiBaseUrl}/schools/college-readiness-by-zip?zipCode=${encodeURIComponent(zipCode)}`;
            console.log('ðŸ” AI Fetching College Data from:', fetchUrl);

            const collegeResponse = await fetch(fetchUrl);

            if (collegeResponse.ok) {
              collegeReadiness = await collegeResponse.json();
              console.log('âœ… AI Received College Data:', collegeReadiness);
              if (isMounted) {
                setCollegeReadinessData(collegeReadiness);
                setInstitutionNames(collectInstitutionNames(nearbySchools || [], collegeReadiness));
              }
            } else {
              console.error('âŒ AI College Fetch Failed:', collegeResponse.status, collegeResponse.statusText);
            }
          } catch (err) {
            console.error('âŒ AI College Fetch Error:', err);
          }
        }

        const payload = {
          listingId:
            sourceProperty?.listingId ||
            sourceProperty?.listing?.listingId ||
            sourceProperty?.public?.listingId ||
            Number(localStorage.getItem('listingId')) ||
            sourceProperty?.id,
          address,
          listPrice,
          property: coreProperty,
          homedetails,
          publicRemarks,
          tags,
          nearbySchools: nearbySchools || [],
          collegeReadiness,
        };

        console.log('ðŸ§  Takeaways payload:', payload);

        const response = await fetch('/api/property-takeaways', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to load takeaways');
        }

        const result = await response.json();
        if (isMounted) {
          setSummary(result?.summary || '');
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load takeaways right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTakeaways();
    return () => {
      isMounted = false;
    };
  }, [property, nearbySchools, resolvedProperty]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3.5 sm:p-4 shadow-[0_8px_20px_-24px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2.5">
        <div className="flex items-start gap-2.5">
          <span className="inline-flex shrink-0 items-center justify-center mt-0.5">
            <Sparkles className="h-3.5 w-3.5 text-[#F57F2E]" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm sm:text-[14px] font-semibold text-gray-900">
              Takeaways <span className="font-normal text-gray-500">by Snaphomz AI</span>
            </span>
            <span className="mt-0.5 text-[10px] text-gray-400">AI-generated summary</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 transition hover:text-gray-700"
        >
          {collapsed ? 'Show' : 'Hide'}
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-3.5 sm:mt-4">
          {loading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-[90%] rounded bg-gray-100" />
              <div className="h-4 w-[82%] rounded bg-gray-100" />
              <div className="h-4 w-[86%] rounded bg-gray-100" />
            </div>
          )}
          {!loading && error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <PropertyStorySection
                title="Home"
                subtitle={homeSnapshot.metrics || 'Bedrooms - Bathrooms - Square footage'}
                description={homeDescription}
                highlights={homeHighlights}
                accent={STORY_ACCENTS.home}
                icon={<Home className="h-4 w-4" />}
                highlightRegex={highlightRegex}
                navigateHash="#home-highlights"
              />

              <PropertyStorySection
                title="Neighborhood"
                subtitle={neighborhoodSubtitle}
                description={neighborhoodDescription}
                highlights={neighborhoodHighlights}
                accent={STORY_ACCENTS.neighborhood}
                icon={<MapPin className="h-4 w-4" />}
                highlightRegex={highlightRegex}
                navigateHash="#property"
              />

              <PropertyStorySection
                title="Top Schools"
                subtitle={schoolsSubtitle}
                description={schoolsDescription}
                highlights={schoolHighlights}
                accent={STORY_ACCENTS.schools}
                icon={<GraduationCap className="h-4 w-4" />}
                highlightRegex={highlightRegex}
                navigateHash="#schools"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyTakeawaysAI;

