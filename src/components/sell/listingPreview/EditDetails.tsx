import Image from 'next/image';
import React from 'react';

function convertUndefinedString(value: string): string | undefined {
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

const EditDetails: React.FC<IPropertyDetailsProps> = ({
  noOfBaths,
  noOfBeds,
  lotSizeValue,
  lotSizeUnit,
}) => {
  return (
    <section>
      <section className='mb-4 flex w-[70%] items-center justify-between'>
        <Image
          src='/assets/images/icons/bed.svg'
          alt='Bed'
          className='object-contain'
          height={31}
          width={24}
        />
        <Image
          src='/assets/images/icons/bath.svg'
          alt='Bath'
          className='object-contain'
          height={31}
          width={24}
        />
        <Image
          src='/assets/images/icons/feet.png'
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
          src='/assets/images/icons/ellipse.svg'
          alt='Dot'
          className='block object-contain'
          height={7}
          width={7}
        />
        <p className='text-base text-[#F7F2EB]'>
          {`${convertUndefinedString(noOfBaths) ? noOfBaths : 0}`} Bath
        </p>
        <Image
          src='/assets/images/icons/ellipse.svg'
          alt='Dot'
          className='block object-contain'
          height={7}
          width={7}
        />
        <p className='text-base text-[#F7F2EB]'>{`${
          convertUndefinedString(lotSizeValue) ? lotSizeValue : 0
        } ${lotSizeUnit ? lotSizeUnit : 'Sqft'}`}</p>
      </section>
    </section>
  );
};

export default EditDetails;
