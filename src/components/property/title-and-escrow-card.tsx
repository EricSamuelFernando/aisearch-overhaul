import React from 'react';
import Heading from '@/components/heading';
import { HeadingLevelTwo } from '@/components/heading';
import { cn } from '@/lib/utils';

type Props = {
  title?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
};

type CardItemProp = {
  title?: string;
  value?: string;
  titleClass?: string;
  valueClasss?: string;
};

const CardItem = ({
  title = 'First Name',
  value = 'James',
  titleClass = '',
  valueClasss = '',
}: CardItemProp) => {
  return (
    <div className='mb-2 w-full'>
      <p className={cn('text-md text-[#B0B0B0]', titleClass)}>{title}</p>
      <HeadingLevelTwo className={cn('text-lg font-semibold', valueClasss)}>
        {value}
      </HeadingLevelTwo>
    </div>
  );
};

export function TitleAndEscrowCard({title,firstName,lastName,middleName,email,phone}: Props) { 
  return (
    <>
      <section className='min-h-40 w-full space-y-6 rounded-xl bg-[#F7F2EB] px-10 py-8'>
        <Heading title={title||""} className='text-2xl font-semibold' />

        <div className='flex justify-between gap-x-4'>
          <div className='grid w-full flex-1 grid-cols-2'>
            <CardItem 
              title="First Name"
              value={firstName}
            />
            <CardItem 
              title='Last Name'
              value={lastName}
            />
            <CardItem 
            title='Middle Name'
            value={middleName}
            />
          </div>
          <div className='w-full flex-1'>
            <CardItem
              value={phone}
              valueClasss='font-normal text-lg'
              title='Mobile'
            />
            <CardItem
              title={email}
              value={email}
              valueClasss='font-normal text-lg'
            />
          </div>
        </div>
      </section>
    </>
  );
}
