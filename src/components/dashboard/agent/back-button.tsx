'use client';
import Image from 'next/image';
import Link from 'next/link';

import { useSearchParams, useParams } from 'next/navigation';

function AgentBackButton() {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
  return (
    <div>
      <Link
        className='flex items-center gap-x-2 font-semibold'
        href={`/dashboard/agent/property/${id}`}
      >
        <Image
          width={18}
          height={18}
          src={`/assets/images/arrow-back.svg`}
          objectFit='contain'
          alt='Agent'
        />
        <span>Back to Property</span>
      </Link>
    </div>
  );
}

export default AgentBackButton;
