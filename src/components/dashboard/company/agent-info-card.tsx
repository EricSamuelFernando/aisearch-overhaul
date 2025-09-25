import React from 'react';
import Heading from '@/components/heading';
import Image from 'next/image';
type AgentInfoCardProp = {
  mail?: string;
  address?: string;
  licence?: string;
  phone?: string;
  name?: string;
};

export const AgentInfoCard: React.FC<AgentInfoCardProp> = ({
  address,
  licence,
  mail,
  phone,
  name,
}) => {
  return (
    <div className='flex items-start gap-x-4'>
      <Image
        height={50}
        width={50}
        src='/assets/images/agent-demo.png'
        objectFit='contain'
        alt='Agent'
        className='rounded-fill object'
      />
      <div>
        <Heading title={name || 'Daniel Smith'} />
        <div className='h-14'>
          {mail ? (
            <a className='mt-2 block text-sm' href={`mailto:${mail}`}>
              {mail || 'Daniel.smith@ocreal.com'}
            </a>
          ) : null}
          {phone ? (
            <a className='my-2 block text-sm' href='tel:+616-2342-3245'>
              {phone || '+616 - 2342 - 3245'}
            </a>
          ) : null}{' '}
          {address ? (
            <span className='block pb-2 font-normal'>
              214 Glamor Street, Nashville, CA 39942
            </span>
          ) : null}
        </div>

        <span className='text-grey-990'>Licence# {licence || '2312324'}</span>
      </div>
    </div>
  );
};
