'use client';
import Image from 'next/image';

import { ChooseYourMeansCardProps } from '@/interfaces/card.interface';
import { Button } from '../ui/button';
import Link from 'next/link';

const MeansCard = ({
  title,
  description,
  imagePath,
  linkPathname,
  buttonTitle
}: ChooseYourMeansCardProps) => {
  return (
    <div className='col-span-1 gap-5 rounded-xl rounded-t-xl bg-primary-100 shadow-sm focus:shadow-sm'>
      <div className='relative h-60 w-full overflow-hidden rounded-t-xl'>
        <Image
          src={imagePath}
          className='object-cover object-center'
          fill
          alt={`${title} | ${description}`}
          quality={75}
        />
      </div>
      <div className='flex flex-col items-center space-y-4 pb-10 pt-6 text-black'>
        <h4 className='text-[2rem] font-medium leading-6'>{title}</h4>
        <p className='text-lg'>{description}</p>
        <div></div>
        <Button className='w-48 font-medium' type='submit' roundness='full'>
          <Link href={linkPathname} rel='norefferer'>
            {buttonTitle}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export { MeansCard };
