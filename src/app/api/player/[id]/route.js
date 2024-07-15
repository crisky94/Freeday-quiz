// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   const { socketId } = req.query;

//   try {
//     const player = await prisma.players.findFirst({
//       where: {
//         socketId: socketId,
//       },
//     });

//     if (player) {
//       await prisma.players.delete({
//         where: {
//           id: player.id,
//         },
//       });

//       res.status(204).end();
//     } else {
//       res.status(404).json({ error: 'Jugador no encontrado' });
//     }
//   } catch (error) {
//     console.error('Error al eliminar jugador:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// }
