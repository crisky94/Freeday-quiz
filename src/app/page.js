'use client';
import { useAuth } from '@/context/authContext';
import AccesPin from './pages/access-pin/page';
import GamesList from './pages/games/page';
import Loading from './loading';

function HomePage() {
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
      {/* Si no esta registrado le aparece la página para insertar el pin del juego */}
      {!isSignedIn ? (
        <AccesPin />
      ) : (
        < div className='w-full min-h-screen md:min-h-[80vh] lg:min-h-[70vh]'>
          {/* si está registrado le aparece la página de los juegos creados o un botón para poder crearlos */}
          <GamesList />
        </div >
      )
      }
    </>
  );
}

export default HomePage;
