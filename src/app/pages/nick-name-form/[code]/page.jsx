'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';

const NickNameForm = ({ params }) => {
  const socket = useSocket();
  const [nickname, setNickname] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingNickname, setPendingNickname] = useState('');
  const code = parseInt(params.code);
  const router = useRouter();

  useEffect(() => {
    socket.on('nicknameConflict', () => {
      setIsModalOpen(true);
    });

    socket.on('joinSuccess', () => {
      router.push(`/pages/waiting-room/${code}`);
    });

    return () => {
      socket.off('nicknameConflict');
      socket.off('joinSuccess');
    };
  }, [socket, code, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname) {
localStorage.setItem('nickname', nickname);
      setPendingNickname(nickname);
      socket.emit('joinRoom', { nickname, code });
    } else {
      toast.error('Por favor, ingresa un nickname.', {
        onClose: () => {
          window.location.reload();
        },
      });
    }
  };

  const handleReplaceNickname = () => {
    socket.emit('replaceNickname', { nickname: pendingNickname, code });
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <form
        className='bg-slate-800 flex flex-col gap-5 w-72 justify-center mt-20 p-10 items-center shadow-xl rounded-md text-slate-700'
        onSubmit={handleSubmit}
      >
        <input
          className='text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent'
          type='text'
          placeholder='NICKNAME'
          value={nickname}
          onChange={(e) => setNickname(capitalizeFirstLetter(e.target.value))}
          required
        />
        <div className='flex flex-row flex-wrap justify-center items-center w-72'>
          <button
            className='border text-white w-40 h-10 mt-5 font-bold rounded-md hover:shadow-lg hover:shadow-purple-400'
            type='submit'
          >
            Ingresar
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-white p-5 rounded-md shadow-lg'>
            <h2 className='text-lg font-bold mb-4'>
              Ya tienes un jugador en esta sala
            </h2>
            <p className='mb-4'>¿Quieres reemplazar tu nickname?</p>
            <div className='flex justify-end'>
              <button
                className='bg-red-500 text-white px-4 py-2 rounded mr-2'
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                className='bg-blue-500 text-white px-4 py-2 rounded'
                onClick={handleReplaceNickname}
              >
                Reemplazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NickNameForm;
