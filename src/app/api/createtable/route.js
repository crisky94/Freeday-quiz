import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json(); // Obtiene el cuerpo de la solicitud en formato JSON
    console.log(body);
    const { gameId } = body; // Extrae el gameId del cuerpo de la solicitud
    console.log(gameId);

    if (!gameId) {
      // Verifica que gameId esté presente
      return new Response(
        JSON.stringify({ message: "Game ID es obligatorio" }),
        { status: 400 }
      );
    }

    const game = await prisma.games.findUnique({
      where: { id: gameId }, // Busca el juego en la base de datos usando gameId
    });

    if (!game) {
      // Verifica si el juego no fue encontrado
      return new Response(JSON.stringify({ message: "No existe el juego" }), {
        status: 404,
      });
    }

    const tableName = `temp_${game.nameGame}`; // Crea el nombre de la tabla temporal basado en el nombre del juego

    await prisma.$executeRawUnsafe(`
      CREATE TEMPORARY TABLE ${tableName} (
        nickPlayer VARCHAR(255),
        Points INT
      );
    `); // Crea una tabla temporal con las columnas nickPlayer y Points

    return new Response(
      JSON.stringify({ message: "Tabla temporal creada", tableName }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error); // Imprime cualquier error en la consola
    return new Response(
      JSON.stringify({ message: "Error del servidor", error: error.message }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Desconecta el cliente de Prisma
  }
}
