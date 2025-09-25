'use client';
import * as React from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';

import CustomMap from '@/components/custom-map';
import SkeletonLoader from '@/components/skeleton-loader';

import { NewFeatureCard } from '@/components/buy/preview/feature-card';
import { PropCardLoader } from '../buy-property-card-loader';
import { BuyTab } from '../buy-tab';
import BuyTable from '../buy-table';
import ItemNav from './ItemNav';
import {
  HeroCarousel,
  HeroHighlights,
  ListingAgentCard,
} from '../preview-hero';
import { useProperty } from '@/shared/hooks/useProperty';
import { Badge } from '@/components/ui/badge';

const MLSPropertyPreview: React.FC = () => {
  const leftSection = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);

  const [isCardIntersecting, setIsCardIntersecting] = React.useState(false);
  const { propertyId: id = '' } = useParams<{
    propertyId: string;
    item: string;
  }>();

  const { mlsProperty } = useProperty();

  React.useEffect(() => {
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          setIsCardIntersecting(true);
        } else {
          setIsCardIntersecting(false);
        }
      });
    };

    const observerOptions = {
      root: null,
      threshold: 0,
      rootMargin: '-50px',
      triggerOnce: true,
    };
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const leftCard = leftSection.current;
    const cardContainer = cardRef.current;

    if (leftCard && cardContainer) {
      observer.observe(leftCard);
      observer.observe(cardContainer);
    }

    return () => {
      if (leftCard && cardContainer) {
        observer.unobserve(leftCard);
        observer.unobserve(cardContainer);
      }
    };
  }, []);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
      window.location.hash = 'overview';
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

  const transformData = React.useMemo(() => {
    const mls = mlsProperty?.ListingKey === id ? mlsProperty : {};
    return {
      display: Boolean(Object.keys(mls).length),
      mls,
    };
  }, [mlsProperty, id]);

  return (
    <>
      <ItemNav cardRef={cardRef} />
      <div className='mt-24' />
      {loading ? (
        <div className='grid grid-flow-row place-items-center gap-6 md:h-[28rem] md:grid-cols-12 md:gap-7'>
          <SkeletonLoader className='h-[392px] w-full bg-gray-400 md:col-span-9' />
          <div className='h-[392px] w-full md:col-span-3'>
            <PropCardLoader className='h-full w-full' />
          </div>
        </div>
      ) : transformData.display ? (
        <div className='grid grid-flow-row gap-6 md:h-[28rem] md:grid-cols-12 md:gap-7'>
          <HeroCarousel
            className='h-[28rem] md:col-span-9'
            imageURLs={
              transformData.mls?.Media?.map((media: any) => media.MediaURL) || [
                '',
              ]
            }
          />

          <HeroHighlights
            schoolDistrict={transformData.mls.HighSchoolDistrict!}
            offerTerms={transformData.mls.ListingAgreement!}
            className='h-[28rem] md:col-span-3'
            id={id}
          />

          <div className='md:col-span-9 md:-mt-4 md:h-[28rem]'>
            <div className='mt-2 flex w-full justify-between'>
              <div>
                <div className='inline-flex items-center space-x-3'>
                  <h2 className='text-3xl font-bold'>{`$ ${transformData.mls?.ListPrice?.toLocaleString('en-US')}`}</h2>
                  <Badge
                    variant='outline'
                    className='h-max border-ocLightOrange bg-ocLightOrange px-8 text-ocYellow-150'
                  >
                    {transformData.mls.StandardStatus}
                  </Badge>
                </div>

                <h4 className='py-2 text-lg font-medium leading-5'>
                  {transformData.mls.PropertySubType}
                </h4>
                <p className='truncate text-clip text-base font-thin leading-6'>{`${transformData.mls?.UnparsedAddress?.split(',')[1]}, ${transformData.mls?.UnparsedAddress?.split(',')[2]}`}</p>
              </div>
              <div className='flex justify-between gap-x-10 border-y-[1px] border-y-[#EAEAEA] py-4'>
                <div className='text-center'>
                  <h2 className='text-xl font-bold text-black'>
                    {transformData.mls.BedroomsTotal}
                  </h2>
                  <span className='text-sm text-[#B5B5B5]'>Bedrooms</span>
                </div>
                <div className='flex-1 border-x-[1px] border-x-gray-200 px-6 text-center'>
                  <h2 className='text-xl font-bold text-black'>
                    {transformData.mls.BathroomsTotalInteger}
                  </h2>
                  <span className='text-sm text-[#B5B5B5]'>Bathroom</span>
                </div>

                <div className='text-center'>
                  <h2 className='text-xl font-bold text-black'>
                    {transformData.mls?.LotSizeSquareFeet?.toLocaleString(
                      'en-US',
                    )}
                  </h2>
                  <span className='text-sm text-[#B5B5B5]'>Sqft</span>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between gap-x-2 py-8'>
              <button className='flex h-max flex-1  items-center gap-x-2 rounded-md bg-[#F4F4F4] px-4 py-3 text-left font-light text-black hover:bg-black/40'>
                <Image
                  alt='bed'
                  height={24}
                  width={30}
                  src='/assets/images/bed-black.svg'
                />
                <p className='text-lg'> {transformData.mls.PropertyType}</p>
              </button>
              <button className='flex h-max flex-1  items-center gap-x-2 rounded-md bg-[#F4F4F4] px-4 py-3 text-left font-light text-black hover:bg-black/40'>
                <Image
                  alt='bed'
                  height={24}
                  width={24}
                  src='/assets/images/calendar.svg'
                />
                <p className='text-lg'>
                  Built in {transformData.mls.YearBuilt}
                </p>
              </button>{' '}
              <button className='flex h-max flex-1  items-center gap-x-2 rounded-md bg-[#F4F4F4] px-4 py-3 text-left font-light text-black hover:bg-black/40'>
                <Image
                  alt='bed'
                  height={24}
                  width={24}
                  src='/assets/images/area-black.svg'
                />
                <p className='text-lg'>
                  ${' '}
                  {(
                    (transformData.mls?.ListPrice || 0) /
                    (transformData.mls?.LotSizeSquareFeet || 0)
                  ).toFixed(0) || 0}{' '}
                  Price/Sqft
                </p>
              </button>
            </div>
            {/** BREAK LINE */}
            <span className='block h-[.8px] w-full bg-grey-850'></span>

            <div className='space-y-4 py-8 text-justify text-sm'>
              <h2 className='text-3xl font-bold'>About This Home</h2>
              <p className='whitespace-pre-line'>
                {transformData.mls.PublicRemarks}
              </p>
            </div>
            {/** BREAK LINE */}
            <span className='block h-[.8px] w-full bg-grey-850'></span>

            {/** LOCATION */}
            <section className='py-8' id='location'>
              <div className='pb-8'>
                <h1 className='text-2xl font-bold'>Location</h1>
                <div className='flex items-center gap-x-1 py-4 text-sm font-medium'>
                  <span>{transformData.mls.CountyOrParish}</span>
                  <span className='font-bold'>&gt;</span>
                  <span>{transformData.mls.City}</span>
                  <span className='font-bold'>&gt;</span>
                  <span>{transformData.mls.StreetName}</span>
                </div>
              </div>

              <div>
                <div className='h-[350px]'>
                  <CustomMap
                    coord={[
                      {
                        lat: transformData.mls?.Coordinates?.[0] || 36.778,
                        lng: transformData.mls?.Coordinates?.[0] || -119.417,
                        id:"",
                        price:""
                      },
                    ]}
                    height='400px'
                    zoom={18}
                  />
                </div>
              </div>
            </section>

            {/** FEATURES or PROPERTY */}
            <section id='property' className='py-8'>
              <h2 className='py-6 text-2xl font-bold'>Home Features</h2>
              <div className='grid w-full grid-cols-3 gap-4 text-sm text-grey-350'>
                <NewFeatureCard />
                <NewFeatureCard />
                <NewFeatureCard />
              </div>
            </section>

            {/** PROPERTY ANALYSIS */}
            <section id='analysis' className='my-8'>
              <h2 className='mb-4 text-2xl font-bold'>Property Analysis</h2>
              <div className='w-full'>
                <BuyTab />
              </div>
            </section>

            {/** SCHOOLS NEARBY */}
            <section id='schools' className='my-8 h-fit w-full'>
              <h2 className='mb-4 text-2xl font-bold'>Schools Near by</h2>
              <BuyTable />
            </section>
          </div>
          <ListingAgentCard
            agentName={transformData.mls.ListAgentFullName}
            className={`h-fit md:col-span-3 md:-mt-4 ${transformData.mls?.StandardStatus?.toLowerCase() === 'sold' ? 'bg-grey-170' : ''}`}
          />
        </div>
      ) : (
        <div className='h-full w-full'>{notFound()}</div>
      )}
    </>
  );
};

export { MLSPropertyPreview };
