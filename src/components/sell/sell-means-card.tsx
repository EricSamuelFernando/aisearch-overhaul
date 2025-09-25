'use client';

import Link from 'next/link';
import Image from 'next/image';

import { Button } from '../ui/button';

interface SellMeansCardProps {
  title: string;
  description: string;
  imagePath: string;
  linkPathname: string;
  linkText: string;
}
const SellMeansCard = ({
  title,
  description,
  imagePath,
  linkPathname,
  linkText,
}: SellMeansCardProps) => {
  return (
    <div className='flex h-[27.88rem] flex-col rounded-xl bg-[#0A0A0A] shadow-sm'>
      <div className='relative h-[45%] w-full flex-shrink-0 overflow-hidden rounded-t-xl'>
        <Image
          src={imagePath}
          className='object-cover'
          fill
          alt='means-image'
        />
      </div>

      <div className='flex h-full flex-col justify-between px-6 py-10 text-white'>
        <div className='space-y-4'>
          <h4 className='text-[2rem] font-medium capitalize leading-6'>
            {title}
          </h4>
          <p className='text-lg'>{description}</p>
        </div>

        <Button className='flex w-fit items-center justify-start rounded-full border border-white bg-[#0A0A0A] px-8 font-medium text-white'>
          <Link href={linkPathname} rel='norefferer'>
            {linkText}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SellMeansCard;
