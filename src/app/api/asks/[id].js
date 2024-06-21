import { PrismaClient } from "@prisma/client";

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Extrae el parámetro 'id' de la consulta (query)
  const { id } = req.query;

  // Verifica si el método HTTP de la solicitud es GET
  if (req.method === "GET") {
    try {
      // Busca todas las preguntas (asks) que corresponden al juego con el id proporcionado
      const asks = await prisma.ask.findMany({
        where: {
          gameId: parseInt(id), // Convierte el id a un número entero
        },
      });
      // Devuelve las preguntas en formato JSON con un estado 200 (OK)
      res.status(200).json(asks);
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({ error: "Error al obtener las preguntas" });
    }
  } else {
    // Si el método HTTP no es GET, devuelve un estado 405 (Método no permitido)
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
