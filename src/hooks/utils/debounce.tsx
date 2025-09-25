import { useRef, useEffect } from "react";

const useDebounce = <T extends (...args: any[]) => void>() => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounce = (func: T, wait: number) => {
    return (...args: Parameters<T>) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        func(...args);
      }, wait);
    };
  };

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return debounce;
};

export default useDebounce;
