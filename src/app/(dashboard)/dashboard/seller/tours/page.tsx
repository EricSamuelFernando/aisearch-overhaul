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
import { useFetchTours } from '@/hooks/api/agent/useGetTours';
import UpcomingTours from '@/components/dashboard/main/upcoming-tour';
import { useSearchParams } from 'next/navigation';
import PastTours from '@/components/dashboard/main/past-tours';
import { userData } from '@/slices/auth/auth.slice';
import { useSelector } from 'react-redux';


interface Tour {
  date: string;
  day: string;
  address: string;
  time: string;
  isToday?: boolean;
}

const initialTours: Tour[] = [
  {
    date: '4',
    day: 'May',
    address: '14743 Lakeside St, Sylmar, CA 91342.',
    time: '06:00 PM',
    isToday: true,
  },
  {
    date: '5',
    day: 'May',
    address: '640 1527th Ky Gray, Kentucky(KY), 40734',
    time: '10:00 AM',
    isToday: true,
  },
  {
    date: '12',
    day: 'Oct',
    address: '640 1527th Ky Gray, Kentucky(KY), 40734',
    time: '01:00 PM',
    isToday: true,
  },
];

const Tabs = [
  { title: 'Upcoming', query: 'upcoming' },
  { title: 'Past', query: 'past' },
];

const Tours: React.FC = () => {
  const [tours, setTours] = React.useState<Tour[]>(initialTours);
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'upcoming';
  const { userPath } = useCurrentUser();

  const filteredTours: Tour[] =
    currentTab === 'upcoming' ? tours : initialTours;


       const currentUser = useSelector(userData);
        
        debugger
        console.log(currentUser)
        const role = currentUser?.account_type?.toLowerCase();

  return (
    <div className='px-16'>
      <div className='mt-6 flex items-center'>
        <Link
          href='/dashboard'
          className='mb-16 flex items-center font-medium text-black'
        >
          <FiArrowLeft className='mr-6' size={20} />
          Back to dashboard
        </Link>
      </div>
      <div className='mb-2 flex items-center justify-between'>
        <TabSwitch
          tabs={Tabs}
          className=''
          tabClass='font-bold'
          activeTabClass='font-normal'
        />
        <CustomButton
          className='w-max rounded-full bg-black px-8 py-2 text-white'
          label='Add Schedule'
        ></CustomButton>
      </div>

     {currentTab === "upcoming" ? (
  <UpcomingTours role={role} userId={currentUser?.id} />
) : (
  <PastTours />
)}

    </div>
  );
};

export default Tours;
