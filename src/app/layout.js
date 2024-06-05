
'use client'
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import User from './components/User';

import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from './pages/authContext';


import { shadesOfPurple } from '@clerk/themes';
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
         baseTheme: [shadesOfPurple],
          }}
    >
      <AuthProvider >
        <html lang="en">

          <body className=''>
            <Header />
            <Sidebar />
            <div className=' flex justify-center gap-10 w-full container-user'>
              <User />
            </div>
            <main className="flex flex-col items-center justify-between p-4 gap-10">
              {children}
            </main>
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
  )
}