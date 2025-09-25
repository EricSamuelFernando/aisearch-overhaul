import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

const CustomDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'left',
  className,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [isOpen]);

  const openDrawer = () => {
    setIsAnimating(true);
    gsap.to(drawerRef.current, {
      duration: 0.3,
      ease: 'power2.inOut',
      x: 0,
      y: 0,
      onComplete: () => setIsAnimating(false),
    });
  };

  const closeDrawer = () => {
    setIsAnimating(true);
    const distance = position === 'left' ? '-100%' : '100%';
    gsap.to(drawerRef.current, {
      duration: 0.3,
      ease: 'power2.inOut',
      x: position === 'left' ? '-100%' : '100%',
      y: 0,
      onComplete: () => setIsAnimating(false),
    });
  };

  const handleClose = () => {
    if (!isAnimating) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  return (
    <section>
      <div
        className='fixed left-0 top-0 z-40 h-full w-full bg-black bg-opacity-50'
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          display: isOpen ? 'block' : 'none',
        }}
      />
      <div
        className={cn(
          `fixed bottom-0 top-0 z-50 overflow-y-auto bg-[#f4e5d0d8] px-20 py-10 shadow-md transition-transform duration-100 ease-in-out`,
          position === 'left' ? 'left-0' : 'right-0',
          className,
        )}
        ref={drawerRef}
        style={{
          transform: `translateX(${position === 'left' ? '-100%' : '100%'})`,
        }}
      >
        {children}
      </div>
    </section>
  );
};

export default CustomDrawer;
