'use client';

import AddFeatures from '@/components/dashboard/agent/add-features';
import AddManagers from '@/components/dashboard/agent/add-managers';
import ImageUploads from '@/components/dashboard/agent/image-uploads';
import PropertyAddress from '@/components/dashboard/agent/property-address';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useAgentProperty } from '@/hooks/api/agent/useAddAgentProperty';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

const AddAgentProperty = () => {
  const { filters, setFilter } = useAgentCreatePropertyContext();
  const { user } = useAuth();

  const { addProperty } = useAgentProperty();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const components: { [key: number]: ReactNode } = {
    1: <PropertyAddress />,
    2: <AddFeatures />,
    3: <AddManagers />,
    4: <ImageUploads />,
  };

  const progress: { [key: number]: string } = {
    1: 'w-16',
    2: 'w-64',
    3: 'w-96',
    4: 'w-full',
  };

  const disabledF1 =
    filters?.formattedAddress &&
    filters?.unit &&
    filters?.city &&
    filters?.state &&
    filters?.postalCode;

  const disabledF2 =
    filters?.bathroom &&
    filters?.bedroom &&
    filters?.price &&
    filters?.sqrFt &&
    filters?.propertyDescription;

  const disabledF3 = filters?.ownerDetails && filters?.email;

  const payload: any = {
    propertyAddressDetails: {
      formattedAddress: filters.formattedAddress!,
      city: filters?.city!,
      state: filters.state!,
      postalCode: filters?.postalCode!,
      // country: 'United States',
    },
    propertyName: filters.propertyName,
    videos: [],
    images: filters.images,
    lotSizeUnit: filters.sqrFt,

    numBathroom: filters.bathroom,
    numBedroom: filters.bedroom,
    propertyDescription: filters.propertyDescription,
    seller: user?.id,
  };

  const handleSaveAndExit = async () => {
    setSaving(true);
    try {
      await localStorage.setItem('agentProperty', JSON.stringify(filters));
      await router.push('dashboard/agent');
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className='my-4 h-screen'>
      {components[filters?.step!]}
      <div className='container flex items-center justify-between'>
        <div className='flex items-center gap-x-4'>
          {/* <CustomButton
            className="bg-black text-white rounded-full px-8 font-medium"
            disabled={filters.step! <= 1}
            onClick={() => {
              if (filters?.step === 4) {
                return; // process the form submission
              }
              setFilter({ field: 'step', value: filters?.step! - 1 });
            }}
            label="Cancel"
          /> */}
          <Button
            roundness='full'
            disabled={filters.step! <= 1}
            onClick={() => {
              if (filters?.step === 4) {
                return;
              }
              setFilter({ field: 'step', value: filters?.step! - 1 });
            }}
            className='w-full'
          >
            Cancel
          </Button>

          <Button
            variant='outline'
            roundness='full'
            disabled={filters.step! <= 1}
            onClick={handleSaveAndExit}
            className='w-full'
          >
            {saving && <ButtonLoader />}
            Save and Exit
          </Button>

          {/* <CustomButton
            label="Save and Exit"
            onClick={handleSaveAndExit}
            loading={saving}
            className="text-black border rounded-full px-8 border-black font-medium"
          /> */}
        </div>
        <div className='self-end'>
          <Button
            roundness='full'
            onClick={async () => {
              if (filters?.step === 4) {
                await addProperty.mutate(payload);
                return;
              }
              setFilter({ field: 'step', value: filters?.step! + 1 });
            }}
            disabled={
              (filters?.step === 1 && !disabledF1) ||
              (filters?.step === 2 && !disabledF2) ||
              (filters?.step === 3 && !disabledF3)
            }
            className='w-full'
          >
            {filters?.step === 4 ? 'Finish' : 'Next'}
          </Button>

          {/* <CustomButton
            loading={addProperty.isPending}
            className="bg-black text-white rounded-full px-20 font-medium disabled:bg-grey-450"
            onClick={async () => {
              if (filters?.step === 4) {
                await addProperty.mutate(payload);
                return;
              }
              setFilter({ field: 'step', value: filters?.step! + 1 });
            }}
            label={filters?.step === 4 ? 'Finish' : 'Next'}
            disabled={
              (filters?.step === 1 && !disabledF1) ||
              (filters?.step === 2 && !disabledF2) ||
              (filters?.step === 3 && !disabledF3)
            }
          /> */}
        </div>
      </div>
      <div className='my-10'>
        <div className='relative'>
          <div className='h-4 w-full bg-grey-880'></div>
          <div
            className={`absolute left-0 top-0  h-4 bg-primary-main ${
              progress[filters?.step!]
            } `}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default AddAgentProperty;
