'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';

const WaitingRoom = ({ params }) => {
  const router = useRouter();
  const socket = useSocket();
  const [players, setPlayers] = useState([]);
  const code = parseInt(params.code);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [socketId, setSocketId] = useState('');

  useEffect(() => {
    if (socket) {
      setSocketId(socket.id);
    }
  }, [socket]);

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

    const handleNewPlayer = (newPlayer) => {
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
    };

    const handleExitPlayer = (removedPlayerId) => {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== removedPlayerId)
      );
    };

    const handleUpdatePlayer = (updatedPlayer) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === updatedPlayer.id ? updatedPlayer : player
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
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const fetchPlayers = () => {
      socket.emit('getPlayers', { code }, (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          setPlayers(response.players);
        }
      });
    };

    fetchPlayers();

    return () => {
      socket.off('getPlayers');
    };
  }, [socket, code]);

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
        router.push('/'); // Redirigir a la página principal después de eliminar al jugador
      }
    });
  };

  return (
    <div className='w-screen h-screen bg-slate-400'>
      <div>
        <h1 className='text-center text-black text-2xl font-bold mt-10'>
          {title}
        </h1>
        <p>{description}</p>
      </div>

      <ul className='mt-5'>
        {players.map((player) => (
          <li key={player.id} className='text-center text-xl'>
            {player.playerName}
          </li>
        ))}
      </ul>
      {socketId && (
        <div className='flex justify-center mt-10'>
          <button
            onClick={deletePlayer}
            className='bg-red-500 text-white px-2 py-1 rounded'
          >
            Eliminarme
          </button>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;
