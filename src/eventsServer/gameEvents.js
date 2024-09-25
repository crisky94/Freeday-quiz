export function gameEvents(socket, io, prisma) {
  socket.on('createGame', async (gameData, callback) => {
    try {
      const codeGame = Math.floor(100000 + Math.random() * 900000);
      console.log('Received game data:', gameData);

      // Crear el juego en la base de datos
      const game = await prisma.games.create({
        data: {
          detailGame: gameData.detailGame,
          nickUser: gameData.nickUser,
          nameGame: gameData.nameGame,
          codeGame: codeGame,
          endedAt: new Date(),
        },
      });

      // Crear preguntas en la base de datos con URLs de imágenes
      const asks = gameData.asks.map((ask) => ({
        gameId: game.id,
        ask: ask.ask,
        a: ask.a,
        b: ask.b,
        c: ask.c || null,
        d: ask.d || null,
        timer: ask.timer,
        isCorrectA: ask.isCorrectA || false,
        isCorrectB: ask.isCorrectB || false,
        isCorrectC: ask.isCorrectC || false,
        isCorrectD: ask.isCorrectD || false,
        image: ask.image || null,
      }));

      await prisma.asks.createMany({
        data: asks,
      });

      callback({ game });
    } catch (e) {
      console.error('Error:', e);
      callback({ error: 'Error al crear juego' });
    }
  });

  socket.on('getGames', async ({ user }, callback) => {
    try {
      console.log('Usuario recibido:', user); // Verifica que el usuario sea el esperado

      const games = await prisma.games.findMany({
        where: {
          nickUser: user,
        },
        select: {
          id: true,
          nameGame: true,
          detailGame: true,
          endedAt: true,
          updateAt: true,
        },
      });

      callback({ games });
    } catch (e) {
      console.error('error:', e);
      callback({ error: 'Error al obtener juegos' });
    }
  });

  //*Obtener juego por id(modify)
  socket.on('getGamesId', async ({ gameId }, callback) => {
    try {
      // Consultamos todos los juegos en la base de datos
      const game = await prisma.games.findUnique({
        where: {
          id: parseInt(gameId),
        },
        select: {
          id: true,
          nameGame: true,
          detailGame: true,
          codeGame: true,
        },
      });

      // Llamamos al callback con los datos de los juegos obtenidos
      callback({ game });
    } catch (e) {
      console.error('error:', e);
      // Llamamos al callback con un error si algo sale mal
      callback({ error: 'Error al obtener juegos' });
    }
  });

  //*Obtener preguntas por id del juego(modify)
  socket.on('getAsks', async ({ gameId }, callback) => {
    try {
      // Consulta las preguntas del juego específico por su ID
      const questions = await prisma.asks.findMany({
        where: {
          gameId: parseInt(gameId), // Convertimos gameId a entero si es necesario
        },
        select: {
          id: true,
          ask: true,
          a: true,
          b: true,
          c: true,
          d: true,
          timer: true,
          image: true,
          isCorrectA: true,
          isCorrectB: true,
          isCorrectC: true,
          isCorrectD: true,
        },
      });

      // Llamamos al callback con las preguntas obtenidas
      callback({ questions });
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      // Llamamos al callback con un mensaje de error si ocurre algún error
      callback({ error: 'Error al obtener preguntas' });
    }
  });

  //* Actualizar juego(modify)
  socket.on('updateGame', async ({ formData, gameId }, callback) => {
    try {
      // Agregar un índice de orden a cada pregunta para preservar el orden
      const existingAsks = formData.asks
        .filter((ask) => ask.id)
        .map((ask) => ({ ...ask }));

      const newAsks = formData.asks
        .filter((ask) => !ask.id)
        .map((ask) => ({ ...ask }));

      // Actualizar las preguntas existentes de forma secuencial
      for (const ask of existingAsks) {
        await prisma.asks.updateMany({
          where: { id: ask.id },
          data: {
            ask: ask.ask,
            a: ask.a,
            b: ask.b,
            c: ask.c,
            d: ask.d,
            timer: parseInt(ask.timer),
            isCorrectA: ask.isCorrectA || false,
            isCorrectB: ask.isCorrectB || false,
            isCorrectC: ask.isCorrectC || false,
            isCorrectD: ask.isCorrectD || false,
            image: ask.image || null,
          },
        });
      }

      // Crear nuevas preguntas de forma secuencial
      for (const ask of newAsks) {
        await prisma.asks.create({
          data: {
            ask: ask.ask,
            a: ask.a,
            b: ask.b,
            c: ask.c,
            d: ask.d,
            timer: parseInt(ask.timer),
            isCorrectA: ask.isCorrectA || false,
            isCorrectB: ask.isCorrectB || false,
            isCorrectC: ask.isCorrectC || false,
            isCorrectD: ask.isCorrectD || false,
            image: ask.image || null,
            gameId: parseInt(gameId),
          },
        });
      }

      // Actualizar el juego (games)
      const updateGamePromise = prisma.games.update({
        where: { id: parseInt(gameId) },
        data: {
          nameGame: formData.gameName,
          detailGame: formData.gameDetail,
          updateAt: new Date(),
        },
      });

      await updateGamePromise;

      // Obtener las preguntas actualizadas y ordenarlas por el índice
      const asks = await prisma.asks.findMany({
        where: { gameId: parseInt(gameId) },
        orderBy: { id: 'asc' }, // Ordenar por el índice de orden
      });

      // Emitir el evento 'updatedAsks' a todos los clientes en la sala correspondiente
      io.emit('updatedAsks', { asks });

      // Llamar al callback con éxito
      callback({ success: true, asks });
    } catch (error) {
      console.error('Error al actualizar el juego:', error);
      // Llamar al callback con un mensaje de error si ocurre algún error
      callback({ error: 'Error al actualizar el juego' });
    }
  });

  //* Eliminar juego por id(games)
  socket.on('deleteGame', async ({ gameId }, callback) => {
    try {
      // Eliminar las preguntas relacionadas con el juego
      await prisma.asks.deleteMany({
        where: {
          gameId: parseInt(gameId), // Aseguramos que gameId es un entero
        },
      });

      // Eliminar el juego
      await prisma.games.deleteMany({
        where: {
          id: parseInt(gameId), // Aseguramos que gameId es un entero
        },
      });
      // Llamamos al callback con un mensaje de éxito
      callback({ success: true });
    } catch (error) {
      console.error('Error al eliminar el juego:', error);
      // Llamamos al callback con un mensaje de error si ocurre algún problema
      callback({ error: 'Error al eliminar el juego' });
    }
  });

  //* Obtener juegos vista previa(games)
  socket.on('getGameDetails', async ({ gameId }, callback) => {
    try {
      // Obtener el juego por ID
      const game = await prisma.games.findUnique({
        where: {
          id: parseInt(gameId),
        },
        select: {
          id: true,
          nameGame: true,
          detailGame: true,
          asks: {
            select: {
              ask: true,
              a: true,
              b: true,
              c: true,
              d: true,
              isCorrectA: true,
              isCorrectB: true,
              isCorrectC: true,
              isCorrectD: true,
              timer: true,
              image: true,
            },
          },
        },
      });

      // Llamar al callback con los detalles del juego
      callback({ game });
    } catch (e) {
      console.error('Error al obtener detalles del juego:', e);
      // Llamar al callback con un mensaje de error si ocurre algún problema
      callback({ error: 'Error al obtener detalles del juego' });
    }
  });

  // * Elimnar preguntas(modify)
  socket.on('deleteAsk', async ({ askId }, callback) => {
    try {
      // Eliminar las preguntas
      const data = await prisma.asks.delete({
        where: {
          id: parseInt(askId), // Aseguramos que askId es un entero
        },
      });
      io.emit('updateDeleteAsk', { data });
      // Llamamos al callback con un mensaje de éxito
      callback({ success: true });
    } catch (error) {
      console.error('Error al eliminar la pregunta:', error);
      // Llamamos al callback con un mensaje de error si ocurre algún problema
      callback({ error: 'Error al eliminar la pregunta' });
    }
  });

  let gameState = '';

  //* Pausar juego(control-quiz)
  socket.on('pauseGame', () => {
    gameState = 'paused';
    io.emit('gameStateUpdate', gameState);
    io.emit('pauseGame');
  });

  //* Reanudar juego(control-quiz)
  socket.on('resumeGame', () => {
    gameState = 'resumed';
    io.emit('gameStateUpdate', gameState);
    io.emit('resumeGame');
  });

  //* Finalizar juego(control-quiz)
  socket.on('stopGame', () => {
    gameState = 'stopped';
    io.emit('gameStateUpdate', gameState);
    io.emit('stopGame');
  });
}
