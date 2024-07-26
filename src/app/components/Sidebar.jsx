'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAvatar } from '../../context/avatarContext';
import { useSocket } from '@/context/socketContext'; // Nueva importación
import User from './User';
import '../styles/sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const socket = useSocket();
  const { fetchAvatar } = useAvatar();
  const [players, setPlayers] = useState([]);
  const [avatars, setAvatars] = useState({});
  const [socketId, setSocketId] = useState('');
  const params = useParams();
  const code = parseInt(params.code);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!socket) return;

    const handleGetPlayers = async (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        setSocketId(socket.id);
        setPlayers(response.players);
        const avatarsData = await Promise.all(response.players.map(async (player) => {
          const avatar = await fetchAvatar(player.playerName);
          return { id: player.id, avatar };
        }));
        const avatarsMap = {};
        avatarsData.forEach(({ id, avatar }) => {
          avatarsMap[id] = avatar;
        });
        setAvatars(avatarsMap);
      }
    };

    socket.emit('getPlayers', { code }, handleGetPlayers);

    return () => {
      socket.off('getPlayers', handleGetPlayers);
    };
  }, [socket, fetchAvatar]);

  return (
    <div className='sidebar'>
      {!isOpen ? (
        <button
          className='p-4 text-white fixed top-4 right-4 z-50'
          onClick={toggleSidebar}
        >
          ☰
        </button>
      ) : (
        ''
      )}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black shadow-xl text-white transition-transform transform z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <button className='p-4 text-white' onClick={toggleSidebar}>
          ✕
        </button>
        <nav className='flex flex-col text-center gap-2 mt-5'>
          {user ? (
            <div className='ml-8'>
              <User />
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center text-center w-full h-full gap-2'>
              {players.map(player => (
                <div key={player.id} className='flex flex-row flex-wrap justify-between items-center text-center gap-4 mb-0 w-auto'>
                  {avatars[player.id] && player.socketId === socketId && (
                    <>
                      <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatars[player.id] }} />
                      <p className='flex flex-row items-center bg-black h-8 px-2 rounded-md'>{player.playerName}</p>
                    </>
                  )}
                </div>
              ))}
          
                <SignInButton className='signIn-button mt-10' />
           
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
