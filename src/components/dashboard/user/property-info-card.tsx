'use client';

import React from 'react';

import { IProperty } from '@/interfaces/property.interface';
import {
  usePropertyApi,
  usePublishMutation,
} from '@/hooks/api/property/usePropertyApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditPropertyFormContext } from '../../../providers/edit-property-context';
import { UpdatePropertyCard } from './update-card';
import { Button } from '@/components/ui/button';
import CustomNativeSelect from '@/components/customs/select';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { success } from '@/components/alert/notify';
import { setClaimProperty } from '@/slices/property/property-slice';
import { useDispatch } from 'react-redux';

type Props = {};

const propertyStatusOptions = [
  { value: 'publish', label: 'Publish' },
  { value: 'unpublish', label: 'Unpublish' },
];

export function PropertyInfoCard({ }: Props) {
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const id = params?.get('id');
  const { methods } = useEditPropertyFormContext();
  const values = methods.getValues();
  const { updatePropertyMutation } = usePropertyApi();
  const [selectedStatus, setSelectedStatus] = React.useState<string>(
    values?.currentStatus || propertyStatusOptions[0].value,
  );
  const dispatch = useDispatch()
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || "https://ai.snaphomz.com"
  const [isSaved, setIsSaved] = React.useState<boolean>(false);
  const router = useRouter();
  const publishMutation = usePublishMutation(selectedStatus);

  const payload = {
    ...values,
    _id: id,
    lotSizeValue: values?.lotSizeValue?.toString() || '',
    price: {
      ...values.price,
      currency: '$',
    },
  };

  const { brokers, ...rest } = payload;

  const { control, register, watch } = methods;

  React.useEffect(() => {
    const subscription = watch(() => {
      setIsSaved(false);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const handleSubmit = async () => {
    setIsSaved(false);
    // console.log("PAyload : ", payload);
    // payload.listingId=payload.listingid;
    const response = await axios.put(`${AI_SEARCH_ENDPOINT}/api/update_mls_data`,payload);
    success({message:"Property details updated successfully"})
    dispatch(setClaimProperty(payload))
    router.push(`/dashboard/seller/listing/listingprocess?id=${payload.listingid}`)
  };

  return (
    <div className='mx-2 md:mx-4 xl:mx-8'>
      <UpdatePropertyCard />

      <div className='my-2 md:my-4 xl:my-8'>
        <CustomNativeSelect
          {...register('propertyStatus')}
          label='Property Status'
          data={propertyStatusOptions}
          type='text'
          size='md'
          handleChange={(val: string) => {
            setSelectedStatus(val);
            methods.setValue('propertyStatus', val);
          }}
          defaultValue={selectedStatus || propertyStatusOptions[0].value}
          withAsterisk
          className=''
        />
      </div>

      <div className='my-6 flex  gap-x-8'>
        <Button className='rounded-3xl bg-black px-14 py-2 text-white'>
          Preview
        </Button>

        <Button
          type='submit'
          onClick={handleSubmit}
          roundness='full'
          className='px-8'
          variant='outline'
        >
          {updatePropertyMutation.isPending || publishMutation.isPending
            ? 'Saving...'
            : isSaved
              ? 'Saved'
              : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
