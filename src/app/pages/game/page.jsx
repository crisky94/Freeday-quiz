'use client';
import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import Link from 'next/link';

function GamesList() {
  const [games, setGames] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    socket.emit('getGames', (response) => {
      if (response.error) {
        setError(response.error);
      } else {
        setGames(response.games); // Asumiendo que setGames actualiza el estado de los juegos en tu componente
      }
    });

  }, [games]);

  return (
    <div className="w-full p-4 mt-4 border  rounded-lg shadow-xl sm:p-6">
      {games.length > 0 ? (
        <div className='flex flex-col items-center w-full'>
          <ul className='w-full mb-5'>
            {games.map((game) => (
              <li key={game.id} className="border-b py-4">
                <Link href={`pages/games/${game.id}`}>
                  <h2 className="text-xl font-bold mb-2">{game.id}. {game.nameGame}</h2>
                  <p className="text-gray-700">{game.detailGame}</p>
                </Link>
                <div className='flex flex-wrap justify-end  gap-5 mt-5 w-full'>
                  <button
                    onClick={() => handleStartGame(game.id)}
                    className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  >
                    Start Game
                  </button>
                  <Link key={game.id} href={`/pages/modify-page/${game.id}`}>
                    <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                      Edit
                    </button>
                  </Link>
                  <button
                    key={game.id}
                    onClick={() => handleDelete(game.id)}
                    className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  >
                    Delete
                  </button>

                </div>
              </li>

            ))}
          </ul>
          <div className='flex justify-center w-full'>
            <Link href={"/pages/create-quiz"}>
              <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                New Game
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className='flex justify-center w-full'>
          <Link href={"/pages/create-quiz"}>
            <h1>Aun no tienes juegos creados</h1>
            <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              New Game
            </button>
          </Link>
        </div>
      )}
    </div>

  );
}

export default GamesList;
