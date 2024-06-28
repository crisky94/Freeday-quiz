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
    <>
      <GamesList />
    </>
  );
}

export default HomePage;
