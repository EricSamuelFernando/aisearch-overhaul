import { useEffect, useRef } from 'react';

/**
 * Runs an effect only once (similar to componentDidMount).
 */
export const useEffectOnce = (effect: () => void | (() => void)) => {
  const called = useRef(false);
  const cleanup = useRef<void | (() => void)>();

  useEffect(() => {
    if (!called.current) {
      cleanup.current = effect();
      called.current = true;
    }
    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
    };
  }, [effect]);
};
