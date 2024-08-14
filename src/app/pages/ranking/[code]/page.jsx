'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from '../../../../lib/utils';
import { useSocket } from '@/context/socketContext';
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image';
import 'react-toastify/dist/ReactToastify.css';

function RankingPage() {
  const confettiRef = useRef(null);
  const router = useRouter();
  const [ranking, setRanking] = useState([]);
  const socket = useSocket();
  const [socketId, setSocketId] = useState();
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!socket) return;
    setSocketId(socket.id);
    // Listener para recibir el ranking final
    const handleFinalRanking = async (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        setRanking(response.ranking);
        setIsLoading(false);

        response.ranking.map(async (player) => {

          return { id: player.id };
        })
      }
    };

    socket.on('redirectToFinalScreen', handleFinalRanking);

    const handleMainScreen = () => {
      toast('Redirigiendo a home.', {
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
        <div className="relative flex flex-col items-center justify-center h-[400px] w-full rounded-lg  text-slate-600 uppercase sm:h-[500px] md:h-[600px] lg:h-[700px] min-h-screen bgroom">
          <p className="mb-4 text-center text-lg sm:text-xl md:text-2xl">Haz click en el texto</p>
          <span className="pointer-events-none whitespace-pre-wrap  bg-clip-text text-center text-4xl font-semibold leading-none text-primary sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl dark:from-white dark:to-slate-900/10 select-none ">
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
    <>
      <div className='flex flex-col p-2 h-auto items-center  bgroom text-white w-full pt-24 min-h-screen'>
        <h1 className='uppercase font-bold text-xl md:text-2xl text-center mb-3'>Ranking</h1>
        <table className='w-full text-left'>
          <tbody className='w-full text-white flex flex-col justify-center items-center'>
            {ranking
              .sort((a, b) => b.score - a.score)
              .slice(0, 8)
              .map((player, index) => (
                <tr
                  key={index}
                  className={`w-full max-w-xs md:max-w-md flex items-center justify-between p-2 ${player.socketId === socketId ? 'bg-yellow-200' : 'bg-white'} bg-opacity-40 rounded-md mb-1`}>
                  <td className='flex items-center'>
                    {index === 0 && <Image src='/corona1.png' width={20} height={20} />}
                    {index === 1 && <Image src='/corona2.png' width={20} height={20} />}
                    {index === 2 && <Image src='/corona3.png' width={20} height={20} />}
                    <div
                      className='border-2 border-white rounded-full ml-2 mr-6'
                      dangerouslySetInnerHTML={{ __html: player.avatar }}
                    />
                    <span className='font-semibold text-xs md:text-sm'>{player.playerName}</span>
                  </td>
                  <td className='text-right font-bold text-yellow-500 text-xs md:text-sm mr-2'>{player.score}px</td>
                </tr>
              ))}
          </tbody>
        </table>
        <ToastContainer />
      </div>
    </>
  )
}

export default RankingPage;
