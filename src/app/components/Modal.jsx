'use client';
import { useState } from 'react';

export default function ModalComponent({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleSave = (e) => {
    e.preventDefault();
    toggleModal();
  };

  return (
    <>
      <button
        type='button'
        className='bg-blue-700  text-white px-5 text-xs h-12 rounded-lg hover:bg-blue-600 hover:transition duration-200'
        onClick={toggleModal}
      >
        Añadir descripción
      </button>
      {isOpen && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center  '>
          <div className='bg-white m-5 p-5 rounded shadow-lg max-w-lg w-full'>
            <h2 className='text-xl text-black font-bold mb-4'>Descripción:</h2>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className='w-full p-2 border text-black border-black rounded focus:outline-none focus:ring-5 focus:ring-purple-700 focus:border-purple-700'
              rows='5'
              placeholder='Escribe tu descripción aquí...'
            ></textarea>
            <div className='mt-4 flex font-bold text-xs justify-end'>
              <button
                type='button'
                onClick={handleSave}
                className='bg-primary text-white px-4 py-1 mx-2 rounded-lg shadow hover:bg-purple-700 hover:transition duration-200'
              >
                Guardar
              </button>
              <button
                type='button'
                className='bg-primary text-white px-4 py-1 mx-2 rounded-lg shadow hover:bg-red-500 hover:transition duration-200'
                onClick={toggleModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}