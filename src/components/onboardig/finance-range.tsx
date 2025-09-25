'use client';

import Heading from '@/components/heading';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { setSpendAmount } from '@/slices/onboarding/property-preference';
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
export interface Button {
  title: string;
  value: string;
  minMax: {
    min: number;
    max: number;
  };
}

export const buttonList: Button[] = [
  {
    title: '$1M or less',
    value: '$1M or less',
    minMax: {
      min: 0,
      max: 1000000,
    },
  },
  {
    title: '$1M - $1.2M',
    value: '$1M - $1.2M',
    minMax: { min: 1000000, max: 1200000 },
  },
  {
    title: '$1.2M - $1.5M',
    value: '$1.2M - $1.5M',
    minMax: { min: 1200000, max: 1600000 },
  },
  {
    title: '$1.5M - $2M',
    value: '$1.5M - $2M',
    minMax: { min: 1200000, max: 1600000 },
  },
  { title: '$2M +', value: '$2M +', minMax: { min: 2000000, max: 4000000 } },
];

export function FianceRange() {
  return (
    <section className='grid h-full max-w-2xl place-content-center space-y-6 py-10'>
      <Heading
        className='font-semibold sm:text-2xl md:text-3xl lg:text-3xl'
        title='How much are you planning to spend on your property?'
      />

      <ButtonList />
    </section>
  );
}

const ButtonList: React.FC = () => {
  const rangeText = useAppSelector(
    (state: RootState) => state.propertyPreference.rangeText,
  );
  const dispatch = useAppDispatch();

  const handleClick = ({
    min,
    max,
    rangeText,
  }: {
    min: number;
    max: number;
    rangeText: string;
  }) => {
    dispatch(
      setSpendAmount({
        max,
        min,
        rangeText,
      }),
    );
  };

  return (
    <div className='grid max-w-lg grid-cols-2 gap-4'>
      {buttonList.map((button: Button) => (
        <Button
          key={button.value}
          variant='outline'
          onClick={() =>
            handleClick({
              min: button.minMax.min,
              max: button.minMax.max,
              rangeText: button.value,
            })
          }
          className={cn(
            `w-full rounded-md px-4  py-6 transition-all  hover:bg-none`,
            rangeText === button.value ? 'bg-black text-white' : 'text-black',
          )}
        >
          {button.title}
        </Button>
      ))}
    </div>
  );
};
