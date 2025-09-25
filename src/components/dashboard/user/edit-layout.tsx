'use client';

import React from 'react';
import SkeletonLoader from '@/components/skeleton-loader';
import { IProperty } from '@/interfaces/property.interface';
import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PropertyInfoCard } from './property-info-card';
import { EditPropertyFormProvider } from '../../../providers/edit-property-context';
import EditPropertyContent from '../main/seller-property-edit';
import { useSelector } from 'react-redux';
import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';

function EditLayout() {
  const property_info = useSelector(selectPropertyInformation);
  const propertyData = useSelector((state:any)=>state?.property?.claimProperty);
  console.log({ property_info });

  const params = useSearchParams();
  const id = params?.get('id');

  const { getSingleProperty } = useGetSingleProperty(id!);
  const property = getSingleProperty?.data?.data?.data?.property as IProperty;

  const loading = getSingleProperty.isLoading || getSingleProperty.isFetching;

  if (loading) {
    <div>
      <SkeletonLoader className='h-[400px] w-[300px]' />
      <SkeletonLoader className='h-[400px] w-[300px]' />
      <SkeletonLoader className='h-[400px] w-[300px]' />
    </div>;
  }
  console.log(propertyData)

  return (
    <EditPropertyFormProvider initialValues={property_info}>
      <section className='px-[3.219rem] py-6'>
        <section className='grid gap-x-8 md:grid-cols-2  lg:grid-cols-3'>
          <div className='cols-span-1 order-2 py-8 md:order-1 lg:col-span-2'>
            <EditPropertyContent />
          </div>
          <div className='order-1 col-span-1 mt-8 md:order-2'>
            <PropertyInfoCard />
          </div>
        </section>
      </section>
    </EditPropertyFormProvider>
  );
}

export default EditLayout;
