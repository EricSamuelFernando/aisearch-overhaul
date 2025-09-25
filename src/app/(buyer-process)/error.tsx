'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-[80vh] w-full flex-col items-center justify-center space-y-5'>
      <h2 className='text-lg leading-7 md:text-xl'>Something went wrong!</h2>
      <Button className='w-80' roundness='full' onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
