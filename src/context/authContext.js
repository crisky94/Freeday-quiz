'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
      if (isSignedIn && window.location.pathname === '/') {
        router.push('/'); // Redirigir a una página específica
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <AuthContext.Provider value={{ isSignedIn, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
