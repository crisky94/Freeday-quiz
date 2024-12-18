'use client';
import '@/app/styles/TitleAnimation.css';
import { useState } from 'react';
import { useSocket } from '@/context/socketContext';
import { Flip, ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

function AccessPin({ gameId }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const socket = useSocket();
  // Maneja el cambio de valor en el input para el PIN
  const handleInputChange = (e) => {
    setCode(parseInt(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Emite un evento a través de Socket.IO para verificar el código del juego.
    socket.emit('correctCodeGame', { code, gameId }, (response) => {
      if (response.success) {
        sessionStorage.setItem('pin', code); // Almacenar el PIN después de la validación
        toast.success(response.message, {
          autoClose: 1000,
          position: 'bottom-center',
          theme: 'light',
          transition: Flip,
          onClose: () => {
            router.push(`/pages/nick-name-form/${code}`); // Dirige a los jugadores a la pagina para introducir nick
          },
        });
      } else {
        toast.error(response.message, {
          autoClose: 2000,
          onClose: () => {
            router.refresh();
          },
        });
      }
    });
  };
  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full'>
      <div className='flex w-full h-auto bg-[#111] text-center justify-center items-center mb-32 '>
        <h1 className='title text-4xl md:text-6xl lg:text-6xl gradient-text font-bold '>
          ¡Bienvenido/a a <span className='uppercase'>FreedayQuiz</span>!
        </h1>
      </div>
      <div className='bg-custom-linear flex '>
        <div className='flex flex-col p-8 m-1 w-full items-center bg-black '>
          <label className=' uppercase text-xl mb-6'>Introduce el pin</label>
          <input
            type='text'
            placeholder='PIN'
            onChange={handleInputChange}
            name='pin'
            className='text-black text-center  rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-secundary focus:border-transparent'
          />
          <ToastContainer />
          <button
            className='  text-black w-40 h-10 mt-5 font-bold rounded-md hoverGradiant bg-custom-linear'
            onClick={handleSubmit}
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessPin;
