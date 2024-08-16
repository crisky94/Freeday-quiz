'use client';
import { useState } from 'react';

export default function GameRankings({ gameId }) {
  const [rankings, setRankings] = useState({});
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState(false);

  const fetchRankings = async () => {
    setError(null);
    try {
      const response = await fetch(`/api/saveRankings/${gameId}`);
      if (!response.ok) {
        throw new Error('Error fetching rankings');
      }
      const data = await response.json();
      if (Object.keys(data).length === 0) {
        setNoResultsMessage(true);
        setTimeout(() => {
          setNoResultsMessage(false);
        }, 3000);
      } else {
        setRankings(data);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError(
        'No se pudieron obtener los rankings. Inténtalo de nuevo más tarde.'
      );
      setIsVisible(true);
    }
  };

  const closeModal = () => {
    setIsVisible(false);
    setRankings([]);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <div>
      <div className='relative w-full'>
        <button
          className='mb-1 hover:font-bold bg-secundary text-black p-1 rounded text-xs transition'
          onClick={fetchRankings}
        >
          Ver resultados
        </button>
        {noResultsMessage && ( // Conditional rendering for no results message
          <p className='text-white  text-xs absolute bottom-1 z-50 bg-red-500 p-1  rounded-sm'>
            No hay resultados disponibles
          </p>
        )}
      </div>

      {isVisible && (
        <div className='fixed inset-0  z-50 flex items-center justify-center bg-opacity-75 h-full w-full overflow-auto'>
          <div className='relative  bgroom p-4 rounded shadow-lg w-full max-w-4xl h-full overflow-y-auto max-h-screen'>
            <button
              className='absolute top-10 right-4 text-white hover:text-primary transition'
              onClick={closeModal}
            >
              X
            </button>
            <h3 className='pb-2 font-bold mt-6 text-primary'>Resultados</h3>
            {error ? (
              <div className='text-red-500 mt-2'>{error}</div>
            ) : (
              <ul className='space-y-4'>
                {Object.keys(rankings)
                  .sort((a, b) => new Date(b) - new Date(a)) // Ordenar fechas de forma descendente
                  .map((date) => (
                    <li
                      key={date}
                      className='text-secundary border rounded-md py-1 text-xs'
                    >
                      <h4 className='font-semibold'>{formatDate(date)}</h4>
                      <ul className='space-y-2'>
                        {rankings[date].map((player, index) => (
                          <li key={index} className='text-primary'>
                            <p>
                              <span>{player.playerName}</span>
                              {' | '}
                              {player.playerScore}PX
                            </p>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
