'use client'

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import User from './User';
import { useAvatar } from '../../context/avatarContext'; // Nueva importación
import { useSocket } from '@/context/socketContext'; // Nueva importación
import '../styles/header.css';

export default function Header() {
  const { user } = useUser();
  const socket = useSocket();
  const { fetchAvatar } = useAvatar();
  const [players, setPlayers] = useState([]);
  const [avatars, setAvatars] = useState({});
  const params = useParams();
  const code = parseInt(params.code);
  const [socketId, setSocketId] = useState('');


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
    <nav className='header fixed top-0 w-full flex justify-between items-center pl-8 pr-8 shadow-md shadow-slate-200 z-50 h-24'>
      <Link href='/'>
        <Image
          src={'/Logotipo_Logotipo.png'}
          width={50}
          height={60}
          className='logo'
          alt='Logo'
        />
      </Link>

      <div className='nav-header'>
        {user ? (
          <User />
        ) : (
          <div className='flex flex-row justify-between'>
            <div className='flex flex-grow justify-between items-center'>
              {players.map(player => (
                <div key={player.id} className='flex flex-row flex-wrap justify-between items-center text-center gap-4 mb-0 w-auto mt-2'>
                  {avatars[player.id] && player.socketId === socketId && (
                    <>

                    <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatars[player.id] }} />
                  <p className='flex flex-row items-center bg-black h-8 px-2 rounded-md'>{player.playerName}</p>
                    </>
                  )}
                </div>
              ))}
              
                <SignInButton className='signIn-button  mt-2 ml-10' />
              
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
