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
        timeLimit: ask.timeLimit,
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

  // Evento para obtener los juegos
  socket.on('getGames', async (callback) => {
    try {
      // Consultamos todos los juegos en la base de datos
      const games = await prisma.games.findMany({
        select: {
          id: true,
          nameGame: true,
          detailGame: true,
        },
      });

      // Llamamos al callback con los datos de los juegos obtenidos
      callback({ games });
    } catch (e) {
      console.error('error:', e);
      // Llamamos al callback con un error si algo sale mal
      callback({ error: 'Error al obtener juegos' });
    }
  });
}
