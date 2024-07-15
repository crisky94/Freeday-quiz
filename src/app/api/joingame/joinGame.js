// Importar dependencias necesarias
import { createPlayerTable } from '../createtable/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { gameId, nickname } = req.body;

    try {
      // Crear la tabla de jugadores si no existe
      await createPlayerTable(gameId);

      // Lógica para insertar el jugador en la tabla temporal
      await prisma.$executeRaw`INSERT INTO players_${gameId} (nickNamePlayer) VALUES (${nickname})`;

      // Enviar respuesta de éxito
      res.status(200).json({ message: 'Jugador agregado exitosamente' });
    } catch (error) {
      console.error('Error al agregar jugador:', error);
      res.status(500).json({ error: 'Error interno al agregar jugador' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
