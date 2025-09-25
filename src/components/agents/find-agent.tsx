'use client';

import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { FormEventHandler, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/utils/useDebounce';
import { useForm } from 'react-hook-form';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { Loader2 } from 'lucide-react'; // Spinner icon
import { useRouter } from 'next/navigation';

const FindAgent = () => {
  const { register, watch } = useForm<{ search: string }>();
  const searchValue = watch('search');
  const debouncedSearch = useDebounce(searchValue, 500);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { searchAllAgents } = useUserAuthApi();
  const router = useRouter()
  const handleSearch = async (value: string) => {
    try {
      setLoading(true);
      setResults([]);
      searchAllAgents.mutateAsync(
        { search: value, offset: 0, limit: 10 },
        {
          onSuccess: (response) => {
            setLoading(false);
            setResults(response?.data?.searchAllAgents || []);
          },
          onError: (err: any) => {
            setLoading(false);
            console.error(err);
          },
        }
      );
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
    <section className="bg-[#FAF0E6] px-4 py-20 flex flex-col items-center">
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
                onClick={()=>{
                  localStorage.setItem('agent',JSON.stringify(agent));
                  router.push(`/agents/${agent?.id}`)
                }}
              >
                <p className="font-medium">
                  {agent.firstName} {agent.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{agent.email}</p>
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
