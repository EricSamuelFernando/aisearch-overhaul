import { truncateText } from '@/lib/utils';
import Image from 'next/image';
import { ReactNode } from 'react';

export const NotificationCard = ({ body }: { body: ReactNode }) => {
  const bodyText = typeof body === 'string' ? truncateText(body, 100) : body;

  return (
    <div className='flex w-full min-w-[350px] items-center gap-x-4 rounded-2xl bg-grey-50 p-4 py-8'>
      <div className='relative h-12 w-12'>
        <Image
          src='/assets/images/notification-bell.svg'
          objectFit='contain'
          fill
          alt='Agent'
        />
      </div>
      <p className='pr-8 text-grey-900'>{bodyText || ''}</p>
    </div>
  );
};
