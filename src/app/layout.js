'use client';
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/authContext';
import { SocketProvider } from '../context/SocketContext';

import { shadesOfPurple } from '@clerk/themes';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: [shadesOfPurple],
      }}
    >
      <AuthProvider>
        <SocketProvider>
          <html lang='en'>
            <body className='bg-primary'>
              <Header />
              <Sidebar />
              <main className='flex flex-col items-center justify-between p-4 gap-10'>
                {children}
              </main>
            </body>
          </html>
        </SocketProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
