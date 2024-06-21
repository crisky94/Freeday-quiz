import { PrismaClient } from "@prisma/client";
import { checkAuth } from "../../../../lib/authApi";

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Verifica la autenticación del usuario utilizando la función checkAuth
  const { isAuthenticated, response, userId } = await checkAuth(req);

  // Si el usuario no está autenticado, devuelve la respuesta de error
  if (!isAuthenticated) {
    return response;
  }

  // Extrae el parámetro 'id' de la consulta (query)
  const { id } = req.query;

  if (req.method === "PUT") {
    // Extrae el nuevo nombre y codeGame del cuerpo de la solicitud (body)
    const { nameGame, detailGame, codeGame } = req.body;

    // Valida que el nombre y el codeGame estén presentes
    if (!nameGame || codeGame === undefined) {
      return res.status(400).json({
        error: "El nombre del juego y el código del juego son requeridos",
      });
    }

    // Verifica que el codeGame sea un número entero de cuatro cifras
    if (typeof codeGame !== "number" || codeGame < 1000 || codeGame > 9999) {
      return res.status(400).json({
        error:
          "El código del juego debe ser un número entero de cuatro cifras (1000-9999)",
      });
    }

    try {
      // Comprueba si el codeGame ya existe en otro registro en la base de datos
      const existingGame = await prisma.games.findUnique({
        where: { codeGame },
      });

      if (existingGame && existingGame.id !== parseInt(id)) {
        return res.status(409).json({
          error: "El código del juego ya está en uso. Por favor, elija otro.",
        });
      }

      // Actualiza el nombre del juego y el codeGame en la base de datos
      const updateGame = await prisma.games.update({
        where: {
          id: parseInt(id), // Convierte el id a un número entero
        },
        data: {
          nameGame,
          detailGame,
          codeGame,
        },
      });
      // Devuelve el juego actualizado en formato JSON con un estado 200 (OK)
      res.status(200).json(updateGame);
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({ error: "Error al actualizar el juego" });
    }
  } else if (req.method === "DELETE") {
    try {
      // Obtén el juego a eliminar
      const gameToDelete = await prisma.games.findUnique({
        where: {
          id: parseInt(id),
        },
      });

      if (!gameToDelete) {
        return res.status(404).json({ error: "Juego no encontrado" });
      }

      const { nameGame } = gameToDelete;

      // Elimina primero todas las preguntas relacionadas en la tabla Asks
      await prisma.asks.deleteMany({
        where: {
          gameId: parseInt(id), // Convierte el id a un número entero
        },
      });

      // Luego elimina el juego de la tabla Games
      await prisma.games.delete({
        where: {
          id: parseInt(id), // Convierte el id a un número entero
        },
      });

      // Devuelve un mensaje indicando que el juego fue eliminado
      res.status(200).json({ message: `El juego '${nameGame}' fue eliminado` });
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({
        error: "Error al eliminar el juego y sus preguntas relacionadas",
      });
    }
  } else if (req.method === "GET") {
    try {
      // Busca los juegos creados por el nickUser
      const games = await prisma.games.findMany({
        where: {
          nickUser: id,
        },
      });

      // Si no se encuentran juegos, devuelve un mensaje indicando esto
      if (games.length === 0) {
        return res.status(404).json({
          message: "Este usuario no creó todavía ningún juego",
        });
      }

      // Devuelve la lista de juegos en formato JSON con un estado 200 (OK)
      res.status(200).json(games);
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({ error: "Error al buscar los juegos" });
    }
  } else {
    // Si el método HTTP no es PUT, DELETE o GET, devuelve un estado 405 (Método no permitido)
    res.setHeader("Allow", ["PUT", "DELETE", "GET"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
