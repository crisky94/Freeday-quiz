'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';
import { useSocket } from '@/context/socketContext';
import { useAuth } from '@/context/authContext';
import { Montserrat } from 'next/font/google';
import usePlayerSocket from '@/app/hooks/usePlayerSocket'; 
import CountdownBall from '@/app/components/CountdownBall';

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});

const PinPage = () => {
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [game, setGame] = useState(null);
  const [countdown, setCountdown] = useState(false);
  const socket = useSocket();
  const params = useParams();
  const gameId = params.gameId;
  const router = useRouter();
  const { user } = useAuth();

  usePlayerSocket({ socket, setPlayers, setCountdown });

  useEffect(() => {
    if (!socket) return;

    const fetchGame = async () => {
      socket.emit(
        'getGamesId',
        { gameId: parseInt(gameId, 10) },
        (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            setGame(response.game);
            console.log('Game data received:', response.game);

            socket.emit(
              'joinRoom',
              { code: response.game.codeGame },
              (joinResponse) => {
                if (joinResponse.error) {
                  console.error(joinResponse.error);
                } else {
                  console.log('Joined game successfully');
                }
              }
            );
          }
        }
      );
    };

    fetchGame();
  }, [gameId, socket]);

  useEffect(() => {
    if (!socket) return;

    const fetchPlayers = () => {
      socket.emit('getPlayers', { code: game?.codeGame }, async (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          const playersWithAvatars = await Promise.all(
            response.players.map(async (player) => {
              return { ...player };
            })
          );
          setPlayers(playersWithAvatars);
        }
      });
    };

    socket.on('connect', fetchPlayers);
    fetchPlayers();

    return () => {
      socket.off('getPlayers');
      socket.off('connect', fetchPlayers);
    };
  }, [socket, game?.codeGame]);

  const startGame = () => {
    if (!socket || !game) return;
    socket.emit('startGame', { code: game.codeGame });
    setCountdown(true);
  };

  const handleCountdownFinish = () => {
    if (players) {
      router.push(`/pages/page-game/${game.codeGame}`);
    }
    if (user) {
      router.push(`/pages/control-quiz/${game.id}`);
    }
  };

  if (!game) {
    return <div>Cargando...</div>;
  }

  return (
    <div className='mt-20 flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8'>
      <h1 className={`${montserrat.className} text-2xl sm:text-4xl uppercase font-bold text-color-primary text-center bg-hackBlack bg-opacity-90 p-2`}>
        {game.nameGame}
      </h1>
      <p className={`${montserrat.className} text-sm sm:text-base md:text-lg lg:text-xl uppercase font-bold text-center bg-hackBlack bg-opacity-90 mt-4 break-words w-full max-w-full`} style={{ wordBreak: 'break-word' }}>
        {game.detailGame}
        </p>
      <QRCode
        value={`http://localhost:3000/nick-name-form/${game.codeGame}`}
        className='bg-white p-2 rounded mt-4 w-full sm:w-auto'
      />
      <p className='bg-hackBlack p-2 rounded mt-4 text-lg sm:text-xl'>PIN: {game.codeGame}</p>
      <div className='flex flex-col sm:flex-row justify-between items-center w-full sm:w-auto'>
        <div className='m-2 sm:m-5 hoverGradiant bg-custom-linear p-2 rounded-md text-black'>
          <button onClick={startGame}>
            <span>Empezar Juego</span>
          </button>
        </div>
        <div className='m-2 sm:m-5 hoverGradiant bg-custom-linear p-2 rounded-md text-black'>
          <button onClick={() => setShowModal(!showModal)}>
            <span>{showModal ? 'Cerrar Jugadores' : 'Ver Jugadores'}</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className='modal bg-custom-linear p-1 flex flex-col justify-between items-center rounded'>
          <div className='bg-hackBlack p-3 rounded flex flex-col items-center'>
            <h2 className='text-xl sm:text-2xl'>Jugadores</h2>
            <ul className='w-full'>
              {players.map((player) => (
                <li key={player.socketId} className="grid grid-cols-3 gap-2 items-center py-2">
                  <div className={`${montserrat.className} text-base sm:text-xl text-hackYellow col-span-1 uppercase font-bold text-center`}>
                    {player.playerName}
                  </div>
                  <div className="col-span-1 flex justify-center"></div>
                  <div className='col-span-1 flex justify-center rounded-full' dangerouslySetInnerHTML={{ __html: player.avatar }} style={{ maxWidth: '60%', height: 'auto' }}>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {countdown && (
        <CountdownBall onCountdownFinish={handleCountdownFinish} />
      )}
    </div>
  );
};

export default PinPage;