// Importamos los módulos necesarios
import next from 'next';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { gameEvents } from './src/eventsServer/gameEvents.js';
import { playerEvents } from './src/eventsServer/playerEvents.js';
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

  const gamePlayerMap = {};

  // Escuchamos cuando un cliente se conecta vía WebSocket
  io.on('connection', (socket) => {
    console.log(`socket conectado con id:${socket.id}`);

    // aqui van los eventos del juego y jugadores
    gameEvents(socket, prisma);
    playerEvents(socket, io, prisma, gamePlayerMap);

    socket.on('disconnect', () => {
      console.log('socket desconectado 😐');
    });

  });
  
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
});
