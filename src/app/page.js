'use client'

import NickNameForm from './pages/nick-name-form/page';
import GamesList from './components/Games';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

function HomePage() {
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

  return !user && !nickname ? (
    <div><NickNameForm /></div>
  ) : (
      <div><GamesList /></div>
  )


}

export default HomePage;
