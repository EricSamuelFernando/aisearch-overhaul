'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { updateBuyerOnboardingPreference } from '@/slices/onboarding/onboarding-slice';
import { buyerPropertyPreference } from '@/slices/onboarding/onboarding-selectors';

const PropertyRange: React.FC = () => {
  const dispatch = useAppDispatch();
  const { spendAmount } = useAppSelector(buyerPropertyPreference);
  const [selected, setSelected] = React.useState('');

  // Restore selection when navigating back
  React.useEffect(() => {
    if (!spendAmount?.max) return;
    const match = PropertyPriceData.find(
      ({ value }) =>
        value.min === spendAmount.min && value.max === spendAmount.max,
    );
    if (match) {
      setSelected(match.label);
    }
  }, [spendAmount]);

  const handleClick = React.useCallback(
    (value: { min: number; max: number }, label: string) => {
      dispatch(updateBuyerOnboardingPreference({ key: 'spendAmount', value }));
      setSelected(label);
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
            handleClick(value, label);
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
