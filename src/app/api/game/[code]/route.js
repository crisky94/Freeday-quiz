// Importa Prisma y NextResponse
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

// Función para manejar las solicitudes GET
export async function GET(req, { params }) {
  try {
    // Busca el juego por el codeGame proporcionado en los parámetros
    const game = await prisma.games.findUnique({
      where: {
        codeGame: Number(params.code),
      },
    });

    // Si no se encuentra el juego, devuelve un error 404
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Si se encuentra el juego, devuelve los detalles con estado 200
    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    // Manejo de errores internos del servidor
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
