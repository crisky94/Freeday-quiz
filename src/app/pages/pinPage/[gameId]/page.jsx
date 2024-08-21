'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';
import { useSocket } from '@/context/socketContext';
import { useAuth } from '@/context/authContext';
import { Montserrat } from 'next/font/google';
import usePlayerSocket from '../../../components/usePlayerSocket';
import PacManCountdown from '../../../components/PacManCountdown';

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

  // Use the custom hook
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

  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_IO || 'http://localhost:3000';

  return (
    <div className='mt-20 flex flex-col justify-between items-center'>
      <h1
        className={`${montserrat.className} text-4xl uppercase bold bg-hackBlack bg-opacity-90`}
      >
        {game.nameGame}
      </h1>
      <p
        className={`${montserrat.className} text-xl uppercase bold bg-hackBlack bg-opacity-90`}
      >
        {game.detailGame}
      </p>
      <QRCode
        value={`${baseUrl}/pages/nick-name-form/${game.codeGame}`}
        className='bg-white p-2 rounded mt-4'
      />
      <p className='bg-hackBlack p-2 rounded mt-4'>PIN: {game.codeGame}</p>
      <div className='flex flex-row justify-between items-center'>
        <div className='m-5 hoverGradiant bg-custom-linear p-2 rounded-md text-black'>
          <button onClick={startGame}>
            <span>Empezar Juego</span>
          </button>
        </div>
        <div className='m-5 hoverGradiant bg-custom-linear p-2 rounded-md text-black'>
          <button onClick={() => setShowModal(!showModal)}>
            <span>{showModal ? 'Cerrar Jugadores' : 'Ver Jugadores'}</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className='modal mt-6 bg-custom-linear p-1 flex flex-col justify-between items-center rounded'>
          <div className='bg-hackBlack p-2 rounded flex flex-col items-center'>
            <h2>Jugadores</h2>
            <ul>
              {players.map((player) => (
                <li key={player.socketId} className='grid grid-cols-3'>
                  <div
                    className={`${montserrat.className} text-xl text-hackYellow col-span-1 w-[20%] p-4 uppercase bold`}
                  >
                    {player.playerName}
                  </div>
                  <div className='col-span-1 w-[10%] p-4 flex justify-center'></div>
                  <div className='col-span-1 w-[70%] p-4 flex justify-center'>
                    <div
                      className='border-2 border-white rounded-full'
                      dangerouslySetInnerHTML={{ __html: player.avatar }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {countdown && (
        <PacManCountdown onCountdownFinish={handleCountdownFinish} />
      )}
    </div>
  );
};

export default PinPage;
