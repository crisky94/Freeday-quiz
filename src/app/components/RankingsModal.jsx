'use client';
import { useState } from 'react';
import { Flip, ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
export default function GameRankings({ gameId }) {
  const [rankings, setRankings] = useState({});
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchRankings = async () => {
    setError(null);
    try {
      const response = await fetch(`/api/saveRankings/${gameId}`);
      if (!response.ok) {
        throw new Error('Error fetching rankings');
      }
      const data = await response.json();
      if (Object.keys(data).length === 0) {
        // Si no hay resultados, mostrar el toast
        toast.info('Aun no hay resultados disponibles ', {
          position: 'bottom-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          closeButton: false,
          transition: Flip,
        });
      } else {
        setRankings(data);
        setIsVisible(true); // Mostrar el modal solo cuando se hayan obtenido los datos
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError(
        'No se pudieron obtener los rankings. Inténtalo de nuevo más tarde.'
      );
    }
  };

  const closeModal = () => {
    setIsVisible(false);
    setRankings([]);
  };
  // Función para formatear la fecha en el formato "DD-MM-YYYY".
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Los meses en JavaScript son 0-indexados
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return (
    <div>
      <button
        className='mb-1 bg-secundary text-black py-1 px-1 rounded  text-xs transition'
        onClick={fetchRankings}
      >
        Ver resulados
      </button>

      {isVisible && (
        <div className='fixed inset-0 z-50 flex items-center justify-center  bg-opacity-75 h-full w-full overflow-auto'>
          <div className='relative mt-2 bgroom p-4 rounded shadow-lg w-full max-w-4xl h-auto overflow-y-auto max-h-screen'>
            <button
              className='absolute  top-4 right-2 text-white px- hover:text-primary transition'
              onClick={closeModal}
            >
              X
            </button>
            {error && <div className='text-red-500 mt-2 h-screen'>{error}</div>}
            <h3 className=' pb-2 font-bold text-primary '>Resultados</h3>
            <ul className='space-y-4'>
              {Object.keys(rankings).map((date) => (
                <li key={date} className='text-secundary border py-1 text-xs'>
                  <h4 className='font-semibold'>{formatDate(date)}</h4>
                  <ul className='space-y-2'>
                    {rankings[date].map((player, index) => (
                      <li key={index} className='text-primary   '>
                        <p>
                          <span className='font-semibold'>
                            {player.playerName}
                          </span>
                          {' | '}
                          {player.playerScore}PX
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
