'use client';
import { useAuth } from '@/context/authContext';
import AccesPin from './pages/access-pin/page';
import GamesList from './pages/games/page';
import Loading from './loading';

function HomePage() {
  // const [nickname, setNickname] = useState('');
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className='h-screen flex items-center'>
        <Loading />
      </div>
    ); // Indicador de carga
  }
  return (
    <>
      {!isSignedIn && <AccesPin />}
      {isSignedIn && (
        <div className='w-full min-h-screen md:min-h-[80vh] lg:min-h-[70vh]'>
          <GamesList />
        </div>
      )}
    </>
  );
}

export default HomePage;
