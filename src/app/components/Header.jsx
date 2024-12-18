'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAvatar } from '../../context/avatarContext';
import { useSocket } from '@/context/socketContext';
import User from './User';
import '../styles/header.css';
import { useAuth } from '@/context/authContext';

export default function Header() {
  const { isSignedIn } = useAuth();
  const socket = useSocket();
  const { fetchAvatar } = useAvatar();
  const [players, setPlayers] = useState([]);
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
        await Promise.all(
          response.players.map(async (player) => {
            return { id: player.id };
          })
        );
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
    <nav className='header fixed top-0 w-full flex justify-between items-center pl-8 pr-8 drop z-50 h-32'>
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
        {isSignedIn ? (
          <User />
        ) : (
          <div className='flex flex-row justify-between'>
            <div className='flex flex-grow justify-between items-center'>
              {players.map((player) => (
                <div
                  key={player.id}
                  className='flex flex-row flex-wrap justify-between items-center text-center gap-4 mb-0 w-auto'
                >
                  {player.socketId === socketId && (
                    <>
                      <div
                        className='border-2 border-white rounded-full'
                        dangerouslySetInnerHTML={{ __html: player.avatar }}
                      />
                      <p className='flex flex-row items-center bg-black h-8 rounded-md'>
                        {player.playerName}
                      </p>
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
