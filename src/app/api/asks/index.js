import { PrismaClient } from "@prisma/client";

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Verifica si el método HTTP de la solicitud es POST
  if (req.method === "POST") {
    // Extrae los datos del cuerpo de la solicitud (body)
    const { gameId, ask, a, b, c, d, answer } = req.body;

    // Valida que todos los campos estén presentes
    if (!gameId || !ask || !a || !b || !c || !d || !answer) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    try {
      // Crea una nueva pregunta en la base de datos
      const newAsk = await prisma.ask.create({
        data: {
          gameId: parseInt(gameId), // Convierte el juegoId a un número entero
          ask,
          a,
          b,
          c,
          d,
          answer,
        },
      });
      // Devuelve la nueva pregunta creada en formato JSON con un estado 201 (Creado)
      res.status(201).json(newAsk);
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      res.status(500).json({ error: "Error al crear la pregunta" });
    }
  } else {
    // Si el método HTTP no es POST, devuelve un estado 405 (Método no permitido)
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
