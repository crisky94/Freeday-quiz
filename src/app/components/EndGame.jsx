'use client';

import { useState } from "react";

//Componente de la página de control-quiz, para eliminar jugadores y redirigir a home tanto al creador como a los jugadores.
export default function EndGame({ onSend }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="">
        <button
          type='button'
          className='hoverGradiant bg-custom-linear text-black px-5 text-sm h-12 rounded-lg hover:transition duration-200 font-bold'
          onClick={toggleModal}>
          Enviar a Home
        </button>
      {isOpen && (
        <div className='fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center'>
          <div className='mt-4 flex justify-center text-black gap-10'>
            <button onClick={onSend} className='hoverGradiant bg-custom-linear px-5 text-sm h-12 rounded-lg hover:transition duration-200 font-bold'>Confirmar Envio a Home</button>
            <button onClick={handleCancel} className='hoverGradiant bg-custom-linear px-5 text-sm h-12 rounded-lg hover:transition duration-200 font-bold'>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

