import React from 'react';
import { Activity, DollarSign, SignalHigh } from 'lucide-react';
import Image from 'next/image';

type Props = {};

function TangibleInsight({}: Props) {
  return (
    <section className='mx-auto px-4 py-4 md:px-[3.219rem]'>
      <h2 className='pb-20 text-center text-4xl font-bold'>
        Tangible insights to aid decision making
      </h2>

      <div className='flex flex-col items-center justify-center gap-y-8 px-6 md:flex-row md:gap-y-0 md:px-0 '>
        <div className='flex flex-col items-center  gap-y-4'>
          <span className='relative  mx-auto mb-4 flex h-[50px] w-[50px] items-center justify-center  rounded-md text-center'>
            <Image
              src='/assets/images/stat.svg'
              alt={`test`}
              className='h-fit w-fit bg-no-repeat'
              fill
              style={{
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </span>

          <h3 className='font-bold'>Property Statistics</h3>
          <p className='text-center'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className='flex flex-col items-center  gap-y-4'>
          <span className='flex h-12 w-12 items-center justify-center  rounded-md bg-grey-310'>
            <Activity className='text-3xl font-bold text-ocBlue-100' />
          </span>

          <h3 className='font-bold'>Property Statistics</h3>
          <p className='text-center'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className='flex flex-col items-center  gap-y-4'>
          <span className='flex h-12 w-12 items-center justify-center  rounded-md bg-grey-330'>
            <DollarSign className='text-3xl font-bold text-ocBlue-50' />
          </span>

          <h3 className='font-bold'>Property Statistics</h3>
          <p className='text-center'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </section>
  );
}

export default TangibleInsight;
