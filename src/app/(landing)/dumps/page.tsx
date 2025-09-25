import React from 'react';
import { Button } from '@/components/ui/button';

type Props = {};

function Dumps({}: Props) {
  return (
    <div className='grid min-h-screen grid-cols-2 gap-x-10 py-20'>
      <div className='max-w-[400px] space-y-2 px-4 py-20'>
        <Button className='w-full' roundness='full'>
          Round Button
        </Button>

        <Button className='w-full' roundness='md'>
          Round Button
        </Button>

        <Button className='w-full'>Default Button</Button>
        <Button className='w-full' variant='ocreal'>
          Ocreal Button
        </Button>

        <Button className='w-full' variant='secondary'>
          Secondary Button
        </Button>

        <Button className='w-full' variant='destructive'>
          Secondary Button
        </Button>

        <Button className='w-full' variant='outline'>
          Secondary Button
        </Button>

        <Button className='w-full' variant='link'>
          Link Button
        </Button>

        <Button className='w-full' variant='ghost'>
          Ghost Button
        </Button>
      </div>

      <div className='max-w-[400px] space-y-2 px-4 py-20'>
        <Button className='w-full' roundness='full'>
          Round Button
        </Button>

        <Button className='w-full' roundness='md'>
          Round Button
        </Button>

        <Button className='w-full'>Default Button</Button>
        <Button disabled className='w-full' variant='ocreal'>
          Ocreal Button
        </Button>

        <Button className='w-full' variant='secondary'>
          Secondary Button
        </Button>

        <Button className='w-full' variant='destructive'>
          Secondary Button
        </Button>

        <Button className='w-full' variant='outline'>
          Secondary Button
        </Button>

        <Button className='w-full' variant='link'>
          Link Button
        </Button>

        <Button className='w-full' variant='ghost'>
          Ghost Button
        </Button>
      </div>
    </div>
  );
}

export default Dumps;
