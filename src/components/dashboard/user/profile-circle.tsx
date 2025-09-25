import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type ProfileCircleProps = {
  image?: string;
  placeholder?: string;
  className?: string;
};

const ProfileCircle: React.FC<ProfileCircleProps> = ({
  image,
  placeholder = 'cs',
  className,
}) => {
  return (
    <section
      className={cn(
        'relative mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#D9D9D9] text-lg font-medium uppercase text-black',
        className,
      )}
    >
      {image ? (
        <Image src={image} alt='Profile' fill className='object-contain' />
      ) : (
        <p>{placeholder}</p>
      )}
    </section>
  );
};

export default ProfileCircle;
