'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { updateBuyerOnboardingPreference } from '@/slices/onboarding/onboarding-slice';
import { buyerPropertyPreference } from '@/slices/onboarding/onboarding-selectors';

const PropertyType: React.FC = () => {
  const dispatch = useAppDispatch();
  const { propertyType } = useAppSelector(buyerPropertyPreference);

  const handleClick = React.useCallback(
    (value: string) => {
      dispatch(updateBuyerOnboardingPreference({ key: 'propertyType', value }));
    },
    [dispatch],
  );

  return (
    <div className='grid w-full grid-cols-2 gap-4'>
      {PropertyTypeData.map(({ id, value, label }) => (
        <Button
          key={id}
          variant='outline'
          onClick={() => handleClick(value)}
          className={cn(
            `w-full rounded-md px-4 py-6 text-black transition-all hover:bg-gray-200`,
            propertyType === value && ['bg-black text-white'],
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

export { PropertyType };

type PropertyTypeDataList = Array<PropertyTypeData>;
type PropertyTypeData = {
  id: string;
  label: string;
  value: string;
};

export const PropertyTypeData: PropertyTypeDataList = [
  {
    id: 'property-type-data-001',
    label: 'Single Family home',
    value: 'Single Family Home',
  },
  {
    id: 'property-type-data-002',
    label: 'Condomium',
    value: 'Condomium',
  },
  {
    id: 'property-type-data-003',
    label: 'Tenancy in Common',
    value: 'Tenancy in Common',
  },
  {
    id: 'property-type-data-004',
    label: 'Mobile Home',
    value: 'Mobile Home',
  },
  {
    id: 'property-type-data-005',
    label: 'Land',
    value: 'Land',
  },
];
