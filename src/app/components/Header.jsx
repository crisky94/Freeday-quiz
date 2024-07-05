'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import User from './User';

export default function Header() {
  const { user } = useUser();
  return (
    <div className='flex   flex-row justify-between items-center p-3 w-full flex-wrap container-header'>
      <Link href={'/'}>
        <Image
          src={'/3.svg'}
          alt='logo'
          width={120}
          height={100}
          className='logo -mt-5'
        />
      </Link>
      <nav className='nav-header'>
        {user ? (
          <div className='flex flex-row flex-wrap items-center justify-center gap-5  '>
            <Link
              className='hover:bg-purple-700 rounded-md px-2  transition duration-300 border-2 border-transparent hover:border-blue-500'
              href='/pages/control-quiz'
            >
              Control Quiz
            </Link>
            <Link
              className='hover:bg-purple-700 rounded-md px-2  transition duration-300 border-2 border-transparent hover:border-blue-500'
              href='/pages/modify-quiz'
            >
              Modify Quiz
            </Link>
            <Link
              className='hover:bg-purple-700 rounded-md px-2  transition duration-300 border-2 border-transparent hover:border-blue-500'
              href='/pages/demo-game'
            >
              Demo Game
            </Link>
            <Link
              className='hover:bg-purple-700 rounded-md px-2  transition duration-300 border-2 border-transparent hover:border-blue-500'
              href='/pages/ranking'
            >
              Ranking
            </Link>
            <Link
              className='hover:bg-purple-700 rounded-md px-2  transition duration-300 border-2 border-transparent hover:border-blue-500'
              href='/pages/create-quiz'
            >
              Create Quiz
            </Link>
            <User />
            <div className='flex flex-col justify-center items-center text-center w-full'>
              <Link href='/pages/create-quiz'>
                <button className='mb-2 select-none rounded-lg bg-blue-500 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-black shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                  <svg
                    class='h-8 w-8 ml-1 text-white'
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
                    <line x1='9' y1='12' x2='15' y2='12' />{' '}
                    <line x1='12' y1='9' x2='12' y2='15' />{' '}
                    <path d='M4 6v-1a1 1 0 0 1 1 -1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2m0 5v1a1 1 0 0 1 -1 1h-1m-5 0h-2m-5 0h-1a1 1 0 0 1 -1 -1v-1m0 -5v-2m0 -5' />
                  </svg>
                  Crear
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <SignInButton className='mr-10' />
        )}
      </nav>
    </div>
  );
}
