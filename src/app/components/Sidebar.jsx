'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import User from './User';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [mostrarAvatar, setMostrarAvatar] = useState(false);
  const { user } = useUser();
  const apikey = process.env.apikey

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const avatars = async () => {
    try {
      const response = await fetch(`https://api.multiavatar.com/${nickname}.svg?apikey=${apikey}`
        + JSON.stringify(nickname));
      const svg = await response.text();
      const adjustedSvg = svg.replace('<svg ', '<svg width="70" height="70" ');
      setAvatar(adjustedSvg);
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };
  avatars();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
        setMostrarAvatar(!mostrarAvatar)
      }
      if (user) {
        localStorage.removeItem('nickname')
      }

      if (user && !nickname) {
        setMostrarAvatar(mostrarAvatar)
      }
    }
  }, [nickname]);

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
        className={`fixed top-0 right-0 h-full w-64 bg-black shadow-xl text-white transition-transform transform z-50 ${ // Aumentar z-index aquí
          isOpen ? 'translate-x-0' : 'translate-x-full'
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
              {
                !mostrarAvatar && nickname &&
                <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatar }} />
              }
              {
                mostrarAvatar && !nickname &&
                <div className='border-2 border-white rounded-full' dangerouslySetInnerHTML={{ __html: avatar }} />
              }
              <p className='flex flex-row gap-2 justify-center items-center'>{nickname}</p>
              <SignInButton />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
