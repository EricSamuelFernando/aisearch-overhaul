import { MoveLeft } from 'lucide-react';
import Link from 'next/link';
import { OnboardSection } from '@/components/buy/onboard';

function OnboardPage() {
  return (
    <section className='px-8'>
      <Link className='flex items-center gap-x-1 text-sm font-bold' href='/buy'>
        <span>
          <MoveLeft />
        </span>
        <span>Back to View Property</span>
      </Link>
      <OnboardSection />
    </section>
  );
}

export default OnboardPage;
