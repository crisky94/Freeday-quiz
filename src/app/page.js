'use client';
import React, { Suspense, lazy } from 'react';
import { useUser } from '@clerk/clerk-react';
import Loading from './loading';

const AccesPin = lazy(() => import('./pages/access-pin/page'));
const GamesList = lazy(() => import('./pages/games/page'));

function HomePage() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className='h-screen flex items-center'>
        <Loading />
      </div>
    );
  }
  // Renderiza el componente adecuado dependiendo del estado de autenticación
  return (
    <>
      {!isSignedIn ? (
        <Suspense fallback={<Loading />}>
          <AccesPin />
        </Suspense>
      ) : (
        <div className='w-full min-h-screen md:min-h-[80vh] lg:min-h-[70vh]'>
          <Suspense fallback={<Loading />}>
            <GamesList />
          </Suspense>
        </div>
      )}
    </>
  );
}

export default HomePage;
