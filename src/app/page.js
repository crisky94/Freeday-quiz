'use client';
import GamesList from './pages/game/page';
import User from './components/User';
import AccesPin from './pages/access-pin/page';
import { useAuth } from '@/context/authContext';
function HomePage() {
  const { user, isSignedIn } = useAuth(User);
  return !user && !isSignedIn ? (
    <>
      <AccesPin />
    </>
  ) : (
    <div className='w-full min-h-screen md:min-h-[80vh] lg:min-h-[70vh]'>
      <GamesList />
    </div>
  );
}

export default HomePage;
