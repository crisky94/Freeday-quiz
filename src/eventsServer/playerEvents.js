export function playerEvents(socket, io, prisma, gamePlayerMap) {
  socket.on('joinRoom', async ({ nickname, code }) => {
    try {
      const game = await prisma.games.findUnique({
        where: { codeGame: code },
      });

      if (game) {
        const existingPlayer = await prisma.players.findFirst({
          where: {
            gameId: game.id,
            socketId: socket.id,
          },
        });

        if (existingPlayer) {
          socket.emit('nicknameConflict', {
            message: 'Ya tienes un player en esta sala',
          });
        } else {
          const player = await prisma.players.create({
            data: {
              playerName: nickname,
              gameId: game.id,
              score: 0,
              socketId: socket.id,
            },
          });

          socket.join(`game-${code}`);
          io.to(`game-${code}`).emit('newPlayer', player);
          gamePlayerMap[code] = socket.id;
          socket.emit('joinSuccess');
        }
      } else {
        socket.emit('error', { message: 'Juego no encontrado' });
      }
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      socket.emit('error', { message: 'Error al unirse a la sala' });
    }
  });

  socket.on('replaceNickname', async ({ nickname, code }) => {
    try {
      const game = await prisma.games.findUnique({
        where: { codeGame: code },
      });

      if (game) {
        await prisma.players.updateMany({
          where: {
            gameId: game.id,
            socketId: socket.id,
          },
          data: {
            playerName: nickname,
          },
        });

        const player = await prisma.players.findFirst({
          where: {
            gameId: game.id,
            socketId: socket.id,
          },
        });

        socket.join(`game-${code}`);
        io.to(`game-${code}`).emit('updatePlayer', player);
        gamePlayerMap[code] = socket.id;
        socket.emit('joinSuccess');
      } else {
        socket.emit('error', { message: 'Juego no encontrado' });
      }
    } catch (error) {
      console.error('Error al reemplazar nickname:', error);
      socket.emit('error', { message: 'Error al reemplazar nickname' });
    }
  });

  socket.on('deletePlayer', async ({ playerId, code }, callback) => {
    try {
      await prisma.players.delete({
        where: {
          id: playerId,
        },
      });

      // socket.leave(`game-${code}`);
      io.to(`game-${code}`).emit('exitPlayer', playerId);
      callback({ success: true });
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      callback({ error: 'Error al eliminar jugador' });
    }
  });

  // Obtener los jugadores del juego por código del juego
  socket.on('getPlayers', async ({ code }, callback) => {
    try {
      const game = await prisma.games.findUnique({
        where: {
          codeGame: code,
        },
      });

      if (game) {
        const players = await prisma.players.findMany({
          where: {
            gameId: game.id,
          },
          select: {
            id: true,
            playerName: true,
            socketId: true,
          },
        });
        callback({ players });
      } else {
        callback({ error: 'Juego no encontrado' });
      }
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
      callback({ error: 'Error al obtener jugadores' });
    }
  });
  // Escuchamos cuando el cliente se desconecta
  socket.on('disconnect', async () => {
    console.log(`Socket desconectado: ${socket.id} y eliminado `);
    try {
      const player = await prisma.players.findFirst({
        where: { socketId: socket.id },
      });

      if (player) {
        await prisma.players.delete({
          where: {
            id: player.id,
          },
        });

        const gameCode = Object.keys(gamePlayerMap).find(
          (code) => gamePlayerMap[code] === socket.id
        );

        if (gameCode) {
          io.to(`game-${gameCode}`).emit('exitPlayer', player.id);
          delete gamePlayerMap[gameCode];
        }
      }
    } catch (error) {
      console.error('Error al eliminar jugador en desconexión:', error);
    }
  });
}
