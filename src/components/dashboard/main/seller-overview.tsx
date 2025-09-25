'use client';

import { TrendingUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatLargeNumber } from '@/lib/utils';
import useGetSellerAnalytics from '@/hooks/api/property/useGetSellerAnalytics';
import Agents from './agents';
import { NotificationList } from './notification-list';
import ToursList from './tours-list';
import { Button } from '@/components/ui/button';
import CustomProgressBar from '@/components/customs/custom-ring-progress';
import SkeletonLoader from '@/components/skeleton-loader';

type PropertyInfoProp = {
  value: string | number;
  description: React.ReactNode;
  color: string;
};

function SellerOverview() {
  const [loading, setLoading] = useState(false);

  return (
    <section className='grid h-full gap-4 sm:gap-6 md:gap-8 lg:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'>
      <div className='col-span-2'>
        {loading ? <OverviewLoader /> : null}
        {!loading ? <OverviewDetails /> : null}
      </div>
      <section className='flex flex-wrap justify-between lg:flex-col lg:justify-start'>
        {/* <ToursList /> */}
        <NotificationList />
        <Agents />
      </section>
    </section>
  );
}

export default SellerOverview;

const OverviewLoader = () => {
  return (
    <section className='h-max animate-pulse  rounded-3xl bg-gray-400  p-8'>
      <div className='mb-4 flex justify-between'>
        <SkeletonLoader className='h-48 w-48  rounded-full bg-white' />
        <div>
          <SkeletonLoader className='h-[150px] min-w-[250px] rounded-3xl bg-white p-8 text-white' />
          <div className='mt-4 flex justify-end'>
            <SkeletonLoader className='skeleton-loader flex-end block h-4 w-[100px] rounded-2xl bg-white py-4'></SkeletonLoader>
          </div>
        </div>
      </div>
      <div className='flex justify-between gap-x-4'>
        <SkeletonLoader className='skeleton-loader h-[150px]  flex-1 rounded-3xl bg-white p-8 text-white'></SkeletonLoader>
        <SkeletonLoader className='skeleton-loader h-[150px] flex-1 rounded-3xl bg-white p-8 text-white'></SkeletonLoader>
        <SkeletonLoader className='skeleton-loader h-[150px] flex-1 rounded-3xl bg-white p-8 text-white'></SkeletonLoader>
      </div>
    </section>
  );
};

const OverviewDetails = () => {
  const { data: analiticsData, isLoading, status } = useGetSellerAnalytics();
  const sellerAnalytics = analiticsData?.data?.data;

  const formattedTotalValue = sellerAnalytics
    ? formatLargeNumber(sellerAnalytics.totalValue)
    : '--';
  const totalPropertyCount = sellerAnalytics
    ? sellerAnalytics.totalCount
    : '--';
  const percentageChange = sellerAnalytics
    ? sellerAnalytics.averageOfferGrowth.percentageChange
    : '--';
  const currentTotal = sellerAnalytics
    ? sellerAnalytics.averageOfferGrowth.currentTotal
    : '--';

  return (
    <section className='flex w-full flex-col justify-between overflow-hidden rounded-3xl bg-black px-12 py-16'>
      <div className='my-3 flex flex-row  flex-wrap justify-center  gap-y-4 md:justify-between'>
        <CustomProgressBar
          trackColor='white'
          indicatorColor='#e8804c'
          size={210}
          progress={30}
          trackWidth={10}
          indicatorWidth={10}
          spinnerMode={false}
          label={
            <>
              <p className='block text-center text-[2.5rem] font-bold text-white'>
                ${4500}
              </p>
              <p className='text-sm font-normal text-white'>Total Net Worth</p>
            </>
          }
        />

        <div className='flex flex-col items-end justify-end gap-5'>
          <div className='rounded-3xl bg-grey-570 px-8 text-white'>
            <p className='mb-0 mt-6 text-[2.5rem] font-medium leading-tight'>
              {41} %
            </p>
            <div className='flex items-center justify-between gap-x-12'>
              <span className='text-md'>Average Offer</span>
              <span className='flex flex-col items-center text-ocOrange'>
                <TrendingUpIcon className='h-6 w-8' />
                <span className='mb-5 text-[0.75rem]'>
                  +{60}%
                </span>
              </span>
            </div>
          </div>

          <Button
            className='px-8 py-5 text-sm md:text-sm'
            type='submit'
            variant='outline'
            roundness='full'
          >
            View Analytics
          </Button>
        </div>
      </div>
      <div className='mt-8 flex flex-row flex-wrap items-center justify-between gap-4 md:gap-x-2'>
        <PropertyDetail
          color='white'
          value={14}
          description={<span>Sell Properties</span>}
        />
        <PropertyDetail
          color='white'
          value={18}
          description={<span>Properties</span>}
        />
        <PropertyDetail
          color='white'
          value={4}
          description={<span> PendingProperties</span>}
        />
        {/* <EmptyPropertyInfo /> */}
        {/* <EmptyPropertyInfo /> */}
      </div>
    </section>
  );
};

const PropertyDetail = ({ value, description, color }: PropertyInfoProp) => {
  return (
    <div className='rounded-3xl bg-grey-570 p-11 text-white'>
      <div className='flex items-center gap-x-8'>
        <span className='text-[2.5rem] font-bold'>{value}</span>
        <span className='text-md'>
          <span>
            <span className='block'>Total</span>
            <span className='block'>{description}</span>
          </span>
        </span>
      </div>
    </div>
  );
};

export const EmptyPropertyInfo = () => {
  return (
    <div className='relative  overflow-hidden rounded-3xl bg-grey-570 p-[2.188rem] text-white'>
      <div className='relative'>
        <div className='mb-3 h-8 w-[11rem] rounded-full border-2 border-grey-110 bg-grey-110'></div>
        <div className='h-8 w-20 rounded-full border-2 border-grey-110 bg-grey-110'></div>
      </div>
    </div>
  );
};
