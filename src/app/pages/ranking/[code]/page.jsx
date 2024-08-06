'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from '../../../../lib/utils';
import { useSocket } from '@/context/socketContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RankingPage() {
  const confettiRef = useRef(null);
  const router = useRouter();
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
      if (response.error) {
        console.error(response.error);
      } else {
        setRanking(response.ranking);
        setIsLoading(false);
      }
    };

    socket.on('redirectToFinalScreen', handleFinalRanking);


    const handleMainScreen = () => {
      toast('Eliminando jugador y redirigiendo a home', {
        onClose: () => {
          router.push('/')
        },
      })

    }
    socket.on('redirectToMainScreen', handleMainScreen);
    
    return () => {
      socket.off('redirectToFinalScreen', handleFinalRanking);
      socket.off('redirectToMainScreen', handleMainScreen);
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
        <ToastContainer />
    </> 
);
}
  return (
    <div className='flex flex-col p-2 h-auto items-center bg-black text-white w-full pt-20 min-h-screen'>
      <h1 className='uppercase font-bold text-xl md:text-2xl text-center mb-3'>Ranking</h1>
      <table className='w-full text-left'>
        <tbody className='w-full text-white flex flex-col justify-center items-center'>
          {ranking
            .slice(0, 10)
            .map((player, index) => (
              <tr
                key={index}
                className={`w-full max-w-xs md:max-w-md flex items-center justify-between p-2 ${player.socketId === socketId ? 'bg-yellow-200' : 'bg-white'} bg-opacity-40 rounded-md mb-1`}
              >
                <td className='flex items-center'>
                  {index === 0 && <p className="fas fa-trophy text-yellow-500 mr-2 text-lg">1</p>}
                  {index === 1 && <p className="fas fa-medal text-gray-400 mr-2 text-lg">2</p>}
                  {index === 2 && <p className="fas fa-medal text-amber-600 mr-2 text-lg">3</p>}
                  <span className='font-semibold text-xs md:text-sm'>{player.playerName}</span>
                </td>
                <td className='text-right font-bold text-yellow-500 text-xs md:text-sm'>{player.score}px</td>
              </tr>
            ))}
        </tbody>
      </table>
      <ToastContainer />
    </div>
)
}

export default RankingPage;
