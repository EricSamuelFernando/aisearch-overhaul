'use client';

import { useEffect, useState } from 'react';
// Throttle hook
const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastValue, setLastValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(lastValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [lastValue, delay]);

  useEffect(() => {
    setLastValue(value);
  }, [value]);

  return throttledValue;
};
