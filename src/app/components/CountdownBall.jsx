import React, { useEffect, useState } from 'react';
import { Montserrat } from 'next/font/google';

const monserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});

const CountdownBall = ({ onCountdownFinish }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          if (onCountdownFinish) onCountdownFinish();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onCountdownFinish]);

  return (
    <div className='flex flex-col items-center space-x-2'>
      <p className={`${monserrat.className} text-xl text-hackYellow bg-[#111]`}>
        El Juego comenzará en:
      </p>
      <div className='flex gap-1 my-1'>
        {[...Array(Math.max(timeLeft, 0))].map((_, index) => (
          <div
            key={index}
            className='w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-8 lg:h-8 xl:w-8 xl:h-8 bg-custom-linear   flex justify-center items-center font-semibold text-black rounded-full'
          >
            <p className='text-center'>{timeLeft - index}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownBall;
