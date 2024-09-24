'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';
import BeforeUnloadHandler from '../../../components/closePage';
import CountdownBall from '@/app/components/CountdownBall';
import usePlayerSocket from '@/app/hooks/usePlayerSocket';
import { toast, Flip, ToastContainer } from 'react-toastify';

const WaitingRoom = ({ params }) => {
  const router = useRouter();
  const socket = useSocket();
  const [players, setPlayers] = useState([]);
  const code = parseInt(params.code);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [socketId, setSocketId] = useState('');
  const [countdown, setCountdown] = useState(false);

  useEffect(() => {
    const userNick = sessionStorage.getItem('nickname');
    if (!userNick) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (!socket) {
      router.push('/'); // Redirige a la página principal si no hay conexión al socket
    } else {
      setSocketId(socket.id); // Guarda el ID del socket si está disponible
    }
  }, [socket, router]);

  useEffect(() => {
    if (!code) {
      console.error('Code parameter is missing.');
      router.push('/'); //Redirige a la página principal si falta el código
      return;
    }

    const fetchGameInfo = async () => {
      try {
        const response = await fetch(`/api/game/${code}`); // Solicita información del juego al servidor
        const game = await response.json();

        if (response.ok) {
          setTitle(game.nameGame); // Establece el título del juego
          setDescription(game.detailGame || ''); // Establece la descripción del juego
        } else {
          console.error('Error fetching game info');
        }
      } catch (error) {
        console.error('Error fetching game info:', error);
      }
    };

    fetchGameInfo(); // Llama a la función para obtener la información del juego
  }, [code, router]);
  // Hook personalizado para manejar eventos del socket relacionados con jugadores
  usePlayerSocket({ socket, setPlayers, setCountdown });

  useEffect(() => {
    if (!socket) return;

    const fetchPlayers = () => {
      socket.emit('getPlayers', { code }, async (response) => {
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
    socket.on('connect', fetchPlayers); // Escucha el evento de conexión y actualiza los jugadores
    fetchPlayers();

    return () => {
      socket.off('getPlayers');
      socket.off('connect', fetchPlayers);
    };
  }, [socket, code]);

  const deletePlayer = useCallback(() => {
    if (!socket) return;

    const playerId = players.find((player) => player.socketId === socketId)?.id;
    if (!playerId) {
      console.error('Player ID not found');
      return;
    }
    // Función para eliminar un jugador de la sala
    socket.emit('deletePlayer', { playerId, code }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        sessionStorage.removeItem('pin');
        sessionStorage.removeItem('nickname');
        console.log('Player eliminado con éxito');
        router.push('/pages/access-pin'); // Redirigir a la página principal después de eliminar al jugador
      }
    });
  }, [socket, players, socketId, code, router]);
  // Maneja la finalización de la cuenta regresiva, redirigiendo a la página del juego
  const handleCountdownFinish = () => {
    router.push(`/pages/page-game/${code}`);
  };

  useEffect(() => {
    if (!socket) return;

    // Escuchar cuando un nuevo jugador se une a la partida
    socket.on('newPlayer', (player) => {
      // Mostrar un toast para todos los jugadores cuando alguien se une
      toast(`${player.playerName} se ha unido a la partida`, {
        position: 'top-right',
        autoClose: 2000,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Flip,
      });
    });

    // Cleanup: Limpiar los eventos cuando el componente se desmonte
    return () => {
      socket.off('newPlayer');
    };
  }, [socket]);

  return (
    <div className='w-screen min-h-screen  bgroom flex flex-col'>
      <ToastContainer />
      <BeforeUnloadHandler onBeforeUnload={deletePlayer} />
      <div className='h-auto flex flex-col mt-14 flex-wrap mx-6 '>
        <h1 className='text-primary font-extrabold text-4xl uppercase'>
          {title}
        </h1>
        <p className='text-wrap break-words w-full '>{description}</p>
      </div>
      <div className='flex flex-wrap  mt-4 gap-6 m-4 '>
        {players.map((player) => (
          <div
            key={player.id}
            className={`w-20 flex flex-col items-center  ${
              player.socketId === socketId ? 'text-secundary' : 'text-white'
            }`}
          >
            <div className='text-center flex flex-col  items-center p-1 gap-1'>
              <div
                className='border-2  border-white rounded-full'
                dangerouslySetInnerHTML={{ __html: player.avatar }}
              />
              <p className=' text-wrap  text-xs font-semibold'>
                {player.playerName}
              </p>
            </div>
          </div>
        ))}
      </div>
      {socketId && (
        <div className='flex justify-center mt-10'>
          <button
            onClick={deletePlayer}
            className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-900'
          >
            Salir
          </button>
        </div>
      )}
      <div className='flex items-center justify-center mt-4 flex-col m-2 text-center text-wrap  '>
        {countdown ? (
          <CountdownBall onCountdownFinish={handleCountdownFinish} />
        ) : (
          <div>
            <p className='pb-2'>Esperando inicio del juego...</p>
            <div className='loaderRoom'></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
