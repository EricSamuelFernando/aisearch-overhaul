'use client';

import CustomButton from '@/components/shared/custom-button';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { userIcon } from '@public/assets/icons';

const AgentOnboarding = () => {
  return (
    <section>
      <p className='mt-24 text-4xl font-medium text-black'>
        Choose Account Type
      </p>
      <p className='mb-20 text-xl font-normal text-[#ACACAC]'>
        To begin this journey, tell us what type of account you’d be opening.
      </p>
      <Button className='mb-6 flex h-[108px] w-full items-center justify-between border border-transparent bg-white p-4 px-8 py-1 text-black hover:border-[#FF8700] hover:bg-[#FFF3E4] active:border-[#FF8700] active:bg-[#FFF3E4]'>
        <div className='flex items-center gap-4'>
          <div className='rounded-lg bg-[#FF8700] p-3'>
            <Image
              src='/assets/icons/user.svg'
              alt='user'
              objectFit='contain'
              height={31}
              width={24}
            />
          </div>
          <div>
            <p className='text-left text-[20px] font-medium text-black'>
              OC-Snaphomz Agent/Broker
            </p>
            <p className='text-[18px] font-normal text-[#ACACAC]'>
              Personal account to manage all your activities.
            </p>
          </div>
        </div>
        <div>
          <Image
            src='/assets/icons/arrow-right.svg'
            alt='right-arrow'
            objectFit='contain'
            height={31}
            width={24}
          />
        </div>
      </Button>
      <Button className='flex h-[108px] w-full items-center justify-between border border-transparent bg-white p-4 px-8 py-1 text-black hover:border-[#FF8700] hover:bg-[#FFF3E4] active:border-[#FF8700] active:bg-[#FFF3E4]'>
        <div className='flex items-center gap-4'>
          <div className='rounded-lg border border-[#FF8700] bg-white p-3'>
            <Image
              src='/assets/icons/briefcase.svg'
              alt='user'
              objectFit='contain'
              height={31}
              width={24}
            />
          </div>
          <div>
            <p className='text-left text-[20px] font-medium text-black'>
              External Agent/Broker
            </p>
            <p className='text-[18px] font-normal text-[#ACACAC]'>
              Supervise agent-level licenses.
            </p>
          </div>
        </div>
      </Button>
    </section>
  );
};

export default AgentOnboarding;
