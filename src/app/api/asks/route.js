import { PrismaClient } from "@prisma/client";
import { checkAuth } from "../../../lib/authApi";
import { NextResponse } from "next/server";

// Inicializa el cliente de Prisma fuera del handler para evitar múltiples conexiones
const prisma = new PrismaClient();

export async function handler(req) {
  // Verifica la autenticación del usuario
  const { isAuthenticated, response, userId } = await checkAuth(req);

  // Si el usuario no está autenticado, devuelve la respuesta de error
  if (!isAuthenticated) {
    return response;
  }

  // Verifica si el método HTTP de la solicitud es POST
  if (req.method === "POST") {
    try {
      // Extrae los datos del cuerpo de la solicitud (body)
      const { gameId, ask, a, b, c, d, answer } = await req.json();

      // Valida que todos los campos estén presentes
      if (!gameId || !ask || !a || !b || !c || !d || !answer) {
        return NextResponse.json(
          { error: "Todos los campos son requeridos" },
          { status: 400 }
        );
      }

      // Crea una nueva pregunta en la base de datos
      const newAsk = await prisma.ask.create({
        data: {
          gameId: parseInt(gameId), // Convierte gameId a un número entero
          ask, // La pregunta
          a, // Opción A
          b, // Opción B
          c, // Opción C
          d, // Opción D
          answer, // Respuesta correcta
        },
      });

      // Devuelve la nueva pregunta creada en formato JSON con un estado 201 (Creado)
      return NextResponse.json(newAsk, { status: 201 });
    } catch (error) {
      // En caso de error, devuelve un estado 500 (Error del servidor) con un mensaje de error
      return NextResponse.json(
        { error: "Error al crear la pregunta" },
        { status: 500 }
      );
    }
  } else {
    // Si el método HTTP no es POST, devuelve un estado 405 (Método no permitido)
    return NextResponse.json(
      { error: `Método ${req.method} no permitido` },
      { status: 405, headers: { Allow: "POST" } }
    );
  }
}
