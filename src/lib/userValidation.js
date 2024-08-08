'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const userValidation = () => {
  const router = useRouter();

  useEffect(() => {
    const userPin = localStorage.getItem('pin');
    const userNick = localStorage.getItem('nickname');

    if (!userPin || !userNick) {
      router.push('/');
    }
  }, [router]);
};
