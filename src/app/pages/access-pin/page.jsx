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
          onClose: () => {
            window.location.reload();
          },
        });
      }
    });
  };

  return (
    <div className='flex flex-col w-80 p-10 m-5 items-center mt-32 border  bg-slate-800 rounded-md'>
      <input
        type='text'
        placeholder='PIN'
        onChange={handleInputChange}
        name='pin'
        className='text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent'
      />
      <ToastContainer />
      <button
        className=' border text-white w-40 h-10 mt-5 font-bold rounded-md hover:shadow-lg hover:shadow-purple-400'
        onClick={handleSubmit}
      >
        Access
      </button>
    </div>
  );
}

export default AccessPin;
