import React from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import CustomButton from '@/components/custom-button';
import CustomInput from '@/components/customs/input';
import { useRouter } from 'next/navigation';
import { filter } from '../../../../public/assets/icons';
import { Button } from '../../ui/button';
import { Icons } from '@/components/icons';

type Props = {};

function PropertySearchFilter({}: Props) {
  const router = useRouter();

  return (
    <div className='my-10 flex items-center justify-between'>
      <div className='hidden w-1/4 md:block'></div>
      <div className='flex w-full flex-auto items-center gap-x-4 md:w-3/4'>
        <CustomInput
          placeholder='Search Property'
          leftSection={<Icons.Search className='h-4 w-4' />}
          className='w-full rounded-lg'
        />

        <Image className='mr-6 cursor-pointer' src={filter} alt={''} />
        <Button
          onClick={() => router.push('/dashboard/agent/add-property')}
          roundness='full'
          className='mt-6'
        >
          Add Property
        </Button>
      </div>
    </div>
  );
}

export default PropertySearchFilter;
