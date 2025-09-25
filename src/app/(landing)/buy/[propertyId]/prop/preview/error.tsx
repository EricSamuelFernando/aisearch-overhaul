'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Link } from 'lucide-react';

import { OCRealLogo } from '@public/assets/images';
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.log(error);
  return (
    <div className='h-screen w-full  bg-primary-100'>
      <Link href='/' className='w-max'>
        <Image src={OCRealLogo} alt='logo' height={40} width={120} />
      </Link>
      <div className='flex h-full w-full flex-col items-center justify-between'>
        <h2>Something went wrong!</h2>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
