'use client';

import React from 'react';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { deploymentEnv, PROPERTY_DETAIL_SEARCH_AI_URL } from '@/shared/constants/env';

type PropertyTakeawaysAIProps = {
  property?: any;
  nearbySchools?: any[];
};

const PropertyTakeawaysAI: React.FC<PropertyTakeawaysAIProps> = ({
  property,
  nearbySchools,
}) => {
  const [summary, setSummary] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [resolvedProperty, setResolvedProperty] = React.useState<any>(null);
  const [resolvingProperty, setResolvingProperty] = React.useState(false);
  const resolveAttemptedRef = React.useRef(false);

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
        console.log('📍 Takeaways resolving zipCode:', zipCode);

        let collegeReadiness: any = null;
        if (zipCode) {
          try {
            const fetchUrl = `http://localhost:4000/schools/college-readiness-by-zip?zipCode=${zipCode}`;
            console.log('🔍 AI Fetching College Data from:', fetchUrl);

            const collegeResponse = await fetch(fetchUrl);

            if (collegeResponse.ok) {
              collegeReadiness = await collegeResponse.json();
              console.log('✅ AI Received College Data:', collegeReadiness);
            } else {
              console.error('❌ AI College Fetch Failed:', collegeResponse.status, collegeResponse.statusText);
            }
          } catch (err) {
            console.error('❌ AI College Fetch Error:', err);
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

        console.log('🧠 Takeaways payload:', payload);

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
  }, [property, nearbySchools]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <span>
            Takeaways <span className="font-normal text-gray-500">by Snaphomz AI</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          {collapsed ? 'Show' : 'Hide'}
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-3 text-sm text-gray-700 leading-relaxed">
          {loading && <p className="text-gray-500">Generating takeaways...</p>}
          {!loading && error && <p className="text-red-500">{error}</p>}
          {!loading && !error && summary && <p>{summary}</p>}
          {!loading && !error && !summary && (
            <p className="text-gray-500">No takeaways available for this property.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyTakeawaysAI;
