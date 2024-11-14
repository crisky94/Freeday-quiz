'use client';

import { useState } from 'react';
import Image from 'next/image';

// Componente para ver ranking y enviarselo a los jugadores si se desea.
export default function RankingModal({ ranking, onSend }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type='button'
        className='hoverGradiant bg-custom-linear text-black px-5 text-md w-48 h-12 rounded-md hover:transition duration-200 font-bold'
        onClick={toggleModal}
      >
        Ver Ranking
      </button>
      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center pt-28 z-50'>
          <div className='bg-white m-4 p-1 rounded-md shadow-lg max-w-lg w-full'>
            <h2 className='text-xl text-black font-bold mb-4 text-center'>
              Ranking de Jugadores
            </h2>

            {/* Contenedor con scroll para el ranking */}
            <div className='grid grid-cols-1 max-h-96 overflow-y-auto'>
              {ranking
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={index}
                    className='flex items-center w-full bg-black p-2 justify-between rounded-md mb-1'
                  >
                    <div dangerouslySetInnerHTML={{ __html: player.avatar }} />
                    <div className='ml-4 mr-4 font-semibold text-white'>
                      {' '}
                      {player.playerName}
                    </div>

                    <div className='flex flex-col items-center'>
                      {index === 0 && (
                        <Image
                          src='/corona1.png'
                          width={25}
                          height={250}
                          alt='crown1'
                        />
                      )}
                      {index === 1 && (
                        <Image
                          src='/corona2.png'
                          width={20}
                          height={20}
                          alt='crown2'
                        />
                      )}
                      {index === 2 && (
                        <Image
                          src='/corona3.png'
                          width={20}
                          height={20}
                          alt='crown3'
                        />
                      )}
                      <div className='text-secundary font-bold  '>
                        {player.score}px
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {/* Botones de acción */}
            <div className='mt-4 flex justify-center gap-10'>
              <button
                onClick={onSend}
                className='hoverGradiant bg-custom-linear  text-black px-4 text-sm h-10 rounded-lg hover:transition duration-200 font-bold'
              >
                Enviar Ranking
              </button>
              <button
                onClick={handleCancel}
                className='hoverGradiant bg-custom-linear text-black px-5 text-sm h-10 rounded-lg hover:transition duration-200 font-bold'
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
