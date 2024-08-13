'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';
import { useAvatar } from '../../../../context/avatarContext';
import Image from 'next/image';
import BeforeUnloadHandler from '../../../components/closePage';
import PacManCountdown from '../../../components/PacManCountdown'; // Importa el nuevo componente
import usePlayerSocket from '../../../components/usePlayerSocket';

const WaitingRoom = ({ params }) => {
  const router = useRouter();
  const socket = useSocket();
  const { fetchAvatar } = useAvatar();
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
    // const userPin = localStorage.getItem('pin');
    const userNick = localStorage.getItem('nickame');
    if (!socket && !userNick) {
      router.push('/');
    } else {
      setSocketId(socket.id);
    }
  }, [socket, router]);

  useEffect(() => {
    if (!code) {
      console.error('Code parameter is missing.');
      router.push('/');
      return;
    }

    const fetchGameInfo = async () => {
      try {
        const response = await fetch(`/api/game/${code}`);
        const game = await response.json();

        if (response.ok) {
          setTitle(game.nameGame);
          setDescription(game.detailGame || '');
        } else {
          console.error('Error fetching game info');
        }
      } catch (error) {
        console.error('Error fetching game info:', error);
      }
    };

    fetchGameInfo();
  }, [code, router]);

  usePlayerSocket({ socket, fetchAvatar, setPlayers, setCountdown });

  useEffect(() => {
    if (!socket) return;

    const fetchPlayers = () => {
      socket.emit('getPlayers', { code }, async (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          const playersWithAvatars = await Promise.all(
            response.players.map(async (player) => {
              const avatar = await fetchAvatar(player.playerName);
              return { ...player, avatar };
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
  }, [socket, code, fetchAvatar]);

  const deletePlayer = useCallback(() => {
    if (!socket) return;

    const playerId = players.find((player) => player.socketId === socketId)?.id;
    if (!playerId) {
      console.error('Player ID not found');
      return;
    }
    // Limpiar el localStorage y sesion  cuando el jugador es eliminado
    sessionStorage.removeItem('pin');
    sessionStorage.removeItem('nickname');
    localStorage.removeItem('nickname');

    socket.emit('deletePlayer', { playerId, code }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        console.log('Player eliminado con éxito');
        router.push('/pages/access-pin'); // Redirigir a la página principal después de eliminar al jugador
      }
    });
  }, [socket, players, socketId, code, router]);

  const handleCountdownFinish = () => {
    router.push(`/pages/page-game/${code}`);
  };

  return (
    <div className='w-screen h-screen bgroom'>
      <BeforeUnloadHandler onBeforeUnload={deletePlayer} />
      <div className='h-60 flex flex-col mt-14 flex-wrap mx-5'>
        <h1 className='text-primary font-extrabold text-4xl uppercase'>
          {title}
        </h1>
        <p className='text-wrap break-words w-full'>{description}</p>
      </div>

      <div className='flex flex-wrap -mt-9 '>
        {players.map((player) => (
          <div
            key={player.id}
            className={`w-14 flex flex-col items-center p-1 mx-8 ${
              player.socketId === socketId ? 'text-secundary' : 'text-white'
            }`}
          >
            <div className='text-center flex flex-col items-center p-1 gap-1'>
              <Image
                width={40}
                height={40}
                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                  player.avatar
                )}`}
                alt={`${player.playerName}'s avatar`}
              />
              <p>{player.playerName}</p>
            </div>
          </div>
        ))}
      </div>
      {socketId && (
        <div className='flex justify-center mt-4'>
          <button
            onClick={deletePlayer}
            className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-900'
          >
            Salir
          </button>
        </div>
      )}
      <div className='flex items-center justify-center mt-4 flex-col m-2 text-center text-wrap '>
        {countdown ? (
          <PacManCountdown onCountdownFinish={handleCountdownFinish} />
        ) : (
          <>
            <p className='pb-2'>Esperando inicio del juego...</p>
            <div className='loaderRoom'></div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;