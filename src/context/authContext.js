'use client';
import { createContext, useContext, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if ((isSignedIn, user)) {
    }
  }, [isSignedIn, user]);

  return (
    <AuthContext.Provider value={{ isSignedIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
