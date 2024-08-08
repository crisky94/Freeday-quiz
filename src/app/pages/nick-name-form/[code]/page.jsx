'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';
import { toast } from 'react-toastify';
import { userValidation } from '@/lib/userValidation';

const NickNameForm = ({ params }) => {
  const socket = useSocket();
  const [nickname, setNickname] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingNickname, setPendingNickname] = useState('');
  const code = parseInt(params.code);
  const router = useRouter();

  userValidation();

  useEffect(() => {
    if (!socket) return;
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
    <div className='h-screen w-full flex items-center justify-center'>
      <div className='bg-custom-linear p-1'>
        <form
          className='bg-black flex flex-col gap-5 w-72 justify-center text-center  p-10 items-center shadow-xl rounded-md text-slate-700'
          onSubmit={handleSubmit}
        >
          <label className='text-white text-xl'>Introduce tu nickname</label>
          <input
            className='text-black w-52  text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            type='text'
            placeholder='NICKNAME'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <div className='flex flex-row flex-wrap justify-center items-center w-72'>
            <button
              className=' text-black bg-custom-linear hoverGradiant w-40 h-10 mt-5 font-bold rounded-md '
              type='submit'
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-white text-black p-5 rounded-md shadow-lg'>
            <h2 className='text-lg font-bold mb-4 '>
              Ya tienes un jugador en esta sala
            </h2>
            <p className='mb-4'>¿Quieres reemplazar tu nickname?</p>
            <div className='flex justify-end'>
              <button
                className='bg-custom-linear hoverGradiant font-bold text-black px-4 py-2 rounded mr-2'
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                className='bg-custom-linear hoverGradiant font-bold text-black px-4 py-2 rounded'
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
