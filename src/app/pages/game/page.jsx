'use client';
import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSocket } from '@/context/socketContext';
import DeleteConfirmation from '@/app/components/DeleteGame';

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState();
  const [nickname, setNickname] = useState('');
  const socket = useSocket();

  useEffect(() => {
    socket.emit('getGames', (response) => {
      if (response.error) {
        setError(response.error);
      } else {
        setGames(response.games);
      }
    });

    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    }
  }, [games, nickname]);

  const handleDelete = async (gameId) => {
    socket.emit('deleteGame', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
        // Manejar el error (mostrar mensaje, etc.)
      } else {
        console.log('Juego eliminado exitosamente');
        // Actualizar la lista de juegos o realizar otras acciones necesarias
      }
    });
  };

  return (
    <div className='w-full h-auto p-4 mt-10 rounded-lg shadow-2xl  sm:p-6'>
      {games.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {games.map((game, i) => (
            <div
              key={game.id}
              className='card w-full bg-slate-100 text-black shadow-xl border rounded-md p-4 justify-center items-center text-center'
            >
              <figure className='flex flex-col justify-center items-center text-center'>
                <Image
                  src='/js.png'
                  alt={game.nameGame}
                  className=' W-full rounded-md '
                  height={300}
                  width={300}
                />
              </figure>
              <div className='card-body'>
                <h2 className='card-title font-bold '>
                  {i + 1}. {game.nameGame}
                </h2>
                <p className='text-slate-400'>
                  {/* {game.detailGame} */}
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum."
                </p>
                <div className='card-actions justify-center items-center text-center mt-4'>
                  <Link href={`/pages/games/${game.id}`}>
                    <button className='mb-2 select-none rounded-lg bg-blue-500 py-2 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                      <svg
                        class='h-8 w-8 text-black'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        stroke-width='2'
                        stroke='currentColor'
                        fill='none'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      >
                        {' '}
                        <path stroke='none' d='M0 0h24v24H0z' />{' '}
                        <rect x='2' y='6' width='20' height='12' rx='2' />{' '}
                        <path d='M6 12h4m-2 -2v4' />{' '}
                        <line x1='15' y1='11' x2='15' y2='11.01' />{' '}
                        <line x1='18' y1='13' x2='18' y2='13.01' />
                      </svg>
                      Demo
                    </button>
                  </Link>
                  <Link href={`/pages/modify-page/${game.id}`}>
                    <button className='mb-2 ml-2 select-none rounded-lg bg-amber-500 py-2 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                      <svg
                        class='h-8 w-8 text-black'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          stroke-linecap='round'
                          stroke-linejoin='round'
                          stroke-width='2'
                          d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                        />
                      </svg>
                      Editar
                    </button>
                  </Link>
                  <DeleteConfirmation
                    gameId={game.id}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col justify-center items-center text-center w-full'>
          <h1 className='font-medium'>Aún no tienes juegos creados</h1>
          <Link href='/pages/create-quiz'>
            <button className='mb-2 select-none rounded-lg bg-blue-500 py-2 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500 /20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
              <svg
                class='h-8 w-8 ml-1 text-white'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                stroke-width='2'
                stroke='currentColor'
                fill='none'
                stroke-linecap='round'
                stroke-linejoin='round'
              >
                {' '}
                <path stroke='none' d='M0 0h24v24H0z' />{' '}
                <line x1='9' y1='12' x2='15' y2='12' />{' '}
                <line x1='12' y1='9' x2='12' y2='15' />{' '}
                <path d='M4 6v-1a1 1 0 0 1 1 -1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2m0 5v1a1 1 0 0 1 -1 1h-1m-5 0h-2m-5 0h-1a1 1 0 0 1 -1 -1v-1m0 -5v-2m0 -5' />
              </svg>
              Crear
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
