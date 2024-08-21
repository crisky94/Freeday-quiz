'use client';

import { useEffect, useState } from 'react';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';

// Componente principal que maneja la visualización del usuario
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
        {/* Si el usuario está autenticado, muestra el botón de usuario */}
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
        {/* Si hay un usuario autenticado, muestra su nombre y apellido */}
        {user ? (
          <div className='flex items-center'>
            <p className=' mr-12 font-bold text-sm text-center  h-6 p-1  rounded-md'>
              {user.firstName} {user.lastName} {user.username}
            </p>
          </div>
        ) : null}
        {/* Si hay un apodo y no hay usuario autenticado, muestra el apodo */}
        {nickname && !user ? (
          <p className='flex flex-row gap-2 justify-center items-center bg-black h-8 px-2 '>
            {nickname}
          </p>
        ) : null}
      </div>
    </>
  );
}
