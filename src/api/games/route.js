import { PrismaClient } from '@prisma/client';
import { checkAuth } from '../../../lib/authApi';

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Verifica la autenticación del usuario utilizando la función checkAuth
  const { isAuthenticated, response, userId } = await checkAuth(req);

  // Si el usuario no está autenticado, devuelve la respuesta de error
  if (!isAuthenticated) {
    return response;
  }

  // Verifica si el método HTTP de la solicitud es POST
  if (req.method === 'POST') {
    // Extrae el nombre, el nick y el codeGame del cuerpo de la solicitud (body)
    const { nickUser, nameGame, codeGame, detailGame } = req.body;

    // Valida que el nombre, el nick y el codeGame estén presentes
    if (!nickUser || !nameGame || codeGame === undefined) {
      return res.status(400).json({
        error:
          'Nombre del juego, nick del usuario y código del juego son requeridos',
      });
    }

    // Verifica que el codeGame sea un número entero de cuatro cifras
    if (typeof codeGame !== 'number' || codeGame < 1000 || codeGame > 9999) {
      return res.status(400).json({
        error:
          'El código del juego debe ser un número entero de cuatro cifras (1000-9999)',
      });
    }

    try {
      // Comprueba si el codeGame ya existe en la base de datos
      const existingGame = await prisma.game.findUnique({
        where: { codeGame },
      });

      if (existingGame) {
        return res.status(409).json({
          error: 'El código del juego ya está en uso. Por favor, elija otro.',
        });
      }

      // Crea un nuevo juego en la base de datos
      const newGame = await prisma.game.create({
        data: {
          nickUser,
          nameGame,
          detailGame,
          codeGame,
        },
      });

      // Devuelve el ID del nuevo juego con un estado 201 (Creado)
      res.status(201).json({ id: newGame.id });
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({ error: 'Error al crear el juego' });
    }
  } else {
    // Si el método HTTP no es POST, devuelve un estado 405 (Método no permitido)
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
