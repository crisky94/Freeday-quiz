// Importa Prisma y NextResponse
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

// Función para manejar las solicitudes POST (guardar rankings)
export async function POST(req) {
  try {
    // Extrae el cuerpo de la solicitud
    const { rankings } = await req.json();

    // Guarda los rankings en la base de datos
    const savedRankings = await prisma.rankings.createMany({
      data: rankings,
    });

    // Devuelve una respuesta de éxito
    return NextResponse.json(savedRankings, { status: 201 });
  } catch (error) {
    // Manejo de errores internos del servidor
    console.error('Error saving rankings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
