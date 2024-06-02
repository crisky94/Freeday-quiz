import { PrismaClient } from "@prisma/client";

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Extrae el parámetro 'id' de la consulta (query)
  const { id } = req.query;

  if (req.method === "PUT") {
    // Extrae el nuevo nombre del cuerpo de la solicitud (body)
    const { nameGame } = req.body;

    // Valida que el nombre esté presente
    if (!nameGame) {
      return res
        .status(400)
        .json({ error: "El nombre del juego es requerido" });
    }

    try {
      // Actualiza el nombre del juego en la base de datos
      const updateGame = await prisma.game.update({
        where: {
          id: parseInt(id), // Convierte el id a un número entero
        },
        data: {
          nameGame,
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
      // Elimina el juego de la base de datos
      await prisma.game.delete({
        where: {
          id: parseInt(id), // Convierte el id a un número entero
        },
      });
      // Devuelve una respuesta vacía con un estado 204 (No Content)
      res.status(204).end();
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({ error: "Error al eliminar el juego" });
    }
  } else {
    // Si el método HTTP no es PUT o DELETE, devuelve un estado 405 (Método no permitido)
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
