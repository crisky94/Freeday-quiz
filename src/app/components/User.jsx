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
        localStorage.removeItem('nickname');
      }
    }
  }, [user, nickname]);

  return (
    <>
      <div className=' flex justify-end gap-2 w-full mt-4'>
        <SignedIn>
          <>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    'w-16 h-16 rounded-full border-2  border-slate-300',
                },
              }}
            />
          </>
        </SignedIn>
        {user ? (
          <div className='flex items-center'>
            <p className=' mr-12 font-bold text-xs text-center bg-black h-6 p-1  rounded-md'>
              {user.firstName} {user.lastName} ({user.username})
            </p>
          </div>
        ) : null}
        {nickname && !user ? (
          <p className='flex flex-row gap-2 justify-center items-center bg-black h-8 px-2 '>
            {nickname}
          </p>
        ) : null}
      </div>
    </>
  );
}
