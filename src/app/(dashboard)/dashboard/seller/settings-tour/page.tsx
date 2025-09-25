'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

import AddressTime from '@/components/dashboard/main/address-time';
import Calendar from '@/components/dashboard/main/calendar';
import PropertyImage from '@/components/dashboard/main/property-image';
import TabSwitch from '@/components/dashboard/main/tab-switch';
import CustomButton from '@/components/custom-button';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useSearchParams } from 'next/navigation';
import SettingsTours from '@/components/dashboard/main/settings-tours';

const SettingsTour: React.FC = () => {
  const [tours, setTours] = React.useState();

  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'upcoming';
  const { userPath } = useCurrentUser();

  return (
    <div className='px-4'>
      <div className='mt-6 flex items-center'>
        {/* <Link
          href='/dashboard'
          className='mb-16 flex items-center font-medium text-black'
        >
          <FiArrowLeft className='mr-6' size={20} />
          Back to dashboard
        </Link> */}
      </div>

      {<SettingsTours />}
    </div>
  );
};

export default SettingsTour;
