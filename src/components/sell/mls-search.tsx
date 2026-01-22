'use client';

import { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '../ui/button';
import SpeechInput from '../speech-input';

export const MLSSearch = ({
  placeholderText,
}: {
  placeholderText?: string;
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleNavigate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      localStorage.setItem('query', searchTerm);
      if (searchTerm) {
        router.push(`/buy/browse?q=${encodeURIComponent(searchTerm)}`);
      }
    },
    [router, searchTerm],
  );

  return (
    <form
      id='buyer-search-hero-form'
      className='relative flex items-center mt-4 space-y-3 rounded-md bg-[#2D2525] p-1 md:space-y-0'
      onSubmit={handleNavigate}
    >
      <SpeechInput
        value={searchTerm}
        className='bg-transparent flex-1'
        setValue={setSearchTerm}
        inputClassName='text-white bg-transparent placeholder:text-gray-400 text-sm md:text-base px-3'
      />

      <Button
        type='submit'
        size='lg'
        className='rounded-md bg-white p-2 md:p-8 font-bold text-[#2A1C14] hover:bg-gray-300 h-10 w-10 md:h-auto md:w-auto flex-shrink-0'
      >
        <ArrowRight className='h-5 w-5 md:h-6 md:w-6' />
      </Button>
    </form>
  );
};
