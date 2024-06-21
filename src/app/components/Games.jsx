'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function GamesList() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('pages/api/games/index.js');
        if (!response.ok) {
          throw new Error('Error al obtener las preguntas');
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchGames();
  }, [games]);

  return (
    <>
    {
      games ? (
         <div>
      <h1 className="text-2xl font-bold mb-4">Games List</h1>
      <ul>
        {games.map((games) => (
          <Link href={`/pages/game/${games.id}`} key={games.id} className="mb-2">
          
            <li>
              {games.id}.{games.title}
            </li>
          
          </Link>
        ))}
      </ul>
    </div>
      )
      : <Link href={"/pages/create-quiz"}>
          <button className="">Nuevo Juego</button>
      </Link>
    }
    </>
   
  );
}

export default GamesList;
