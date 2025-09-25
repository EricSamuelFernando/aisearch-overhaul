import { cn } from '@/lib/utils';

import React from 'react';
import ProfileCircle from './profile-circle';

interface ContactCardProps {
  name: string;
  email: string;
  phone: string | number;
  license: string;
  profilePlaceholder: string;
  profileClassName?: string;
  nameClassName?: string;
  emailClassName?: string;
  phoneClassName?: string;
  licenseClassName?: string;
  containerClassName?: string;
  detailsContainerClassName?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({
  name,
  email,
  phone,
  license,
  profilePlaceholder,
  profileClassName,
  nameClassName,
  emailClassName,
  phoneClassName,
  licenseClassName,
  containerClassName,
  detailsContainerClassName,
}) => {
  return (
    <section className={cn('flex items-start gap-4', containerClassName)}>
      <ProfileCircle
        placeholder={profilePlaceholder}
        className={cn('h-10 w-10 text-xs', profileClassName)}
      />
      <section className={cn('flex flex-col gap-1', detailsContainerClassName)}>
        <p className={cn('text-lg font-bold', nameClassName)}>{name}</p>
        <p className={cn('text-sm font-medium', emailClassName)}>{email}</p>
        <p className={cn('text-sm font-medium', phoneClassName)}>{phone}</p>
        <p
          className={cn('text-sm font-medium text-[#808080]', licenseClassName)}
        >
          License# {license}
        </p>
      </section>
    </section>
  );
};

export default ContactCard;
