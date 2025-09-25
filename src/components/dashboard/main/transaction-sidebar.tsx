'use client';

import React, { ReactNode } from 'react';

import { humanKey } from '../../../../public/assets/images';
import PropertyList from '../agent/property-list';
import ToursList from './tours-list';
import SharePropertyModal from '@/components/modals/share-property-modal';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';
import { truncateText } from '@/lib/utils';

interface TransactionSidebarProps {
  address?: string;
  imageSource?: string;
  buttons?: ReactNode;
  moreAddressDetails?: string;
}

const TransactionSidebar: React.FC<TransactionSidebarProps> = ({
  moreAddressDetails,
  address,
}) => {
  const router = useRouter();
  const claimedProperty = useSelector((state:any)=>state?.property?.claimProperty)
  const propertyId = useSearchParams().get('id') || '';
  const property_info = useSelector(selectPropertyInformation);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openSharePropertyModal = () => {
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (propertyId) {
      router.push(`/dashboard/seller/listing/edit?id=${propertyId}`);
    }
  };

  return (
    <div>
      <div>
        <PropertyList
          actionBtn={
            <aside className='mt-14 text-xs'>
              <div className='mb-2 flex gap-x-2'>
                <Button
                  roundness='full'
                  className='w-full border border-white'
                  onClick={openSharePropertyModal}
                >
                  Share Property
                </Button>

                <Button roundness='full' className='w-full border border-white'>
                  Video Tour
                </Button>
                <Button
                  variant='outline'
                  roundness='full'
                  className='w-full text-black'
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
              </div>
            </aside>
          }
          className={''}
          title={
            truncateText(
              claimedProperty?.address,
              60,
            ) || '212 1527th Ky Gray,'
          }
          description={
            claimedProperty?.name ||
            'Kentucky(KY), 40734'
          }
          img={humanKey}
          variant={'dark'}
          imageSource={claimedProperty?.image}
        />
      </div>
      <div className='my-6'>
        <ToursList />
      </div>
      {isModalOpen && (
        <SharePropertyModal
          onClose={() => setIsModalOpen(false)}
          propertyId={propertyId}
        />
      )}
    </div>
  );
};

export default TransactionSidebar;
