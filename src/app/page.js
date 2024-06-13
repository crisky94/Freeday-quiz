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
    <>
      <GamesList />
    </>
  );
}

export default HomePage;
