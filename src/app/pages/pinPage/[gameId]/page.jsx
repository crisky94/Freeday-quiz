'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/authContext';
import { Montserrat } from 'next/font/google';
import usePlayerSocket from '@/app/hooks/usePlayerSocket'; 
import CountdownBall from '@/app/components/CountdownBall';


const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});

const PinPage = () => {
  const [players, setPlayers] = useState([]); // Estado para almacenar la lista de jugadores.
  const [showModal, setShowModal] = useState(false);// Estado para controlar la visibilidad del modal de jugadores.
  const [game, setGame] = useState(null);// Estado para almacenar los detalles del juego.
  const [countdown, setCountdown] = useState(false);// Estado para controlar si la cuenta regresiva debe mostrarse.
  const socket = useSocket();
  const params = useParams();
  const gameId = params.gameId;
  const router = useRouter();
  const { user } = useAuth();


   // Hook personalizado para manejar eventos del socket relacionados con jugadores
  usePlayerSocket({ socket, setPlayers, setCountdown });

  useEffect(() => {
    if (!socket) return;

    const fetchGame = async () => {
      // Emite un evento al servidor para obtener los detalles del juego usando el gameId.
      socket.emit(
        'getGamesId',
        { gameId: parseInt(gameId, 10) },
        (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            setGame(response.game);// Almacena los detalles del juego en el estado.
            socket.emit(
              'joinRoom',// Emite un evento para unirse a la sala de juego usando el código del juego.
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

    fetchGame(); // Llama a la función fetchGame para iniciar la obtención de los detalles del juego.
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
    socket.emit('startGame', { code: game.codeGame }); // Emite un evento para iniciar el juego.
    setCountdown(true);// Activa la cuenta regresiva.
  };

  const handleCountdownFinish = () => {
    if (players) {
      router.push(`/pages/page-game/${game.codeGame}`);// Navega a la página del juego para los jugadores.
    }
    if (user) {
      router.push(`/pages/control-quiz/${game.id}`);// Navega a la página de control del quiz para el usuario autenticado.
    }
  };

  if (!game) {
    return <div>Cargando...</div>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_IO || 'http://localhost:3000';

  return (
    <div className='mt-20 flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8'>
      <h1 className={`${montserrat.className} text-2xl sm:text-4xl uppercase font-bold text-color-primary text-center bg-hackBlack bg-opacity-90 p-2`}>
        {game.nameGame}
      </h1>
      <p className={`${montserrat.className} text-sm sm:text-base md:text-lg lg:text-xl uppercase font-bold text-center bg-hackBlack bg-opacity-90 mt-4 break-words w-full max-w-full`} style={{ wordBreak: 'break-word' }}>
        {game.detailGame}
        </p>
      <QRCode
        value={`${baseUrl}/pages/nick-name-form/${game.codeGame}`}
        className='bg-white p-2 rounded mt-4'

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
