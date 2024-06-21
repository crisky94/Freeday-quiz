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

  // Inicia el servidor
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(` Servidor escuchando en http://localhost:${port}`);
  });
});
