'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import User from './User';
import useAvatar from '../../lib/fetchAvatar';
import '../styles/header.css'

export default function Header() {
  const { user } = useUser();
  const [nickname, setNickname] = useState('');
  const { avatar, avatars } = useAvatar();
  const [mostrarAvatar, setMostrarAvatar] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
        setMostrarAvatar(!mostrarAvatar);
      }
      if (user) {
        localStorage.removeItem('nickname');
      }

      if (user && !nickname) {
        setMostrarAvatar(mostrarAvatar);
      }
    }
    avatars('nickname');
  }, [nickname]);

  return (
    <nav className='header fixed top-0 w-full flex justify-between items-center pl-8 shadow-md shadow-slate-200 z-50 h-24'>
      <Link href='/'>
        <Image
          src={'/Logotipo_Logotipo.png'}
          width={50}
          height={60}
          className='logo'
          alt='Logo'
        />
      </Link>
        {user ? (
          <div className="nav-header flex justify-between w-full text-white mb-4">
            <User />
          </div>
        ) : (

          <div className='nav-header flex flex-col sm:flex-row items-center w-full justify-around'>
            <div className='flex flex-row flex-wrap justify-center items-center text-center gap-4 mb-4 sm:mb-0 sm:w-auto'>
              {!mostrarAvatar && nickname && (
                  <>
                  <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatar }} />
                    <p className="flex flex-row items-center bg-black h-8 px-2 rounded-md">{nickname}</p>
                  </>
              )}
              {mostrarAvatar && !nickname && (
                <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatar }} />                        
              )}
            </div>
            <div className='flex flex-row justify-end items-end text-end w-full sm:w-auto mr-20'>
              <SignInButton className='signIn-button' />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
