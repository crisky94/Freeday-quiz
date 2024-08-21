import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl.pathname;

  // Definir las rutas protegidas y dinámicas
  const protectedRoutes = [
    '/pages/create-quiz',
    '/pages/games',
    ];

  // Chequear si la ruta es una de las rutas protegidas o si es una ruta dinámica específica
  const isProtected =
    protectedRoutes.includes(url) || url.startsWith('/pages/modify-page/') || url.startsWith('/pages/pinPage/') || url.startsWith('/pages/control-quiz/');


  if (isProtected) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Omitir internos de Next.js y todos los archivos estáticos, a menos que se encuentren en los parámetros de búsqueda
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para las rutas de API
    '/(api|trpc)(.*)',
    // Especificar rutas protegidas directamente en el matcher
    '/pages/create-quiz',
    '/pages/control-quiz/:gameId*',
    '/pages/games',
    '/pages/modify-page/:id*', // Ruta dinámica específica
    '/pages/pinPage/:gameId*', // Ruta dinámica específica
  ],
};
