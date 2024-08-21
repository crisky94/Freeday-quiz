'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAvatar } from '../../context/avatarContext';
import { useSocket } from '@/context/socketContext';
import User from './User';
import '../styles/sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const socket = useSocket();
  const { fetchAvatar } = useAvatar();
  const [players, setPlayers] = useState([]);
  const [socketId, setSocketId] = useState('');
  const params = useParams();
  const code = parseInt(params.code) || 0;

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

        response.players.map(async (player) => {
          return { id: player.id };
        });
      }
    };

    if (code) {
      socket.emit('getPlayers', { code }, handleGetPlayers);
    }

    return () => {
      socket.off('getPlayers', handleGetPlayers);
    };
  }, [socket, fetchAvatar, players]);

  return (
    <div className='sidebar '>
      {!isOpen ? (
        <button
          className='pt-8 px-2  text-white  hover:text-primary fixed top-4 right-4 z-50'
          onClick={toggleSidebar}
        >
          ☰
        </button>
      ) : (
        ''
      )}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#111] shadow-xl text-white transition-transform transform z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          className='p-4 mt-6 hover:text-primary text-white'
          onClick={toggleSidebar}
        >
          ✕
        </button>
        <nav className='flex flex-col text-center gap-2 mt-5'>
          {user ? (
            <div className='ml-4'>
              <User />
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center text-center w-full h-full gap-2'>
              {players.map((player) => (
                <div
                  key={player.id}
                  className='flex flex-row flex-wrap justify-between items-center text-center gap-4 mb-0 w-auto mt-5'
                >
                  {player.socketId === socketId && (
                    <>
                      <div
                        className='border-2 border-white rounded-full'
                        dangerouslySetInnerHTML={{ __html: player.avatar }}
                      />
                      <p className='flex flex-row items-center bg-black h-8 px-2 rounded-md'>
                        {player.playerName}
                      </p>
                    </>
                  )}
                </div>
              ))}
              <SignInButton className='signIn-button-sidebar mt-10' />
              <SignUpButton className='signUp-button-sidebar mt-2' />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
