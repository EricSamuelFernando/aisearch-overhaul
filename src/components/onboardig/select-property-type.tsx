'use client';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import React from 'react';
import { setPropertyType } from '../../slices/onboarding/property-preference';
export interface Button {
  title: string;
  value: string;
}

export const buttonList: Button[] = [
  { title: 'Single Family Home', value: 'Single Family Home' },
  { title: 'Condomium', value: 'Condomium' },
  { title: 'Tenancy in common', value: 'Tenancy in common' },
  { title: 'Mobile Home', value: 'Mobile Home' },
  { title: 'Land', value: 'Land' },
];

export function SelectPropertyType() {
  return (
    <section className='grid h-full  w-3/5 items-center py-10'>
      <div className='space-y-6'>
        <Heading
          className='sm:text-2xl md:text-3xl lg:text-3xl'
          title='Select Property Type'
        />

        <ButtonList />
      </div>
    </section>
  );
}

const ButtonList: React.FC = () => {
  const propertyType = useAppSelector(
    (state: RootState) => state.propertyPreference.propertyType,
  );
  const dispatch = useAppDispatch();

  const handleClick = (value: string) => {
    dispatch(setPropertyType(value));
  };

  return (
    <div className='grid w-full grid-cols-2 gap-4'>
      {buttonList.map((button: Button) => (
        <Button
          key={button.value}
          variant='outline'
          onClick={() => handleClick(button.value)}
          className={cn(
            `w-full rounded-md px-4  py-6 transition-all  hover:bg-none`,
            propertyType === button.value
              ? 'bg-black text-white'
              : 'text-black',
          )}
        >
          {button.title}
        </Button>
      ))}
    </div>
  );
};
