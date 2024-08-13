'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';
import { useSocket } from '@/context/socketContext';
import { useAuth } from '@/context/authContext';
import { Montserrat } from 'next/font/google';
import usePlayerSocket from '../../../components/usePlayerSocket'; 
import User from '../../../components/User';

const monserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});

const PinPage = () => {
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [game, setGame] = useState(null);
  const socket = useSocket();
  const params = useParams();
  const gameId = params.gameId;
  const router = useRouter();
  const { user } = useAuth(User);

  useEffect(() => {
    if (!socket) return;
    console.log('Socket initialized:', socket);

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

  usePlayerSocket({ socket, setPlayers });

  const startGame = () => {
    if (!socket || !game) return;
    socket.emit('startGame', { code: game.codeGame });
    if (players) {
      router.push(`/pages/page-game/${game.codeGame}`);
    }
    if (user) {
      setTimeout(() => {
        router.push(`/pages/control-quiz/${game.id}`);
      }, 10000);
    }
  };

  if (!game) {
    return <div>Cargando...</div>;
  }

  return (
    <div className='mt-20 flex flex-col justify-between items-center'>
      <h1 className={`${monserrat.className} text-4xl uppercase bold bg-hackBlack bg-opacity-90`}>
        {game.nameGame}
      </h1>
      <p className={`${monserrat.className} text-xl uppercase bold bg-hackBlack bg-opacity-90`}>
        {game.detailGame}
      </p>
      <QRCode
        value={`http://localhost:3000/nick-name-form/${game.codeGame}`}
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
                <li key={player.socketId} className="grid grid-cols-3">
                  <div className={`${monserrat.className} text-xl text-hackYellow col-span-1 w-[20%] p-4 uppercase bold`}>
                    {player.playerName}
                  </div>
                  <div className="col-span-1 w-[60%] p-4"></div>
                  <div className="col-span-1 w-[20%] p-4">
                    {player.score}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinPage;
