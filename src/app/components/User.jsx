'use client'

import { useEffect, useState } from 'react';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import Avvvatars from 'avvvatars-react'



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
      <div className='flex justify-center gap-10 w-full'>
        <SignedIn  >
          <div className="ml-10 mt-5">
            <UserButton appearance={{
              elements: {
                userButtonAvatarBox: 'w-16 h-16 rounded-full border-2  border-gray-300'
              }
            }} />
          </div>
        </SignedIn>
        {
          user && !nickname && user.firstName ? <p className='mt-12 mr-12'>{user.firstName} {user.lastName}</p> : ''
        }
        {
          nickname && !user ? <p className='flex flex-row gap-2 justify-center items-center'><Avvvatars value={nickname} style="shape" borderSize={2} size={60} radius={40} shadow={true} />{nickname}</p> : ''
        }
        {
          !user?.firstName ? <p className='mt-12 mr-12'>{user?.username}</p> : ''
        }

      </div>

    </>
  );
}