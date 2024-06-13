// components/Sidebar.js
'use client';
import { useState } from 'react';
import Link from 'next/link';

import { SignInButton, useUser } from '@clerk/nextjs';
import User from './User';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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
            <SignInButton />
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
