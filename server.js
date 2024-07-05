// Importamos los módulos necesarios
import next from 'next';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';


// Creamos una instancia del cliente de Prisma
const prisma = new PrismaClient();

// Definimos si estamos en modo desarrollo o producción
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost'; // Nombre del host
const port = 3000;
// Inicializamos la aplicación Next.js
const app = next({ dev, hostname, port });

// Manejador para todas las peticiones HTTP con Next.js
const handler = app.getRequestHandler();

// Preparamos la aplicación Next.js
app.prepare().then(() => {
  // Creamos el servidor HTTP
  const httpServer = createServer(handler);

  // Inicializamos el servidor de Socket.io sobre el servidor HTTP
  const io = new SocketServer(httpServer);

  // Escuchamos cuando un cliente se conecta vía WebSocket
  io.on('connection', (socket) => {
    console.log(`socket conectado con id:${socket.id}`);
    socket.on('disconnect', () => {
      console.log('socket desconectado 😐');
    });
    // Escuchamos el evento 'createGame' y recibimos los datos del juego (gamedata)
    socket.on('createGame', async (gamedata, callback) => {
      try {
        // Generamos un código aleatorio de 4 dígitos para el juego
        const codeGame = Math.floor(1000 + Math.random() * 9000);
        console.log(codeGame);

        // Insertamos en la base de datos la información del juego que se va a crear
        const game = await prisma.games.create({
          data: {
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
    // Evento para obtener solo los títulos de los juegos
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
    //obtener juego por id
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
            answer: true,
          },
        })

        // Llamamos al callback con las preguntas obtenidas
        callback({ questions });
      } catch (error) {
        console.error('Error al obtener preguntas:', error);
        // Llamamos al callback con un mensaje de error si ocurre algún error
        callback({ error: 'Error al obtener preguntas' });
      }
    });

    socket.on('updateGame', async ({ formData, gameId }, callback) => {
      try {
        // Preparamos las promesas de actualización de las preguntas
        const updateAsksPromises = formData.asks.map((ask, index) => {
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
              answer: ask.answer
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

    socket.on("correctCodeGame", async ({ code }, callback) => {
      try {
        const game = await prisma.games.findUnique({
          where: {
            codeGame: code,
          },
          select: {
            codeGame: true,
            id: true,
          }
        });
        const gameId = game.id
        if (game && game.codeGame === code) {
          callback({ success: true, message: "Pin correcto!", gameId });
        } else {
          callback({ success: false, message: "Pin incorrecto!" });
        }
      } catch (error) {
        console.error('Error al buscar el juego:', error);
        callback({ success: false, message: 'Error al buscar el juego' });
      }
    });

    //obtener el juego por el code
    socket.on('getCodeGame', async ( {code} , callback) => {
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
            gameId: game.id
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
          }
        });

        callback({ success: true, asks });

      } catch (error) {
        callback({ success: false, message: 'Error al validar el PIN' });
      }
    });
    // Escuchamos cuando el cliente se desconecta

  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
});
