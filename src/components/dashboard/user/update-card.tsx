import { InfoCard } from '@/components/property-infocard';

import { useEditPropertyFormContext } from '@/providers/edit-property-context';
import { formatNumber } from '@/utils/math-utilities';
import { shortenAddress } from '@/lib/helpers';
import { useSelector } from 'react-redux';
import Image from 'next/image';

export function UpdatePropertyCard() {
  const { methods } = useEditPropertyFormContext();
  const values = methods.getValues();
  const propertyData = useSelector((state:any)=>state?.property?.claimProperty);

  const shortAddress = shortenAddress(
    values.propertyAddressDetails.formattedAddress,
  );

  return (
    <div>
      <div className='relative h-48 w-full rounded-t-lg'>
        <Image
          src={
            propertyData?.mls_data?.data?.media?.primaryListingImageUrl
              ? propertyData?.mls_data?.data?.media?.primaryListingImageUrl
              : '/assets/images/home.png'
          }
          alt={values?.propertyName || ''}
          className='h-full w-full rounded-t-xl bg-no-repeat'
          fill
          unoptimized
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* <div className='absolute top-6 left-4'>
          <InfoCard title={values?.currentStatus || ''} />
        </div> */}
      </div>
      <div className='min-h-[200px] rounded-b-xl bg-black py-6 pl-6 pr-6 text-white'>
        <div>
          <p className='mb-3 text-[1.7rem] font-semibold text-[#F7F2EB]'>
            <span>{formatNumber(propertyData?.property_detail?.data?.estimatedValue)}</span>
          </p>
          <p className='mb-8 mt-2 text-[1.2rem] font-normal text-grey-190'>
            {propertyData?.mls_data?.data?.address?.unparsedAddress}
          </p>
        </div>

        <section className='mt-3 flex w-[80%] items-center justify-between'>
          <Image
            src='/assets/images/bed.svg'
            alt='Bed'
            objectFit='contain'
            height={31}
            width={24}
          />
          <Image
            src='/assets/images/bath.svg'
            alt='Bath'
            objectFit='contain'
            height={31}
            width={24}
          />
          <Image
            src='/assets/images/feet.png'
            alt='Size'
            objectFit='contain'
            height={31}
            width={24}
          />
        </section>
        <section className='mt-2 flex items-center justify-between font-bold'>
          <p className='text-[1.20rem] text-grey-190'>
            {propertyData?.mls_data?.data?.property?.bedroomsTotal} Bed
          </p>
          <Image
            src='/assets/images/ellipse.svg'
            alt='Dot'
            objectFit='contain'
            height={7}
            width={7}
            className='block'
          />
          <p className='text-[1.20rem] text-grey-190'>
            {propertyData?.mls_data?.data?.property?.bathroomsTotal} Bath
          </p>
          <Image
            src='/assets/images/ellipse.svg'
            alt='Dot'
            objectFit='contain'
            height={7}
            width={7}
            className='block'
          />
          <p className='text-[1.20rem] text-grey-190'>
            {propertyData?.mls_data?.data?.property?.livingArea} {values.lotSizeUnit}
          </p>
        </section>
      </div>
    </div>
  );
}
