'use client';

import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { FormEventHandler, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/utils/useDebounce';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react'; // Spinner icon
import { useRouter } from 'next/navigation';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:4000/auth/graphql';

async function fetchAgents() {
  const response = await fetch(GRAPHQL_URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    body: JSON.stringify({
      query: `
        query ExternalAgents($limit: Int, $offset: Int) {
          externalAgents(limit: $limit, offset: $offset) {
            data {
              id
              full_name
              email
              phone
              brokerage
              locationRaw
              profile_image_url
              avgRating
              avgRatingForCustomerDisplay
              homesSoldLastYear
            }
          }
        }
      `,
      variables: {
        limit: 100,
        offset: 0,
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const json = await response.json();
  const data = json?.data?.externalAgents?.data || [];
  return data.map((agent: any) => ({
    ...agent,
    Name: agent.full_name || '',
    agentEmail: agent.email || undefined,
    Location: agent.locationRaw || undefined,
    Brokerage: agent.brokerage || undefined,
  }));
}

const FindAgent = () => {
  const { register, watch } = useForm<{ search: string }>();
  const searchValue = watch('search');
  const debouncedSearch = useDebounce(searchValue, 500);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter()
  const handleSearch = async (value: string) => {
    try {
      setLoading(true);
      setResults([]);
      // const res = await fetch(`/api/agents?q=${encodeURIComponent(value)}`);
      // if (!res.ok) {
      //   setLoading(false);
      //   setResults([]);
      //   return;
      // }
      // const data = await res.json();
      const data = await fetchAgents()
      console.log(data)
      setResults(Array.isArray(data) ? data.slice(0, 10) : []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Search failed:', err);
    }
  };

  useEffect(() => {
    if (debouncedSearch?.trim()) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <section className="bg-[#FFF6EC] px-4 py-8 sm:py-16 lg:py-20 flex flex-col items-center">
      <p className="max-w-lg text-center text-sm text-gray-700 mb-8">
        Start your journey with the right guide — explore our trusted directory of experienced agents
        or invite someone you already trust to walk the process with you.
      </p>

      <div className="relative max-w-md w-full border border-[#E0D8C7] rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Search For An <span className="font-normal">Agent</span>
        </h2>

        {/* Search Input */}
        <div className="flex items-center bg-[#F2E8DC] rounded-lg px-4 py-2 mb-6">
          <Search className="text-gray-500 mr-3" size={20} />
          <Input
            {...register('search')}
            className="w-full bg-transparent border-none px-0 py-2 focus:outline-none"
            placeholder="Search name, email or location"
          />
        </div>

        {/* Results or Loader */}
        <div className="space-y-3 max-h-60 overflow-y-auto min-h-[100px]">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="animate-spin text-gray-600" size={24} />
              <span className="ml-2 text-sm text-gray-600">Searching...</span>
            </div>
          ) : results?.length > 0 ? (
            results.map((agent, idx) => (
              <div key={idx} className="border cursor-pointer rounded-md p-3 bg-white shadow-sm"
                onClick={() => {
                  router.push(`/agents/${agent?.id}`)
                }}
              >
                <p className="font-medium">
                  {agent.Name || `${agent.firstName || ''} ${agent.lastName || ''}`.trim()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {agent.agentEmail || agent.email}
                </p>
              </div>
            ))
          ) : (
            debouncedSearch && (
              <p className="text-center text-sm text-gray-500">No agents found</p>
            )
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-700 mt-6">
          Can’t find your agent?
          <br />
          <a href="#" className="underline text-black hover:text-gray-800">
            Invite them here
          </a>
        </p>
      </div>
    </section>
  );
};

export default FindAgent;
