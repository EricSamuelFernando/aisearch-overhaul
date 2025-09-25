import React from 'react';

import Image from 'next/image';
import { tourImage } from '@public/assets/images';

interface PropertyImageProps {
  alt: string;
}

const PropertyImage: React.FC<PropertyImageProps> = ({ alt }) => {
  return (
    <div className='relative h-[80px] w-[80px]'>
      <Image src={tourImage} alt={alt} layout='fill' objectFit='cover' />
    </div>
  );
};

export default PropertyImage;
