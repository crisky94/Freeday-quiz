'use client';
import { useState } from 'react';

export default function ModalComponent({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setLocalValue(value);
    } else {
      setLocalValue('');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onChange(localValue);
    toggleModal();
  };

  return (
    <>
      <button
        type='button'
        className='hoverGradiant bg-custom-linear text-black ml-5 text-xs h-12 p-1 rounded-lg hover:transition duration-200 font-bold'
        onClick={toggleModal}
      >
        Añadir descripción
      </button>
      {isOpen && (
        <div className='fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-10'>
          <div className='bg-white m-5 p-5 rounded shadow-lg max-w-lg w-full'>
            <p className='text-gray-500 text-xs'>(opcional)</p>
            <h2 className='text-xl text-black font-bold mb-4'>Descripción:</h2>
            <textarea
              maxLength={250}
              autoFocus
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              className='w-full p-2 border text-black border-black rounded focus:outline-none focus:ring-5  focus:border-'
              rows='5'
              placeholder='Escribe tu descripción aquí...'
            ></textarea>
            <div className='mt-4 flex font-bold text-xs justify-end'>
              <button
                type='button'
                onClick={handleSave}
                className='hoverGradiant bg-custom-linear text-black px-4 py-1 mx-2 rounded-lg shadow  hover:transition duration-200'
              >
                Guardar
              </button>
              <button
                type='button'
                className='hoverGradiant bg-custom-linear text-black px-4 py-1 mx-2 rounded-lg shadow  hover:transition duration-200'
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
