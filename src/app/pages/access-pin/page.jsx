'use client';

import { useState } from 'react';
import { useSocket } from '@/context/socketContext';
import { Flip, ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

function AccessPin({ gameId }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const socket = useSocket();
  const toastDuration = 100;

  const handleInputChange = (e) => {
    setCode(parseInt(e.target.value));
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    socket.emit('correctCodeGame', { code, gameId }, (response) => {
      if (response.success) {
        toast.success(response.message, {

          autoClose: 1000,
          position: 'bottom-center',
          theme: 'light',
          transition: Flip,
          onClose: () => {
            router.push(`/pages/nick-name-form/${code}`);
          },
        });
      } else {
        toast.error(response.message, {
          autoClose: 2000,
          onClose: () => {
            window.location.reload();
          },
        });
      }
    });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen '>
      <div className="flex flex-col p-20 m-5 w-72 sm:w-full items-center border-4 border-l-yellow-200 border-r-green-200 border-t-cyan-200 border-b-orange-200 bg-[#111] rounded-md">
        <label className='bg-black uppercase text-xl mb-6'>Introduce el pin</label>
        <input
          type="text"
          placeholder="PIN"

          onChange={handleInputChange}
          name="pin"
          className="text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
        <ToastContainer />
        <button
          className=" border text-white w-40 h-10 mt-5 font-bold rounded-md hover:shadow-lg hover:shadow-yellow-400"
          onClick={handleSubmit}
        >
          Ingresar
        </button>

      </div>
    </div>
  );
}

export default AccessPin;
