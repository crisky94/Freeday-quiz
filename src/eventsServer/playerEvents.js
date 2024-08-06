export function playerEvents(socket, io, prisma, gamePlayerMap) {
  // * Unir jugaodres(waiting-room)
  socket.on('joinRoom', async ({ nickname, code }) => {
    try {
      const game = await prisma.games.findUnique({
        where: { codeGame: code },
      });


      if (game) {
        if (nickname) {
          // Es un jugador que se une
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
            console.log('New player emitted:', player);
            gamePlayerMap[code] = socket.id;
            socket.emit('joinSuccess');
          }
        } else {
          // Es el administrador que se une
          socket.join(`game-${code}`);
          console.log('Admin joined the game:', code);
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

  // * Mandar a los jugadores al juego(pinPage)
  socket.on('startGame', async ({ code }) => {
    try {
      const game = await prisma.games.findUnique({
        where: { codeGame: code },
      });

      if (game) {
        io.to(`game-${code}`).emit('gameStarted', { code });
        console.log(`Game started for code: ${code}`);
      } else {
        socket.emit('error', { message: 'Juego no encontrado' });
      }
    } catch (error) {
      console.error('Error al iniciar el juego:', error);
      socket.emit('error', { message: 'Error al iniciar el juego' });
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

  //* Eliminar jugadores(waiting-room)
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

  //* Obtener jugadores(header-sidebar-waitingRoom-pageGame)
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
            score: true,
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

  //* Valiidar el pin(access-pin)
  socket.on('correctCodeGame', async ({ code }, callback) => {
    try {
      const game = await prisma.games.findUnique({
        where: {
          codeGame: code,
        },
        select: {
          codeGame: true,
          id: true,
        },
      });
      const gameId = game.id;
      if (game && game.codeGame === code) {
        callback({ success: true, message: 'Pin correcto!', gameId });
      } else {
        callback({ success: false, message: 'Pin incorrecto!' });
      }
    } catch (error) {
      console.error('Error al buscar el juego:', error);
      callback({ success: false, message: 'Error al buscar el juego' });
    }
  });

  //* Obtener el juego mediante el codigo(page-game)
  socket.on('getCodeGame', async ({ code }, callback) => {
    try {
      const game = await prisma.games.findUnique({
        where: {
          codeGame: code, // Asegúrate de que codeGame sea un número entero
        },
        select: {
          id: true,
        },
      });

      if (!game) {
        return callback({ success: false, message: 'Juego no encontrado' });
      }

      const asks = await prisma.asks.findMany({
        where: {
          gameId: game.id,
        },
        select: {
          id: true,
          ask: true,
          a: true,
          b: true,
          c: true,
          d: true,
          timer: true,
          answer: true,
        },
      });

      callback({ success: true, asks, game });
    } catch (error) {
      callback({ success: false, message: 'Error al validar el PIN' });
    }
  });

  //* Insertar jugadores en la tabla jugadores bd(page-game)
  socket.on('insertPlayer', async ({ gameId, playerName, score }, callback) => {
    try {
      // Buscar el jugador por gameId y playerName
      const player = await prisma.Players.findFirst({
        where: {
          gameId,
          playerName,
        },
      });

      if (player) {
        // Sumar el puntaje actual al puntaje existente
        await prisma.Players.update({
          where: { id: player.id },
          data: { score: player.score + score },
        });
      } else {
        // Crear un nuevo registro si el jugador no existe
        await prisma.Players.create({
          data: {
            gameId,
            playerName,
            score,
          },
        });
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error al actualizar el puntaje:', error);
      callback({ error: 'Failed to update score' });
    }
  });

//* Eliminar todos los jugadores de un juego en especifico(control-quiz)

  socket.on('deleteAllPlayers', async ({ gameId }, callback) => {
    try {
      // Eliminar todos los jugadores que pertenecen a un juego específico
         await prisma.players.deleteMany({
        where: {
             gameId,
        },
      });
   
      callback({ success: true });
    } catch (error) {
      console.error('Error al eliminar jugadores:', error.message, error.stack);
      callback({ error: 'Error al eliminar jugadores' });
    }
  });

//* Emitir evento de ranking a los jugadores
  socket.on('playerRanking', ({ ranking }) => {
    // Emitir a todos los jugadores conectados que deben ir a la pantalla final
    io.emit('redirectToFinalScreen', { ranking });
  });

  socket.on('endGame', () => {
    // Lógica para eliminar a los jugadores del juego y finalizarlo
    

    // Emitir a todos los jugadores conectados que deben ir a la pantalla principal
    io.emit('redirectToMainScreen');
  });

}
