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
      className='relative items-center mt-4 space-y-3 rounded-md  bg-[#2D2525] p-1 md:flex md:space-y-0'
      onSubmit={handleNavigate}
    >
      <SpeechInput
        value={searchTerm}
        className='bg-transparent'
        setValue={setSearchTerm}
        inputClassName='text-white bg-transparent'
      />

      <Button
        type='submit'
        size='lg'
        className='rounded-md bg-white p-8 font-bold text-black hover:bg-gray-300'
      >
        <ArrowRight />
      </Button>
    </form>
  );
};
