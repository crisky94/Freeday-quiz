'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode.react';
import { Montserrat } from 'next/font/google';
import { useSocket } from '@/context/socketContext';

const monserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});

const GamePage = () => {
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [game, setGame] = useState(null);
  const socket = useSocket();

  const params = useParams();
  const gameId = params.gameId;

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

    socket.on('newPlayer', (newPlayer) => {
      console.log('New player received:', newPlayer);
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
    });

    return () => {
      socket.off('newPlayer');
    };
  }, [gameId, socket]);

  const startGame = () => {
    if (!socket || !game) return;
    socket.emit('startGame', { code: game.codeGame });
    // socket.emit('countdown', { code: game.codeGame });
  };

  if (!game) {
    return <div>Cargando...</div>;
  }

  return (
    <div className='mt-20 flex flex-col justify-between items-center'>
      <h1 className={`${monserrat.className} text-4xl uppercase bold`}>
        {game.nameGame}
      </h1>
      <p>{game.detailGame}</p>
      <QRCode
        value={`http://localhost:3000/nick-name-form/${gameId}`}
        className='bg-white p-2 rounded mt-4'
      />
      <p className='bg-black p-2 rounded mt-4'>PIN: {game.codeGame}</p>
      <div className='flex flex-row justify-between items-center'>
        <div className='m-5'>
          <button onClick={startGame} className='mt-5 codepen-button'>
            <span>Empezar Juego</span>
          </button>
        </div>
        <div className='m-5'>
          <button
            onClick={() => setShowModal(true)}
            className='mt-5 codepen-button'
          >
            <span>Ver Jugadores</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className='modal mt-6 flex flex-col justify-between items-center'>
          <h2 className='bg-black p-2 rounded'>Jugadores</h2>
          <ul>
            {players.map((player) => (
              <li key={player.socketId}>{player.playerName}</li>
            ))}
          </ul>
          <button
            onClick={() => setShowModal(false)}
            className='mt-5 codepen-button'
          >
            <span>Cerrar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
