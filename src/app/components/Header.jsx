'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
// import Avvvatars from 'avvvatars-react';
import User from './User';

export default function Header() {
  const { user } = useUser();
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [mostrarAvatar, setMostrarAvatar] = useState(false);
  const apikey = process.env.apikey;

  const avatars = async () => {
    try {
      const response = await fetch(`https://api.multiavatar.com/${nickname}.svg?apikey=${apikey}`);
      const svg = await response.text();
      const adjustedSvg = svg.replace('<svg ', '<svg width="50" height="50" ');
      setAvatar(adjustedSvg);
    } catch (error) {
      console.error('Error fetching avatar:');
    }
  };

  avatars();

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
  }, [nickname]);

  return (
    <nav className="header fixed top-0 w-full flex justify-between items-center pl-8 shadow-md shadow-slate-200 z-50 h-24">
      <Link href="/">
        <Image
          src={'/Logotipo_Logotipo.png'}
          width={50}
          height={60}
          className="logo"
          alt="Logo"
        />
      </Link>
      <div className='nav-header w-full'>
        {user ? (
          <div className="flex justify-between w-full pr-4 mt-6 text-white">
            <div className='w-full flex items-center justify-center text-center gap-6 bg-[#111] h-12 rounded-md '>
              <Link className='hover:border-[#dfe524] hover:border-2 rounded-md p-2' href={'/pages/demo-game'}>Demo game</Link>
              <Link className='hover:border-[#dfe524] hover:border-2 rounded-md p-2' href={'/pages/control-quiz'}>Control Quiz</Link>
              <Link className='hover:border-[#dfe524] hover:border-2 rounded-md p-2' href={'/'}>Game Page</Link>
              <Link className='hover:border-[#dfe524] hover:border-2 rounded-md p-2' href={'/pages/start-quiz'}>Start Quiz</Link>
            </div>
            <User />
          </div>
        ) : (

          <div className='flex flex-col sm:flex-row items-center w-full justify-around'>
            <div className='flex flex-row flex-wrap justify-center items-center text-center gap-4 mb-4 sm:mb-0 sm:w-auto'>
              {!mostrarAvatar && nickname && (
                <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatar }} />
              )}
              {mostrarAvatar && !nickname && (
                <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatar }} />
              )}
              <p className="flex flex-row items-center bg-black h-8 px-2 rounded-md">{nickname}</p>
            </div>
            <div className='flex flex-row justify-end items-end text-end w-full sm:w-auto'>
              <SignInButton />
            </div>
          </div>


        )}
      </div >
    </nav>
  );
}
