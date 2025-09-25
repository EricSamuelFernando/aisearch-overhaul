import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SharePropertyMenu from '../dashboard/main/share-property-menu';

import { getAuthToken } from '@/lib/storage';
import { useSharedPropertyAPI } from '@/hooks/api/property/useSharedProperty';

interface SharePropertyModalProps {
  onClose: () => void;
  propertyId: string;
  propertyData?: any; // optional prop to pass MLS or fallback data
}

const SharePropertyModal: React.FC<SharePropertyModalProps> = ({
  onClose,
  propertyId,
  propertyData,
}) => {
  const [role, setRole] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');

  const { createSharedProperty: { mutate, isPending } } = useSharedPropertyAPI();
  

  console.log(propertyData)

  // Extract info from MLS data or fallback to empty values
  const mediaUrl = propertyData?.mls_data?.data?.media?.primaryListingImageUrl || '';
  const fullAddress = [
    propertyData?.mls_data?.data?.address?.unparsedAddress,
    propertyData?.mls_data?.data?.address?.countyOrParish,
    propertyData?.mls_data?.data?.address?.city,
    propertyData?.mls_data?.data?.address?.zipCode,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSubmit = () => {
    if (!role || !name || !email) {
      toast.error('Please complete all required fields.');
      return;
    }
    const data = {
      "createSharedPropertyInput": {
        "propertyId": propertyData?.id?.toString(),
        "propertyUrl": "https://example.com/property/dummy-property-id",
        "propertyImage": mediaUrl,
        "propertyAddress":fullAddress,
        "sharedUsers": [
          {
            "name":name,
            "email": email,
            "role": role,
            "message":message
          }
        ]
      }
    }
    // {
    //   propertyId:'',
    //   propertyUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/property/${propertyId}`,
    //   propertyImage: mediaUrl,
    //   propertyAddress: fullAddress,
    //   sharedUsers: [
    //     {
    //       name,
    //       email,
    //       role,
    //       message,
    //     },
    //   ],
    // }
    

    mutate(
     data,
      {
        onSuccess: () => {
          toast.success('Success! The property is now shared.');
          onClose();
        },
        onError: () => {
          toast.error('Unable to share the property.');
        },
      }
    );
  };

  const copyLink = () => {
    const url = `${process.env.NEXT_PUBLIC_DOMAIN}/property/${propertyId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Link copied to your clipboard.'))
      .catch(() => toast.error('Unable to copy the link.'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center rounded-md bg-gray-800 bg-opacity-50">
      <div className="relative mx-auto w-1/2 rounded-3xl bg-white px-12 py-12 shadow-md">
        <button
          className="absolute right-4 top-4 text-gray-600"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-8 text-3xl font-medium">Share Property Document</h2>

        <SharePropertyMenu
          options={[
            { value: 'Agent', label: 'Agent' },
            { value: 'Broker', label: 'Broker' },
            { value: 'Buyer', label: 'Buyer' },
          ]}
          selectedValue={role}
          onSelect={setRole}
        />

        <div className="my-6 flex w-full gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-grey-850 bg-grey-550 p-4 text-md outline-none"
            placeholder="Name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-grey-850 bg-grey-550 p-4 text-md outline-none"
            placeholder="Enter email address"
          />
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mb-6 w-full rounded-lg border border-grey-850 bg-grey-550 p-4 text-md text-black outline-none"
          rows={4}
          placeholder="Message"
          style={{ userSelect: 'none', resize: 'none' }}
        />

        <div className="flex justify-between space-x-12">
          <Button
            variant="outline"
            className="w-max rounded-full border border-black bg-white px-10 py-1 text-black"
            onClick={copyLink}
          >
            Copy Link
          </Button>
          <Button
            className="w-max rounded-full border border-black bg-black px-10 py-1 text-white"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharePropertyModal;
