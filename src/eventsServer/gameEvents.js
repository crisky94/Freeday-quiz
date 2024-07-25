export function gameEvents(socket, prisma) {
  // Escuchamos el evento 'createGame' y recibimos los datos del juego (gamedata)
  socket.on('createGame', async (gamedata, callback) => {
    try {
      // Generamos un código aleatorio de 4 dígitos para el juego
      const codeGame = Math.floor(100000 + Math.random() * 900000);
      console.log(codeGame);

      // Insertamos en la base de datos la información del juego que se va a crear
      const game = await prisma.games.create({
        data: {
          detailGame: gamedata.detailGame,
          nickUser: gamedata.nickUser, // Nombre del usuario
          nameGame: gamedata.nameGame, // Nombre del juego
          codeGame: codeGame, // Código del juego
          endedAt: new Date(),//Fecha creado
        },
      });

      // Preparamos las preguntas del juego para insertarlas en la base de datos
      const asks = gamedata.asks.map((ask) => ({
        gameId: game.id, // ID del juego relacionado
        ask: ask.ask, // Pregunta
        a: ask.a, // Opción a
        b: ask.b, // Opción b
        c: ask.c, // Opción c
        d: ask.d, // Opción d
        answer: ask.answer, // Respuesta correcta
        timer: ask.timer,
      }));

      // Insertamos las preguntas en la base de datos
      await prisma.asks.createMany({
        data: asks,
      });

      // Llamamos al callback con la información del juego creado
      callback({ game });
    } catch (e) {
      console.error('error:', e);
      // Llamamos al callback con un error si algo sale mal
      callback({ error: 'Error al crear juego' });
    }
  });

  //*Obtener lista de juegos
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
          answer: true,
          timer: true,
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


  //*Actualizar el juego(modify)
  socket.on('updateGame', async ({ formData, gameId }, callback) => {
    try {
      // Preparamos las promesas de actualización de las preguntas
      const updateAsksPromises = formData.asks.map((ask) => {
        return prisma.asks.update({
          where: {
            id: ask.id, // asumiendo que cada ask tiene un id único
          },
          data: {
            ask: ask.ask,
            a: ask.a,
            b: ask.b,
            c: ask.c,
            d: ask.d,
            timer: parseInt(ask.timer),
            answer: ask.answer,
          },
        });
      });

      // Actualizar el juego (games)
      const updateGamePromise = prisma.games.update({
        where: {
          id: parseInt(gameId),
        },
        data: {
          nameGame: formData.gameName,
          detailGame: formData.gameDetail,
          endedAt: new Date(),
        },
      });

      // Esperar a que todas las operaciones de actualización se completen
      await Promise.all([...updateAsksPromises, updateGamePromise]);

      // Llamar al callback con éxito
      callback({ success: true });
    } catch (error) {
      console.error('Error al actualizar el juego:', error);
      // Llamar al callback con un mensaje de error si ocurre algún error
      callback({ error: 'Error al actualizar el juego' });
    }
  });

  //*Eliminar juego por id(games)
  socket.on('deleteGame', async ({ gameId }, callback) => {
    try {
      // Eliminar las preguntas relacionadas con el juego
      await prisma.asks.deleteMany({
        where: {
          gameId: parseInt(gameId), // Aseguramos que gameId es un entero
        },
      });

      // Eliminar el juego
      await prisma.games.delete({
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

}
