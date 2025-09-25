import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

type Props = {};

function ManageDocument({}: Props) {
  return (
    <div className='flex items-center justify-end gap-x-8'>
      <Icons.Download className='h-6 w-6' />
      <Button className='md:w-[120px]' roundness='full' disabled>
        DocuSign
      </Button>
    </div>
  );
}

export default ManageDocument;
