'use client';

import React, { FC, RefObject, useEffect, useState } from 'react';
import { useClickOutside } from '@mantine/hooks';
import { cn } from '../../lib/utils';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right'; // Popover placement
  trigger?: 'click' | 'hover'; // Trigger event (click or hover)
  initialOpen?: boolean; // Initial open state (controlled mode)
  onOpen?: () => void; // Callback on open
  onClose?: () => void; // Callback on close
}

const Popover: FC<PopoverProps> = ({
  children,
  content,
  placement = 'top',
  trigger = 'click',
  initialOpen = false,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const clickRef = useClickOutside(() => setIsOpen(false));

  const ref = React.createRef<HTMLButtonElement>();

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
    onOpen?.();
  };

  useEffect(() => {
    const listener = trigger === 'hover' ? handleClickOutside : undefined;
    if (listener) {
      document.addEventListener('mousedown', listener);
    }

    return () => {
      if (listener) {
        document.removeEventListener('mousedown', listener);
      }
    };
  }, [trigger, isOpen]);

  const popoverClasses = `absolute z-10 rounded-lg shadow-md ${
    placement === 'top'
      ? 'top-0 left-0'
      : placement === 'bottom'
        ? 'bottom-12 left-0'
        : placement === 'left'
          ? 'top-0 left-0'
          : 'top-0 right-0'
  }`;

  return (
    <div className='relative'>
      <button
        ref={ref}
        type='button'
        onClick={handleTrigger}
        className='focus:outline-none'
      >
        {children}
      </button>
      {isOpen && (
        <div
          ref={clickRef}
          className={cn('w-full min-w-[300px]', popoverClasses)}
        >
          <div className='bg-white p-4'>{content}</div>
        </div>
      )}
    </div>
  );
};

export default Popover;
