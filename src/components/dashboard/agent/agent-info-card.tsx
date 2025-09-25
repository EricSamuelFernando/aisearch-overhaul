import React from 'react';
import Heading from '@/components/heading';
import Image from 'next/image';
import { Avatar } from '@mantine/core';
import CustomAvatar from '@/components/customs/avatar';
import { getInitials } from '@/lib/utils';
type AgentInfoCardProp = {
  mail?: string;
  profile?: string;
  address?: string;
  licence?: string;
  phone?: string;
  name?: string;
};

export const AgentInfoCard: React.FC<AgentInfoCardProp> = ({
  profile,
  address,
  licence,
  mail,
  phone,
  name,
}) => {
  return (
    <div className='flex items-start gap-x-4'>
      <CustomAvatar
            className='h-[2.4rem] w-[2.4rem] text-base text-white'
            alt='Jane Doe'
            size={'2.4rem'}
          > {
              profile ? 
              <img
              src={profile}
              alt="Profile Preview"
              className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
              /> 
            :   getInitials(name) || 'SH'
          }
         
          </CustomAvatar>
      
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
