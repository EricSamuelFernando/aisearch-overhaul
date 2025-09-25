import { useEffect, useState } from "react";

const AnimatedCounter = ({ target = 1000, duration = 2000 }: { target: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const increment = Math.ceil(end / (duration / 16)); // ~60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <div className="text-white text-4xl sm:text-5xl font-bold tracking-tight animate-fadeInUp">
      {count.toLocaleString()}+
      <p className="text-lg text-gray-400 mt-1">People joined Snaphomz Waitlist</p>
    </div>
  );
};

export default AnimatedCounter;