import { PrismaClient } from '@prisma/client';
import { checkAuth } from '../../../lib/authApi';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Verifica la autenticación del usuario utilizando la función checkAuth
  const { isAuthenticated, response, userId } = await checkAuth(req);

  // Si el usuario no está autenticado, devuelve la respuesta de error
  if (!isAuthenticated) {
    return response;
  }

  try {
    const body = await req.json(); // Obtiene el cuerpo de la solicitud en formato JSON
    const { gameId } = body; // Extrae el gameId del cuerpo de la solicitud

    if (!gameId) {
      // Verifica que gameId esté presente
      return res.status(400).json({ message: 'Game ID es obligatorio' });
    }

    const game = await prisma.games.findUnique({
      where: { id: gameId }, // Busca el juego en la base de datos usando gameId
    });

    if (!game) {
      // Verifica si el juego no fue encontrado
      return res.status(404).json({ message: 'No existe el juego' });
    }

    const tableName = `temp_${game.nameGame}`; // Crea el nombre de la tabla temporal basado en el nombre del juego

    await prisma.$executeRawUnsafe(`
      CREATE TEMPORARY TABLE ${tableName} (
        nickPlayer VARCHAR(255),
        Points INT
      );
    `); // Crea una tabla temporal con las columnas nickPlayer y Points

    return res
      .status(200)
      .json({ message: 'Tabla temporal creada', tableName });
  } catch (error) {
    console.error(error); // Imprime cualquier error en la consola
    return res
      .status(500)
      .json({ message: 'Error del servidor', error: error.message });
  } finally {
    await prisma.$disconnect(); // Desconecta el cliente de Prisma
  }
}
