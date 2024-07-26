'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';
import useAvatar from '../../../../lib/fetchAvatar';
import Image from 'next/image';

const WaitingRoom = ({ params }) => {
  const router = useRouter();
  const socket = useSocket();
  const [players, setPlayers] = useState([]);
  const code = parseInt(params.code);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [socketId, setSocketId] = useState('');
  const apiKey = process.env.apikey;

  const { avatars } = useAvatar();

  useEffect(() => {
    if (!socket) {
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

  useEffect(() => {
    if (!socket) return;

    const handleNewPlayer = async (newPlayer) => {
      const avatar = await avatars(newPlayer.playerName);
      setPlayers((prevPlayers) => [...prevPlayers, { ...newPlayer, avatar }]);
    };

    const handleExitPlayer = (removedPlayerId) => {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== removedPlayerId)
      );
    };

    const handleUpdatePlayer = async (updatedPlayer) => {
      const avatar = await avatars(updatedPlayer.playerName);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === updatedPlayer.id ? { ...updatedPlayer, avatar } : player
        )
      );
    };

    socket.on('updatePlayer', handleUpdatePlayer);
    socket.on('newPlayer', handleNewPlayer);
    socket.on('exitPlayer', handleExitPlayer);

    return () => {
      socket.off('newPlayer', handleNewPlayer);
      socket.off('exitPlayer', handleExitPlayer);
      socket.off('updatePlayer', handleUpdatePlayer);
    };
  }, [socket, avatars]);

  useEffect(() => {
    if (!socket) return;

    const fetchPlayers = () => {
      socket.emit('getPlayers', { code }, async (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          const playersWithAvatars = await Promise.all(
            response.players.map(async (player) => {
              const avatar = await avatars(player.playerName);
              return { ...player, avatar };
            })
          );
          setPlayers(playersWithAvatars);
        }
      });
    };
    socket.on('connect', fetchPlayers); // Re-fetch players on reconnect
    fetchPlayers();

    return () => {
      socket.off('getPlayers');
      socket.off('connect', fetchPlayers);
    };
  }, [socket, code, avatars]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        '¿Estás seguro de que deseas recargar la página? Se perderán los datos no guardados.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const deletePlayer = () => {
    if (!socket) return;

    const playerId = players.find((player) => player.socketId === socketId)?.id;
    if (!playerId) {
      console.error('Player ID not found');
      return;
    }

    socket.emit('deletePlayer', { playerId, code }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        console.log('Player eliminado con éxito');
        router.push('/pages/access-pin'); // Redirigir a la página principal después de eliminar al jugador
      }
    });
  };

  return (
    <div className='w-screen h-screen bgroom'>
      <div className='h-48 flex flex-col mt-10 flex-wrap mx-5'>
        <h1 className='text-primary font-extrabold text-4xl uppercase'>
          {title}
        </h1>
        <p className='text-wrap break-words w-full'>{description}</p>
      </div>

      <div className='flex flex-wrap '>
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
        <div className='flex justify-center mt-10'>
          <button
            onClick={deletePlayer}
            className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-900'
          >
            Salir
          </button>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;