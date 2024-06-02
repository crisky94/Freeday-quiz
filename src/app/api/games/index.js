import { PrismaClient } from "@prisma/client";

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Verifica si el método HTTP de la solicitud es POST
  if (req.method === "POST") {
    // Extrae el nombre y el nick del cuerpo de la solicitud (body)
    const { nickUser, nameGame } = req.body;

    // Valida que el nombre y el nick estén presentes
    if (!nickUser || !nameGame) {
      return res
        .status(400)
        .json({ error: "Nombre del juego y nick del usuario son requeridos" });
    }

    try {
      // Crea un nuevo juego en la base de datos
      const newGame = await prisma.game.create({
        data: {
          nickUser,
          nameGame,
        },
      });
      // Devuelve el ID del nuevo juego con un estado 201 (Creado)
      res.status(201).json({ id: newGame.id });
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({ error: "Error al crear el juego" });
    }
  } else {
    // Si el método HTTP no es POST, devuelve un estado 405 (Método no permitido)
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
