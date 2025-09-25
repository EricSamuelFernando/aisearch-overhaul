import Image from 'next/image';
import React from 'react';

interface StepItemProps {
  step: {
    title: string;
    description: string;
    icon: string;
    alt: string;
  };
  index: number;
  isActive: boolean;
  isLastItem: boolean;
  onClick: () => void;
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  index,
  isActive,
  onClick,
  isLastItem,
}) => (
  <li
    onClick={onClick}
    className={`relative flex-1 ${
      isLastItem && 'after:h-full after:w-[0.05rem]'
    } after:-z-1 after:absolute after:-bottom-11 after:right-4 after:bg-[#E5E5E5] after:content-[''] lg:after:right-5`}
  >
    <div className='flex items-start'>
      <div className='inline-flex w-9/12 flex-col items-end pb-8'>
        <h4 className='text-base font-bold text-black'>{step.title}</h4>
        <p className='mb-4 max-w-xs text-sm text-[#707070]'>
          {step.description}
        </p>
      </div>
      <span
        className={`aspect-square h-6 w-6 ${
          isActive ? 'bg-ocOrange' : 'bg-white'
        } ml-auto flex items-center justify-center rounded-full border-[0.05rem] border-transparent text-sm text-white lg:h-10 lg:w-10`}
      >
        <Image
          src={step.icon}
          alt={step.alt}
          height={18}
          width={18}
          className='object-contain object-center'
        />
      </span>
    </div>
  </li>
);

export default StepItem;
