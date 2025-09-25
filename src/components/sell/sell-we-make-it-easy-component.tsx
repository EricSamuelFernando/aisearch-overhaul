'use client';

import Image from 'next/image';

import { WeMakeItEasySectionData } from '@/interfaces/card.interface';

interface WeMakeItEasyComponentProp {
  data: WeMakeItEasySectionData[];
}

const SellWeMakeItEasyComponent = ({
  data = [],
}: WeMakeItEasyComponentProp) => {
  return (
    <div className=' make-it-easy-component mx-auto  justify-center flex w-full flex-col gap-6 overflow-x-auto'>
    {data.map(({ Icon, description, title }) => (
      <div
        key={title}
        className='flex   border-t border-[#00000099]  gap-12 py-12 justify-start items-center  md:basis-1/2  lg:basis-1/4'
      >
        <Image
          src={Icon}
          width={80}
          height={80}
          className='h-16 w-16 2xl:h-28 2xl:w-28'
          alt='icon-image'
        />
        <h4 className='h-16 w-72 px-12 whitespace-pre-line text-xl font-medium leading-8'>
          {title}
        </h4>
        <p className='text-md text-[#5F5F5F] w-96 leading-6'>{description}</p>
      </div>
    ))}
  </div>
  );
};

export default SellWeMakeItEasyComponent;
