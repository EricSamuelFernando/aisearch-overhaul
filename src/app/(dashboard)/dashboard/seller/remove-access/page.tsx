'use client';

import RemoveAccess from '@/components/dashboard/main/remove-access';
import TransactionDashboard from '@/components/dashboard/main/transaction-dashboard';
import { useSearchParams } from 'next/navigation';

type Props = {};

const RemoveAccessPage = ({}: Props) => {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('id') || '';

  return (
    <>
      <RemoveAccess id={propertyId} openRemoveAccess={() => {}} />
    </>
  );
};

export default RemoveAccessPage;
