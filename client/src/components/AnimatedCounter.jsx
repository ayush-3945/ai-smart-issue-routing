import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ target, duration = 1500, color = '#ffffff' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span style={{ fontSize: '38px', fontWeight: '900', color, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {count}
    </span>
  );
};

export default AnimatedCounter;