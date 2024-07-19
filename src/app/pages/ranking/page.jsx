'use client';

import React, { useRef } from 'react';
import Confetti from '../../../lib/utils';

function RankingPage() {
  const confettiRef = useRef(null);

  return (
    <div className="relative flex flex-col items-center justify-center h-[400px] w-full rounded-lg  text-slate-500 uppercase sm:h-[500px] md:h-[600px] lg:h-[700px]">
      <p className="mb-4 text-center text-lg sm:text-xl md:text-2xl">Haz click en el texto</p>
      <span className="pointer-events-none whitespace-pre-wrap  bg-clip-text text-center text-4xl font-semibold leading-none text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl dark:from-white dark:to-slate-900/10 select-none">
        ¡Juego Completado!
      </span>

      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-0 w-full h-full"
        onClick={() => {
          confettiRef.current?.fire();
        }}
        options={{
          get angle() {
            return Math.random() * 360;
          },
        }}
      />
    </div>
  );
}

export default RankingPage;
