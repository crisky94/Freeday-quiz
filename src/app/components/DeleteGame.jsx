import { useState } from 'react';

const DeleteConfirmation = ({ gameId, onDelete }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = () => {
    onDelete(gameId);
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className='mb-2 ml-2 select-none rounded-lg bg-red-500 py-1 px-2 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'
      >
        <svg
          className='h-5 w-8 ml-3 text-black'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          stroke-width='2'
          stroke='currentColor'
          fill='none'
          stroke-linecap='round'
          stroke-linejoin='round'
        >
          {' '}
          <path stroke='none' d='M0 0h24v24H0z' />{' '}
          <line x1='4' y1='7' x2='20' y2='7' />{' '}
          <line x1='10' y1='11' x2='10' y2='17' />{' '}
          <line x1='14' y1='11' x2='14' y2='17' />{' '}
          <path d='M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12' />{' '}
          <path d='M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3' />
        </svg>
        Eliminar
      </button>

      {showConfirmation && (
        <div className='fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full text-white'>
            <p className='text-lg font-semibold mb-4'>
              ¿Estás seguro que deseas eliminar este juego?
            </p>
            <div className='flex justify-end'>
              <button
                onClick={handleCancel}
                className='text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg mr-2'
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className='text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg'
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteConfirmation;
