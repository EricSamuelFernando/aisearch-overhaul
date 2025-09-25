import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialTimeLeft: number;
}

interface UseTimer {
  timeLeft: number;
  startTimer: () => void;
  stopTimer: () => void;
}

const useTimer = ({ initialTimeLeft }: UseTimerOptions): UseTimer => {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedTime = localStorage.getItem('savedTime');
    if (savedTime) {
      const savedTimeInt = parseInt(savedTime, 10);
      const currentTime = Date.now();
      const timeDifference = currentTime - savedTimeInt;
      return initialTimeLeft - timeDifference > 0
        ? initialTimeLeft - timeDifference
        : 0;
    }
    return initialTimeLeft;
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!timerRef.current) {
      localStorage.setItem('savedTime', Date.now().toString());
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTimeLeft = prevTime - 1000;
          localStorage.setItem('savedTime', Date.now().toString());
          if (newTimeLeft <= 0) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
          }
          return newTimeLeft >= 0 ? newTimeLeft : 0;
        });
      }, 1000);
    }
  }, []);
  
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  return {
    timeLeft,
    startTimer,
    stopTimer,
  };
};

export default useTimer;
