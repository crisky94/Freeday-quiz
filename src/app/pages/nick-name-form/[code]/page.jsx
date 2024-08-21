'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AvatarModal from '../../../components/AvatarModal';
import { useAvatar } from '../../../../context/avatarContext';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Loading from '@/app/loading';

const NickNameForm = ({ params }) => {
  const [nickname, setNickname] = useState('');// Estado para el nickname ingresado por el usuario.
  const [isModalOpen, setIsModalOpen] = useState(false);// Estado para controlar la visibilidad del modal de reemplazo de nickname.
  const [isModalAvatarOpen, setIsAvatarModalOpen] = useState(false);// Estado para controlar la visibilidad del modal de selección de avatar.
  const [selectedAvatar, setSelectedAvatar] = useState(null); // Estado para guardar el avatar seleccionado.
  const [avatars, setAvatars] = useState([]); // Estado para guardar la lista de avatares generados.
  const [pendingNickname, setPendingNickname] = useState('');// Estado para manejar un nickname pendiente de confirmación.
  const [socketReady, setSocketReady] = useState(false);
  const code = parseInt(params.code);
  const router = useRouter();
  const { fetchAvatar } = useAvatar();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    setSocketReady(true);
    socket.on('nicknameConflict', () => {
      setIsModalOpen(true);
    });
    // Escucha el evento de éxito al unirse a una sala.
    socket.on('joinSuccess', () => {
      router.push(`/pages/waiting-room/${code}`);
    });

    return () => {
      socket.off('nicknameConflict');
      socket.off('joinSuccess');
    };
  }, [socket, code, router]);
  if (!socketReady) {
    return <Loading />; // O cualquier otro indicador de carga
  }

  const handleOpenAvatarModal = async () => {
    const randomNicknames = Array.from({ length: 24 }, () =>
      Math.random().toString(36).substring(2, 10)
    );
    const avatarPromises = randomNicknames.map((nicknames) =>
      fetchAvatar(nicknames)
    );
    const avatarSvgs = await Promise.all(avatarPromises);
    setAvatars(avatarSvgs);
    setIsAvatarModalOpen(true);
  };
  // Función para cerrar cualquier modal abierto.
  const handleCloseModal = () => {
    setIsAvatarModalOpen(false);
    setIsModalOpen(false);
  };
  // Función para manejar la selección de un avatar.
  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setIsAvatarModalOpen(false);
  };
  // Función para manejar el reemplazo de un nickname en conflicto.
  const handleReplaceNickname = () => {
    setIsModalOpen(true);
    socket.emit('replaceNickname', {
      nickname: pendingNickname,
      code,
      avatar: selectedAvatar,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname && selectedAvatar) {
      sessionStorage.setItem('nickname', nickname);
      setPendingNickname(nickname);
      socket.emit('joinRoom', { nickname, code, avatar: selectedAvatar });// Envía el evento para unirse a la sala.
    } 
    
    if (!nickname && !selectedAvatar){
      toast.error('Por favor, ingresa un nickname y selecciona un avatar.', {
        onClose: () => {
          window.location.reload();
        },
      });
    }
  };

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <div className='bg-custom-linear p-1'>
        <form
          className='bg-black flex flex-col gap-5 w-72 justify-center text-center p-10 items-center shadow-xl rounded-md text-slate-700'
          onSubmit={handleSubmit}
        >
          <label className='text-white text-xl'>Introduce tu nickname</label>
          <input
            className='text-black w-52 text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            type='text'
            placeholder='NICKNAME'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          {selectedAvatar && (
            <div className='my-4 border-2 rounded-full'>
              <Image
                width={50}
                height={50}
                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                  selectedAvatar
                )}`}
                alt={`${selectedAvatar}'s avatar`}
              />
            </div>
          )}
          <div className='flex flex-row flex-wrap justify-center items-center w-72'>
            <button
              className='text-black bg-custom-linear hoverGradiant w-40 h-10 mt-5 font-bold rounded-md'
              type='button'
              onClick={handleOpenAvatarModal}
            >
              Elige Avatar
            </button>
            {!nickname || !selectedAvatar ? null : (
              <button
                className='text-black bg-custom-linear hoverGradiant w-40 h-10 mt-5 font-bold rounded-md'
                type='submit'
              >
                Ingresar
              </button>
            )}
          </div>
        </form>
      </div>

      <AvatarModal
        isOpen={isModalAvatarOpen}
        onRequestClose={handleCloseModal}
        onSelectAvatar={handleSelectAvatar}
        avatars={avatars}
      />

      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-white text-black p-5 rounded-md shadow-lg'>
            <h2 className='text-lg font-bold mb-4'>
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
