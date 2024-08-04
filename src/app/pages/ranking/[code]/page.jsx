// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import Confetti from '../../../../lib/utils';
// import RankingModal from '../../../components/RankingModal';
// import { useSocket } from '@/context/socketContext';

// function RankingPage() {
//   const confettiRef = useRef(null);
//   const [ranking, setRanking] = useState([]);
//   const socket = useSocket();
//   const [showRankingModal, setShowRankingModal] = useState(false);
//   // const code =123456;
  
//   useEffect(() => {
//     if (!socket) return;

//     const handleRedirectToFinalScreen = (data) => {
//       console.log(data);
//       setRanking(data.ranking); 
//       setShowRankingModal(true);
//     };

//     socket.on('redirectToFinalScreen', handleRedirectToFinalScreen);
//     return () => {
//       socket.off('redirectToFinalScreen', handleRedirectToFinalScreen);
//     };
//   }, [socket]);
   
//   return (
//     <>
//     <div className="relative flex flex-col items-center justify-center h-[400px] w-full rounded-lg  text-slate-600 uppercase sm:h-[500px] md:h-[600px] lg:h-[700px] min-h-screen bg-white bg-opacity-80">
//       <p className="mb-4 text-center text-lg sm:text-xl md:text-2xl">Haz click en el texto</p>
//       <span className="pointer-events-none whitespace-pre-wrap  bg-clip-text text-center text-4xl font-semibold leading-none text-[#111] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl dark:from-white dark:to-slate-900/10 select-none ">
//         ¡Juego Completado!
//       </span>

//       <Confetti
//         ref={confettiRef}
//         className="absolute left-0 top-0 z-0 w-full h-full"
//         onClick={() => {
//           confettiRef.current?.fire();
//         }}
//         options={{
//           get angle() {
//             return Math.random() * 360;
//           },
//         }}
//       />
//     </div>
//       <RankingModal ranking={ranking}/>     
//     </>
//   );
// }

// export default RankingPage;
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Confetti from '../../../../lib/utils';
import { useSocket } from '@/context/socketContext';

function RankingPage() {
  const confettiRef = useRef(null);
  const [ranking, setRanking] = useState([]);
  const socket = useSocket();
  const [socketId, setSocketId] = useState();
  const [isLoading, setIsLoading] = useState(true);
  // const code =123456;


  useEffect(() => {
    if (!socket) return;
    setSocketId(socket.id);
    // Listener para recibir el ranking final
    const handleFinalRanking = (response) => {
      console.log(response);
      if (response.error) {
        console.error(response.error);
      } else {
        setRanking(response.ranking);
        setIsLoading(false);
      }
    };

    socket.on('redirectToFinalScreen', handleFinalRanking);

    return () => {
      socket.off('redirectToFinalScreen', handleFinalRanking);
    };
  }, [socket]);

  if (isLoading) {
 
    return (
      <>
      <div className="relative flex flex-col items-center justify-center h-[400px] w-full rounded-lg  text-slate-600 uppercase sm:h-[500px] md:h-[600px] lg:h-[700px] min-h-screen bg-white bg-opacity-80">
        <p className="mb-4 text-center text-lg sm:text-xl md:text-2xl">Haz click en el texto</p>
        <span className="pointer-events-none whitespace-pre-wrap  bg-clip-text text-center text-4xl font-semibold leading-none text-[#111] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl dark:from-white dark:to-slate-900/10 select-none ">
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
    </>
 
);
}
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full pt-16">
      <div className='bg-custom-linear flex mb-2'>
        <div className='flex flex-col p-14 m-1 h-auto w-58 sm:w-full items-center bg-black gap-5'>
          <h1 className='uppercase font-bold text-xl text-center'>Ranking Final</h1>
          <ul className='w-full text-left text-black border'>
            {ranking
              .sort((a, b) => b.score - a.score)  // Ordenar de mayor a menor
              .map((player, index) => (
                <li key={index} className={`w-14 flex flex-col items-center p-1 mx-8 ${player.socketId === socketId ? 'text-secundary' : 'text-white'
                  }`}>
                  {player.playerName}: {player.score}
                </li>
              ))}
          </ul>
      <div className='text-xl font-bold text-center mt-4 text-yellow-500'>
         Gracias por jugar.
      </div>
        </div>
      </div>
    </div>)
}

export default RankingPage;
