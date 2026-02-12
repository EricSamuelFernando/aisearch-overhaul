'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/lib/hook';
import { updateBuyerOnboardingPreference } from '@/slices/onboarding/onboarding-slice';

const PropertyRange: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = React.useState('');

  const handleClick = React.useCallback(
    (value: { min: number; max: number }) => {
      dispatch(updateBuyerOnboardingPreference({ key: 'spendAmount', value }));
    },
    [dispatch],
  );

  return (
    <div className='grid w-full grid-cols-2 gap-4'>
      {PropertyPriceData.map(({ id, value, label }) => (
        <Button
          key={id}
          variant='outline'
          onClick={() => {
            handleClick(value);
            setSelected(label);
            if (selected === label) {
              setSelected('');
            }
          }}
          className={cn(
            `w-full rounded-md px-4 py-6 text-black transition-all hover:bg-gray-200`,
            selected === label && [
              'bg-black text-white hover:bg-black hover:text-white',
            ],
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

export { PropertyRange };

type PropertyPriceDataList = Array<PropertyTypeData>;
type PropertyTypeData = {
  id: string;
  label: string;
  value: {
    max: number;
    min: number;
  };
};

export const PropertyPriceData: PropertyPriceDataList = [
  {
    id: 'property-price-data-001',
    label: '$1M or less',
    value: {
      max: 1000000,
      min: 0,
    },
  },
  {
    id: 'property-price-data-002',
    label: '$1M - $1.2M',
    value: {
      min: 1000000,
      max: 1200000,
    },
  },
  {
    id: 'property-price-data-003',
    label: '$1.2M - $1.5M',
    value: {
      min: 1200000,
      max: 1600000,
    },
  },
  {
    id: 'property-price-data-004',
    label: '$1.5M - $2M',
    value: {
      min: 1200000,
      max: 1999999,
    },
  },
  {
    id: 'property-price-data-005',
    label: '$2M +',
    value: {
      min: 2000000,
      max: 4000000,
    },
  },
];
