// prismaClient.js
// lib/prismaClient.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  // En producción, crea una única instancia de PrismaClient
  prisma = new PrismaClient();
} else {
  // En desarrollo, usa una variable global para evitar múltiples instancias
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
