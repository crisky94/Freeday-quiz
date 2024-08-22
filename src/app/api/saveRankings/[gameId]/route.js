import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prismaClient.js';

export async function GET(req, { params }) {
  const { gameId } = params;

  try {
    // Convertir gameId a un número entero
    const gameIdInt = parseInt(gameId);

    // Verificar que gameId es un número válido
    if (isNaN(gameIdInt)) {
      return NextResponse.json({ error: 'Invalid gameId' }, { status: 400 });
    }

    // Obtén todos los rankings para el gameId especificado
    const rankings = await prisma.rankings.findMany({
      where: {
        gameId: gameIdInt, // Utilizar el gameId como entero
      },
      orderBy: {
        createdAt: 'asc', // Ordenar por fecha
      },
      select: {
        id: true,
        rank: true,
        playerName: true,
        playerScore: true,
        createdAt: true,
      },
    });
    // Verifica si no hay rankings y devuelve un objeto vacío con estado 200
    if (!rankings.length) {
      return NextResponse.json({}, { status: 200 });
    }

    // Agrupa los rankings por su fecha de creación
    const groupedRankings = rankings.reduce((acc, ranking) => {
      const date = ranking.createdAt.toISOString(); // Obtener solo la fecha
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        playerName: ranking.playerName,
        playerScore: ranking.playerScore,
      });
      return acc;
    }, {});

    if (Object.keys(groupedRankings).length === 0) {
      return NextResponse.json({ error: 'No rankings found' }, { status: 404 });
    }

    return NextResponse.json(groupedRankings, { status: 200 });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
