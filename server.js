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

    // Escuchamos cuando el cliente se desconecta
    socket.on('disconnect', () => {
      console.log('socket desconectado 😐');
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
});
