// middleware.js
import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';

const customMiddleware = withClerkMiddleware((req, res, next) => {
  const { userId } = getAuth(req);

  // Rutas protegidas: ajusta estas rutas según tus necesidades
  const protectedRoutes = ['/pages/control-quiz', '/pages/create-quiz'];

  if (protectedRoutes.some((route) => req.url.startsWith(route))) {
    if (!userId) {
      return res.redirect('./');
    }
  }

  // Si está autenticado o la ruta no requiere autenticación, continúa
  next();
});

export default customMiddleware;

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
