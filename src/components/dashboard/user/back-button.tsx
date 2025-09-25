'use client';
import Image from 'next/image';
import Link from 'next/link';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../ui/button';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

function UserBackButton() {
  const { propertyId } = useParams();
  const { userPath } = useCurrentUser();

  return (
    <Link
      className='flex items-center gap-x-2 font-semibold'
      href={`/dashboard/buyer/property/${propertyId}`}
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
  );
}

export function GeneralBackButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      variant='ghost'
      className='flex items-center gap-x-2 font-semibold'
    >
      <Image
        width={16}
        height={16}
        src={`/assets/images/arrow-back.svg`}
        objectFit='contain'
        alt='Agent'
      />
      Back
    </Button>
  );
}

export function SellerBackToPropertyButton () {
  const { id } = useParams();
  const { userPath } = useCurrentUser();
  console.log(id)
  console.log("TEst")
  return (
    <Link
      className='flex items-center gap-x-2 font-semibold'
      href={`/dashboard/seller/listing/listingprocess?id=${id}`}
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
  );
}

export default UserBackButton;
