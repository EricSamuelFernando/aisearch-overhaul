import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Props = {
  close: () => void;
};

function CloseButton({ close }: Props) {
  return (
    <span
      onClick={close}
      className={cn('relative h-4 w-4 cursor-pointer font-light')}
    >
      <Image
        src='/assets/images/close.svg'
        objectFit='contain'
        fill
        alt='close'
      />
    </span>
  );
}

export default CloseButton;
