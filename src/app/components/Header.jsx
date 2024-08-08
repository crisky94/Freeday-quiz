'use client'

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAvatar } from '../../context/avatarContext';
import { useSocket } from '@/context/socketContext';
import User from './User';

import '../styles/header.css';

export default function Header() {
  const { user } = useUser();
  const socket = useSocket();
  const { fetchAvatar } = useAvatar();
  const [players, setPlayers] = useState([]);
  const [avatars, setAvatars] = useState({});
  const [socketId, setSocketId] = useState('');
  const params = useParams();
  const code = parseInt(params.code) || 0;

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
  }, [socket, fetchAvatar, players]);

  return (
    <nav className='header fixed top-0 w-full flex justify-between items-center pl-8 pr-8 shadow-md shadow-slate-200 z-50 h-32'>
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
                <div key={player.id} className='flex flex-row flex-wrap justify-between items-center text-center gap-4 mb-0 w-auto'>
                  {avatars[player.id] && player.socketId === socketId && (
                    <>
                      <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatars[player.id] }} />
                      <p className='flex flex-row items-center bg-black h-8 rounded-md'>{player.playerName}</p>
                    </>
                  )}
                </div>
              ))}
              <div>
                <SignInButton className='md:text-lg signIn-button ml-12 bg-[#111] rounded-md' />
                <SignUpButton className='md:text-lg signUp-button ml-2 bg-[#111] rounded-md' />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}