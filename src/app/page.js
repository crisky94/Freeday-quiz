'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

import AccesPin from './pages/access-pin/page';
import GamesList from './pages/games/page';


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
  }, [user, nickname]);

  return (
    <>
      {!user && !nickname && <AccesPin />}
      {user && !nickname && (
        <div className='w-full min-h-screen md:min-h-[80vh] lg:min-h-[70vh]'>
          <GamesList />
        </div>
      )}
      {!user && nickname && <AccesPin />}
    </>

  );

}

export default HomePage;
