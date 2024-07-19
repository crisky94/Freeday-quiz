'use client';
import { createContext, useContext, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {

    if (isSignedIn && window.location.pathname === '/') {
      router.push('/');

    }
  }, [user, isSignedIn, router]);

  return (
    <AuthContext.Provider value={{ isSignedIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
