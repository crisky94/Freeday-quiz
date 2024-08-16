import React, { useEffect, useState } from 'react';
import { Montserrat } from 'next/font/google';

const monserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});

const PacManCountdown = ({ onCountdownFinish }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          if (onCountdownFinish) onCountdownFinish(); }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onCountdownFinish]);

  return (
    <div className="flex flex-col items-center space-x-2">
      <p className={`${monserrat.className} text-xl text-hackYellow`}>Listas para comenzar juego en:</p>
      <div className="flex space-x-2">
        {[...Array(Math.max(timeLeft, 0))].map((_, index) => (
          <div key={index} className="w-8 h-8 bg-custom-linear rounded-full"></div>
        ))}
      </div>
    </div>
  );
};

export default PacManCountdown;