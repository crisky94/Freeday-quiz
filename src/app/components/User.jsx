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
      if (user) {
        localStorage.removeItem('nickname')
      }
    }
  }, [user, nickname]);

  return (
    <>
      <div className='flex justify-center gap-2 w-full mb-8'>
        <SignedIn  >
          <div className="">
            <UserButton appearance={{
              elements: {
                userButtonAvatarBox: 'w-16 h-16 rounded-full border-2  border-slate-300'
              }
            }} />
          </div>
        </SignedIn>
        {
          user ? <p className='mt-4 mr-12 font-bold bg-black h-8 px-2  rounded-md'>{user.firstName} {user.lastName}</p> : ''
        }
        {
          nickname && !user ?

            <p className='flex flex-row gap-2 justify-center items-center bg-black h-8 px-2 '>{nickname}</p>

            : ''
        }
      </div>
    </>
  );
}
