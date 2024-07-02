'use client';

import { useEffect, useState } from 'react';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';

export default function User() {
  const [nickname, setNickname] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('nickname');

      if (storedNickname) {
        setNickname(storedNickname);
      }
    }
  }, [nickname]);

  return (
    <>
      <div className='flex justify-center  items-center  gap-2 w-48'>
        <SignedIn>
          <div className='ml-10 mt-5'>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    'w-20 h-20 rounded-full border-2  border-gray-300',
                },
              }}
            />
          </div>
        </SignedIn>
        {
          user ? localStorage.removeItem('nickname') : ''
        }
        {user && !nickname && user.firstName ? (
          <p className='mt-5 text-center mr-12'>
            {user.firstName} {user.lastName}
          </p>
        ) : (
          ''
        )}
        {nickname && !user ? <p>Bienvenidx {nickname}</p> : ''}
      </div>
    </>
  );
}
