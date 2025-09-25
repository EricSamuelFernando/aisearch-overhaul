'use client';

import React, { useState } from 'react';
import { Header } from '../../../components/sell/listingPreview/Header';
import { FeatureList } from '../../../components/sell/listingPreview/FeatureList';
import { HomeFeatures } from '../../../components/sell/listingPreview/HomeFeatures';
import { PropertyDetails } from '../../../components/sell/listingPreview/PropertyDetails';
import { PropertyOverview } from '../../../components/sell/listingPreview/PropertyOverview';
import { SchoolsNearby } from '../../../components/sell/listingPreview/SchoolsNearby';
import { Highlights } from '../../../components/sell/listingPreview/Highlights';
import { PropertyAgentCard } from '../../../components/sell/listingPreview/PropertyAgentCard';
import EmblaCarousel from '@/components/customs/carousel/embla-carousel';
import { Location } from '@/components/sell/listingPreview/Location';

import { ChartOptions } from 'chart.js';
import SellerLineChart from '@/components/agent-chart';

const ListingPreview = () => {
  const [activeTab, setActiveTab] = useState('Statistics');
  const [activeStatTab, setActiveStatTab] = useState(0);

  const lineChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const lineChartData = [
    {
      label: 'Average Sale Price',
      data: [1.47, 1.48, 1.49, 1.48, 1.49, 1.51, 1.55],
      fill: false,
      borderColor: '#000000',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    },
  ];
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value) {
            const numericValue =
              typeof value === 'string' ? parseFloat(value) : value;
            return `$${numericValue.toFixed(2)}m`;
          },
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 30,
        },
      },
    },
  };

  return (
    <section className='w-full overflow-hidden rounded-t-3xl px-12 pb-16 pt-8'>
      <Header />
      <section className='grid h-full grid-cols-3 gap-8 pt-10'>
        <div className='col-span-2'>
          <section className='embla__container h-[20rem] w-full rounded-xl bg-pink-100'>
            <EmblaCarousel
              slides={Array.from({ length: 5 }).map((_, index) => (
                <section className={`embla__slide h-40 w-full`} key={index}>
                  <section
                    className={`embla__slide__number h-full bg-red-${
                      index + 1
                    }00 w-full`}
                  ></section>
                </section>
              ))}
            />
          </section>
          <section className='pt-4'>
            <PropertyOverview />
            <FeatureList />
            <div className='my-10 border-[0.05rem] border-solid border-grey-850' />
            <PropertyDetails />
          </section>
          <div className='my-10 border-[0.05rem] border-solid border-grey-850' />
          <Location />
          <HomeFeatures />
          <SchoolsNearby />
          <h2 className='my-6 text-xl font-bold text-black'>
            Property Analytics
          </h2>
          <section className='mb-8 flex w-full items-center justify-between border-b border-solid border-[#707070]'>
            {['Statistics', 'Property Projections', 'Payment Calculation'].map(
              (item) => (
                <section
                  onClick={() => setActiveTab(item)}
                  className={`${
                    activeTab === item && 'boder-solid border-b-4 border-black'
                  } px-5 pb-3`}
                  key={item}
                >
                  <p className='text-md font-bold'>{item}</p>
                </section>
              ),
            )}
          </section>
          <h2 className='text-lg font-medium'>Estimated Home Value</h2>
          <p className='mb-8 text-md font-medium text-grey-230'>
            Range of Values: $1,473,000 - $1,554,412
          </p>
          <section className='border-[#707070} mb-12 flex w-full items-center justify-between border-b border-solid'>
            {[
              { name: 'Average Sale Price', value: '$1,518,000' },
              { name: 'Homes Sold', value: '6' },
              { name: 'Sale-to-list', value: '107.3%' },
            ].map((item, i) => (
              <section
                onClick={() => setActiveStatTab(i)}
                className={`${
                  activeStatTab === i &&
                  'boder-solid border-b-4 border-black bg-grey-550'
                } w-full px-5 py-3`}
                key={i}
              >
                <p className='text-lg font-bold'>{item.value}</p>
                <p className='text-xs font-medium text-grey-450'>{item.name}</p>
              </section>
            ))}
          </section>
          <SellerLineChart
            labels={lineChartLabels}
            datasets={lineChartData}
            options={lineChartOptions}
          />
        </div>
        <section>
          <Highlights />
          <PropertyAgentCard />
        </section>
      </section>
    </section>
  );
};

export default ListingPreview;
