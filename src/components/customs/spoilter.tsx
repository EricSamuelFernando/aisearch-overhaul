import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

type SpoilerProps = {
  controlRef?: React.ForwardedRef<HTMLButtonElement>;
  hideLabel?: React.ReactNode;
  initialState?: boolean;
  maxHeight?: number;
  showLabel?: React.ReactNode;
  transitionDuration?: number;
  children?: React.ReactNode;
  className?: string;
};

const CustomSpoiler: React.FC<SpoilerProps> = ({
  controlRef,
  hideLabel,
  initialState = false,
  maxHeight = 100,
  showLabel,
  transitionDuration = 200,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const toggleSpoiler = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='relative'>
      <button
        ref={controlRef}
        onClick={toggleSpoiler}
        aria-expanded={isOpen}
        aria-controls='spoiler-content'
        className='block  cursor-pointer'
      >
        {isOpen ? hideLabel : showLabel}
      </button>
      <div
        id='spoiler-content'
        style={{
          maxHeight: `${maxHeight}px`,
          height: `${contentHeight}px`,
          transition: `height ${transitionDuration}ms ease`,
          overflow: 'hidden',
        }}
        ref={contentRef}
        className={cn('transition-height overflow-hidden', className)}
      >
        {children}
      </div>
    </div>
  );
};

export default CustomSpoiler;
