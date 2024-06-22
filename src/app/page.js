'use client';
import GamesList from './components/Games';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AccesPin from './pages/access-pin/page';

function HomePage() {
  const [nickname, setNickname] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    }
  }, [nickname]);

  return !user && !nickname ? (
    <>
      <AccesPin />
    </>
  ) : (
      <div className='w-full min-h-screen md:min-h-[80vh] lg:min-h-[70vh]' >
      <GamesList />
    </div>
  );
}

export default HomePage;
