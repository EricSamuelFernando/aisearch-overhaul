'use client';

import CustomAvatar from '@/components/customs/avatar';
import { IProperty } from '@/interfaces/property.interface';
import { getInitials } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import CustomButton from '@/components/custom-button';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  className?: string;
  trailColor?: string;
  textColor?: string;
  pathColor?: string;
  propertyInfo?: IProperty;
  type: 'listing' | 'buy-leads';
};

const AgentListingItem = ({ className, propertyInfo, type }: Props) => {
  const router = useRouter();

  const handleClick = (status: string) => {
    ['Pending', 'pending'].includes(propertyInfo?.status[0]?.status!)
      ? () => {}
      : router.push(
          `/dashboard/agent/property/${propertyInfo?._id}?type=${type}`,
        );
  };
  return (
    <div
      className={cn('rounded-3xl bg-grey-880 px-[9px] py-[12.5px]', className)}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <Image
            src={
              propertyInfo?.images[0]?.thumbNail ??
              propertyInfo?.images[0]?.url ??
              '/assets/images/Mask Group 86.jpg'
            }
            height={100}
            width={100}
            alt={`test`}
            className='rounded-md object-contain object-center'
          />
          <div className='ml-4 self-end'>
            <h4 className='line-clamp-2 text-sm font-bold text-black'>
              {propertyInfo?.propertyAddressDetails?.formattedAddress}
            </h4>
            <p className='text-xs font-light'>
              {propertyInfo?.propertyAddressDetails?.city},{' '}
              {propertyInfo?.propertyAddressDetails?.postalCode}
            </p>
          </div>
        </div>

        <div className='self-start'>
          <CustomAvatar className='bg-ocGrey-50 p-4 text-black' color='black'>
            {getInitials(
              propertyInfo?.seller?.firstname,
              propertyInfo?.seller?.lastname,
            )}
          </CustomAvatar>
        </div>
      </div>
      <div className='mx-4 my-6 h-[1px] bg-gray-300'></div>

      <aside className='flex items-center justify-between gap-x-2'>
        <Button
          onClick={() => handleClick(propertyInfo?.status[0]?.status!)}
          roundness='full'
          className='w-full'
          variant='outline'
        >
          {['Pending', 'pending'].includes(propertyInfo?.status[0]?.status!)
            ? 'Publish'
            : 'Open'}
        </Button>
        <Button variant='outline' roundness='full' className='w-full'>
          Share
        </Button>

        <Button variant='outline' roundness='full' className='w-full'>
          Leave
        </Button>

        {/* <CustomButton
          label={
            ['Pending', 'pending'].includes(propertyInfo?.status[0]?.status!)
              ? 'Publish'
              : 'Open'
          }
          onClick={() => handleClick(propertyInfo?.status[0]?.status!)}
          className="!border-black  !border py-1 text-white bg-black rounded-full w-full"
        /> */}
        {/* <CustomButton
          label="Share"
          className="!border-black !border py-1 text-black rounded-full w-full"
        /> */}
        {/* <CustomButton
          label="Leave"
          className="!border-black !border py-1 text-black rounded-full w-full"
        /> */}
      </aside>
    </div>
  );
};

export default AgentListingItem;
