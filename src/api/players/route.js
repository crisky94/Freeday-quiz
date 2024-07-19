import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { gameId, playerName, score } = req.body;

    try {
      const player = await prisma.player.create({
        data: {
          gameId,
          playerName,
          score
        }
      });

      res.status(200).json(player);
    } catch (error) {
      res.status(500).json({ error: 'Error inserting player' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
