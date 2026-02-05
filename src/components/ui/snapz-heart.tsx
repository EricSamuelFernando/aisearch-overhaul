'use client';

import type { CSSProperties, MouseEventHandler } from 'react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import styles from './snapz-heart.module.css';

export type SnapzHeartButtonProps = {
  isActive?: boolean;
  size?: number;
  className?: string;
  iconClassName?: string;
  label?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function SnapzHeartButton({
  isActive = false,
  size = 16,
  className,
  iconClassName,
  label = 'Save to Snapz',
  disabled = false,
  onClick,
}: SnapzHeartButtonProps) {
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!burst) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setBurst(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [burst]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    setBurst(false);
    window.requestAnimationFrame(() => setBurst(true));
    onClick?.(event);
  };

  return (
    <button
      type="button"
      aria-pressed={isActive}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center p-0 leading-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      <span
        className={cn(styles.snapz, iconClassName)}
        data-active={isActive}
        data-burst={burst}
        style={{ '--snapz-size': `${size}px` } as CSSProperties}
      >
        <svg
          viewBox="0 0 24 24"
          className={styles.svgOutline}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          className={styles.svgFilled}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
        </svg>
        <svg
          viewBox="0 0 100 100"
          className={styles.svgCelebrate}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon points="10,10 20,20" />
          <polygon points="10,50 20,50" />
          <polygon points="20,80 30,70" />
          <polygon points="90,10 80,20" />
          <polygon points="90,50 80,50" />
          <polygon points="80,80 70,70" />
        </svg>
      </span>
    </button>
  );
}
