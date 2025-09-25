'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

import AddressTime from '@/components/dashboard/main/address-time';
import Calendar from '@/components/dashboard/main/calendar';
import PropertyImage from '@/components/dashboard/main/property-image';
import TabSwitch from '@/components/dashboard/main/tab-switch';
import CustomButton from '@/components/custom-button';

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
  const [currentTab, setCurrentTab] = React.useState<string>('upcoming');

  const onChangeTab = (tab: string) => {
    setCurrentTab(tab);
  };

  const filteredTours: Tour[] =
    currentTab === 'upcoming' ? tours : initialTours;

  return (
    <div className='px-16'>
      <div className='mt-6 flex items-center'>
        <Link
          href='/dashboard/buyer'
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

      <div className='overflow-hidden rounded-2xl border'>
        {filteredTours && filteredTours.length > 0 ? (
          filteredTours.map((tour: Tour, index: number) => (
            <div key={index} className='flex space-x-8 border-b'>
              <Calendar
                date={tour.date}
                // day={tour.day}
                // isToday={tour.isToday}
                className='bg-grey-50'
              />
              <div className='flex flex-grow items-center space-x-4 py-4'>
                <PropertyImage alt='Property Image' />
                <AddressTime address={tour.address} time={tour.time} />
              </div>
            </div>
          ))
        ) : (
          <p>No tours available.</p>
        )}
      </div>
    </div>
  );
};

export default Tours;
