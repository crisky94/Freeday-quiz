'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import AccesPin from './pages/access-pin/page';
import GamesList from './pages/games/page';
import Loading from './loading';

function HomePage() {
  const [nickname, setNickname] = useState('');
  const { user, isSignedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && !isSignedIn) {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    }
  }, [user, nickname, isSignedIn, loading]);

  if (loading) {
    return (
      <div className='h-screen flex items-center'>
        <Loading />
      </div>
    ); // Indicador de carga
  }

  return (
    <>
      {!isSignedIn ? (
        <AccesPin />
      ) : (
        <div className='w-full min-h-screen md:min-h-[80vh] lg:min-h-[70vh]'>
          <GamesList />
        </div>
      )}
    </>
  );
}

export default HomePage;
