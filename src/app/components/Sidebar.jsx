// components/Sidebar.js
'use client';

import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Avvvatars from 'avvvatars-react'
import User from './User';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const { user } = useUser();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {

    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    }
  }, [nickname]);

  return (
    <div className='sidebar'>
      {!isOpen ? (
        <button
          className='p-4 text-white fixed top-4 right-4 z-50 '
          onClick={toggleSidebar}
        >
          ☰
        </button>
      ) : (
        ''
      )}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#533b7cf0]  shadow-xl  text-white transition-transform transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button className='p-4 text-white' onClick={toggleSidebar}>
          ✕
        </button>
        <nav className='flex flex-col text-center gap-5 mt-5'>
          {user ? (
            <>
              <User />
              <Link onClick={toggleSidebar} href={'/pages/access-pin'}>
                Acess Pin
              </Link>
              <Link onClick={toggleSidebar} href={'/pages/control-quiz'}>
                Control Quiz
              </Link>
              <Link onClick={toggleSidebar} href={'/pages/modify-quiz'}>
                Modify Quiz
              </Link>
              <Link onClick={toggleSidebar} href={'/pages/demo-game'}>
                Demo game
              </Link>
              <Link onClick={toggleSidebar} href={'/pages/nick-name-form'}>
                NickNameForm
              </Link>
              <Link onClick={toggleSidebar} href={'/pages/ranking'}>
                Ranking
              </Link>
              <Link onClick={toggleSidebar} href={'/pages/create-quiz'}>
                Create Quiz
              </Link>
              <Link onClick={toggleSidebar} href={'/pages/start-quiz'}>
                Start Quiz
              </Link>
            </>
          ) : (
              <div className='flex flex-row gap-10'>
                <Avvvatars value={nickname} style="shape" borderSize={2} size={50} radius={40} shadow={true} />
                <p className='flex flex-row gap-2 justify-center items-center'>{nickname}</p>
                <SignInButton className='mr-10' />
              </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
