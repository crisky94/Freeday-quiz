import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';

import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from './../context/authContext';
import { SocketProvider } from '../context/SocketContext'

import { shadesOfPurple } from '@clerk/themes';
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: [shadesOfPurple],
      }}
    >
      <AuthProvider>
        <SocketProvider>
          <html lang="en">
            <body className='h-auto min-h-screen md:min-h-[80vh] lg:min-h-[70vh] flex flex-col bg-primary'>
              <Header />
              <Sidebar />
              <main className="flex flex-col flex-wrap items-center justify-between gap-8 w-full h-auto min-h-screen md:min-h-[80vh] lg:min-h-[70vh]">
                {children}
              </main>
            </body>
          </html>
        </SocketProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
