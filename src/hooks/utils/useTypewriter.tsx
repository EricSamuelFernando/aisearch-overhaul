import { useState, useEffect, useRef, useCallback } from 'react';

const useTypewriter = (
  text: string,
  delay: number,
  typingDelay: number,
): string => {
  const [placeholder, setPlaceholder] = useState<string>('');
  const currentIndex = useRef<number>(0);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef<string>(text);

  const typePlaceholder = useCallback(() => {
    if (currentIndex.current <= textRef.current.length) {
      setPlaceholder(textRef.current.substring(0, currentIndex.current));
      currentIndex.current++;
    } else {
      clearInterval(intervalId.current as NodeJS.Timeout);
      setTimeout(() => {
        currentIndex.current = 0;
        setPlaceholder('');
        typePlaceholder();
      }, typingDelay);
    }
  }, [typingDelay]);

  useEffect(() => {
    intervalId.current = setInterval(() => {
      requestAnimationFrame(typePlaceholder);
    }, delay);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [delay, typePlaceholder]);

  useEffect(() => {
    // Handle text updates without re-running the effect
    textRef.current = text;
    setPlaceholder('');
    currentIndex.current = 0;
    typePlaceholder();
  }, [text, typePlaceholder]);

  return placeholder;
};

export default useTypewriter;
