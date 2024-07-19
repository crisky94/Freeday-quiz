// api/db.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createPlayerTable(gameId) {
  try {
    // Crear una tabla temporal para jugadores asociada al gameId
    await prisma.$executeRaw(`CREATE TEMPORARY TABLE players_${gameId} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nickNamePlayer VARCHAR(255) NOT NULL,
      points INT NOT NULL DEFAULT 0
    )`);

    console.log(`Tabla de jugadores creada para el juego con ID ${gameId}`);
  } catch (error) {
    console.error('Error al crear tabla de jugadores:', error);
    throw error; // Importante lanzar el error para manejarlo en otro lugar si es necesario
  }
}
