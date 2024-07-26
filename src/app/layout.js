
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/authContext';
import { SocketProvider } from '@/context/socketContext';
import { AvatarProvider } from '@/context/avatarContext';
import './globals.css';
import { Montserrat } from 'next/font/google';
import { neobrutalism } from '@clerk/themes';


export const metadata = {
  title: 'HACK A BOSS | FreedayQuiz ⭐️',
};

const monserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});


export default function RootLayout({ children }) {
  return (
    <SocketProvider>
      <ClerkProvider
        appearance={{
          baseTheme: [neobrutalism],
        }}
      >
          <AvatarProvider>
        <AuthProvider>
            <html lang="en">
              <head>
                <link rel="icon" href="/logotipo.png" />
                <title>{metadata.title}</title>
              </head>
              <body className={`${monserrat.className} pt-16`}>
                <Header />
                <Sidebar />
                <main className="flex flex-col flex-wrap items-center justify-between gap-8 w-full h-auto min-h-screen md:min-h-[90vh] lg:min-h-[70vh]">
                  {children}
                </main>
              </body>
            </html>
        </AuthProvider>
          </AvatarProvider>
      </ClerkProvider>
    </SocketProvider>
  );
}
