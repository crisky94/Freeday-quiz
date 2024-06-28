'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import User from './User';

export default function Header() {
  const { user } = useUser();
  return (
    <div className='flex flex-row justify-between items-center p-3 w-full flex-wrap container-header'>
      <Link href={'/'}>
        <Image
          src={'/logo.png'}
          alt='logo'
          width={90}
          height={60}
          className='logo'
        />
      </Link>
      <nav className='nav-header'>
        {user ? (
          <div className='flex flex-row flex-wrap items-center justify-center gap-5'>
            <Link href={'/pages/control-quiz'}>Control Quiz</Link>
            <Link href={'/pages/modify-quiz'}>Modify Quiz</Link>
            <Link href={'/pages/demo-game'}>Demo game</Link>
            <Link href={'/pages/ranking'}>Ranking</Link>
            <Link href={'/pages/create-quiz'}>Create Quiz</Link>
            <User />
          </div>
        ) : (
          <SignInButton className='mr-10' />
        )}
      </nav>
    </div>
  );
}
