import React from 'react';
import Image from 'next/image';

import Bed from '@public/assets/icons/bed.svg';
import Bath from '@public/assets/icons/bath.svg';
import Feet from '@public/assets/icons/feet.png';
import Ellipsis from '@public/assets/icons/ellipsis.svg';

export function convertUndefinedString(value: any) {
  if (value === 'undefined') {
    return undefined;
  }
  return value;
}

type IPropertyDetailsProps = {
  noOfBeds: string;
  noOfBaths: string;
  lotSizeValue: string;
  lotSizeUnit: string;
};

const PropertySnippetDetails: React.FC<IPropertyDetailsProps> = ({
  noOfBaths,
  noOfBeds,
  lotSizeValue,
  lotSizeUnit,
}) => {
  return (
    <section>
      <section className='mb-4 flex w-[70%] items-center justify-between'>
        <Image
          src={Bed}
          alt='Bed'
          className='object-contain'
          height={31}
          width={24}
        />
        <Image
          src={Bath}
          alt='Bath'
          className='object-contain'
          height={31}
          width={24}
        />
        <Image
          src={Feet}
          alt='Size'
          className='object-contain'
          height={31}
          width={24}
        />
      </section>
      <section className='flex w-4/5 items-center justify-between font-bold'>
        <p className='text-base text-[#F7F2EB]'>
          {`${convertUndefinedString(noOfBeds) ? noOfBeds : 0}`} Bed
        </p>
        <Image
          src={Ellipsis}
          alt='Dot'
          className='block object-contain'
          height={7}
          width={7}
        />
        <p className='text-base text-[#F7F2EB]'>
          {`${convertUndefinedString(noOfBaths) ? noOfBaths : 0}`} Bath
        </p>
        <Image
          src={Ellipsis}
          alt='Dot'
          className='block object-contain'
          height={7}
          width={7}
        />
        <p className='text-base text-[#F7F2EB]'>{`${convertUndefinedString(lotSizeValue) ? lotSizeValue : 0} ${lotSizeUnit ? lotSizeUnit : 'Sqft'}`}</p>
      </section>
    </section>
  );
};

export default PropertySnippetDetails;
