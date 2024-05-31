// !SERVER SOCKET>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import next from 'next';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new SocketServer(httpServer);

  io.on('connection', (socket) => {
    console.log(`socket conectado con id:${socket.id}`);

    socket.on('disconnect', () => {
      console.log('socket desconectado 😐');
    });

    // !AQUI VA EL RESTO DE EVENTOS DEL LADO DEL SERVER
    //  unirse al juego
    socket.on('joinGame', ({ playerName, gameId }) => {
      players[socket.id] = { name: playerName, score: 0 };
      socket.join(gameId);
      io.to(gameId.emit('playerjoined', { playerName, playerId: socket.id }));
    });
  });

  // Inicia el servidor
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(` Servidor escuchando en http://localhost:${port}`);
  });
});
