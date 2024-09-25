'use client';
import { Flip, ToastContainer, toast } from 'react-toastify';
import { Tooltip } from '@nextui-org/tooltip';
import { useSocket } from '@/context/socketContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import 'react-toastify/dist/ReactToastify.css';
import User from '@/app/components/User';
import AskCard from '@/app/components/AskCard';
import AnswerInput from '@/app/components/AnswerInput';
import ModalComponent from '@/app/components/Modal';
import { useRouter } from 'next/navigation';
import '@/app/styles/textTareas.css';
// Componente principal para crear un juego
export default function CreateGame() {
  const router = useRouter();
  const socket = useSocket();
  const { user } = useAuth(User);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nameGame, setNameGame] = useState('');
  const [nickUser, setNickUser] = useState('');
  const [asks, setAsks] = useState([]);
  const [currentAsk, setCurrentAsk] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [isCorrectA, setIsCorrectA] = useState(false); // Cambios aquí para manejar estados booleanos
  const [isCorrectB, setIsCorrectB] = useState(false);
  const [isCorrectC, setIsCorrectC] = useState(false);
  const [isCorrectD, setIsCorrectD] = useState(false);
  const [timer, setTimer] = useState('5');
  const [editIndex, setEditIndex] = useState(null);
  const [pin, setPin] = useState('');
  const [detailGame, setDetailGame] = useState('');
  const [gameId, setGameId] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const isValidInput = (input) => {
    return input.trim() !== ''; // trim quita los espacios en blanco al inicio y al final y luego verifica que el input no sea una cadena vacía
  };
  useEffect(() => {
    if (user) {
      setNickUser(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

  useEffect(() => {
    if (pin) {
      const timer = setTimeout(() => {
        router.push(`/pages/pinPage/${gameId}`); // Redirige a la página del juego usando el PIN
      }, 5000);

      return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta antes de que se cumpla el tiempo
    }
  }, [pin]);

  useEffect(() => {
    const storedNameGame = localStorage.getItem('nameGame');
    const storeTime = localStorage.getItem('timer');
    const storeCurrentAsk = localStorage.getItem('currentAsk');
    const storedAnswers = JSON.parse(localStorage.getItem('answers'));
    const storeAsks = JSON.parse(localStorage.getItem('asks'));
    const storeDetail = localStorage.getItem('detail');
    if (storedNameGame) setNameGame(storedNameGame);
    if (storeCurrentAsk) setCurrentAsk(storeCurrentAsk);
    if (storeTime) setTimer(storeTime);
    if (storedAnswers) setAnswers(storedAnswers);
    if (storeAsks) setAsks(storeAsks);
    if (storeDetail) setDetailGame(storeDetail);
  }, []);

  useEffect(() => {
    localStorage.setItem('nameGame', nameGame);
    localStorage.setItem('currentAsk', currentAsk);
    localStorage.setItem('timer', timer);
    localStorage.setItem('detail', detailGame);
  }, [nameGame, currentAsk, timer, detailGame]);

  const handleInputChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    localStorage.setItem('answers', JSON.stringify(newAnswers));
  };

  const handleSelectAnswer = (index) => {
    switch (index) {
      case 0:
        setIsCorrectA(!isCorrectA); // Cambiar el estado booleano correspondiente
        break;
      case 1:
        setIsCorrectB(!isCorrectB);
        break;
      case 2:
        setIsCorrectC(!isCorrectC);
        break;
      case 3:
        setIsCorrectD(!isCorrectD);
        break;
      default:
        break;
    }
  };

  const addOrUpdateAsk = async () => {
    if (
      !nameGame.trim() ||
      !nickUser.trim() ||
      !currentAsk.trim() ||
      answers.every((answer) => !answer.trim()) ||
      (!isCorrectA && !isCorrectB && !isCorrectC && !isCorrectD) ||
      !timer.trim()
    ) {
      toast.error(
        'Completa todos los campos y marca al menos una respuesta correcta.',
        {
          position: 'bottom-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Flip,
        }
      );
      return;
    }

    const numericTimeLimit = parseFloat(timer);
    if (numericTimeLimit < 3 || numericTimeLimit > 50) {
      toast.error('El tiempo límite debe estar entre 3 y 50 segundos.', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Flip,
      });
      return;
    }

    // Upload image if there is one
    let imageUrl = null;
    if (selectedFile) {
      try {
        imageUrl = await uploadImage(selectedFile);
      } catch (error) {
        toast.error('Error al subir la imagen.', {
          position: 'bottom-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Flip,
        });
        return;
      }
    }

    const newAsk = {
      ask: currentAsk,
      a: answers[0],
      b: answers[1],
      c: answers[2] || null,
      d: answers[3] || null,
      isCorrectA,
      isCorrectB,
      isCorrectC,
      isCorrectD,
      timer: numericTimeLimit,
      image: imageUrl || null,
    };

    let updatedAsks;
    if (editIndex !== null) {
      updatedAsks = [...asks];
      updatedAsks[editIndex] = newAsk;
      setImageUrls(
        imageUrls.map((url, i) => (i === editIndex ? imageUrl : url))
      );
      setEditIndex(null);
    } else {
      updatedAsks = [...asks, newAsk];
      setImageUrls([...imageUrls, imageUrl]);
    }
    setAsks(updatedAsks);
    localStorage.setItem('asks', JSON.stringify(updatedAsks));

    // Reset form state
    setCurrentAsk('');
    setAnswers(['', '', '', '']);
    setIsCorrectA(false);
    setIsCorrectB(false);
    setIsCorrectC(false);
    setIsCorrectD(false);
    setTimer('5');
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleEdit = (index) => {
    const askToEdit = asks[index];
    setCurrentAsk(askToEdit.ask);
    setAnswers([
      askToEdit.a,
      askToEdit.b,
      askToEdit.c || '',
      askToEdit.d || '',
    ]);
    setIsCorrectA(askToEdit.isCorrectA); // Cargar estados booleanos desde la pregunta
    setIsCorrectB(askToEdit.isCorrectB);
    setIsCorrectC(askToEdit.isCorrectC || false);
    setIsCorrectD(askToEdit.isCorrectD || false);
    setTimer(askToEdit.timer.toString());
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedAsks = asks.filter((_, i) => i !== index);
    setAsks(updatedAsks);
    localStorage.setItem('asks', JSON.stringify(updatedAsks));
  };
  // Función que maneja la selección de imagen y actualiza la vista previa
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file); // Verifica el archivo seleccionado

      const imageUrl = URL.createObjectURL(file);

      setPreviewImage(imageUrl); // Guarda el archivo en lugar del Data URL
      setSelectedFile(file); // Guarda el archivo para subirlo más tarde
    }
  };

  const handleDeleteImg = () => {
    if (previewImage) {
      // URL.revokeObjectURL(previewImage); // Libera la URL
    }
    setPreviewImage(null);
  };

  //* funcion de envio >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // Function to handle image upload
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Upload response:', data); // Verifica la respuesta del servidor

      if (data.error) {
        throw new Error('Error al subir imagen.');
      }
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const createQuiz = (gameData) => {
    socket.emit('createGame', gameData, (response) => {
      if (response.game && response.game.codeGame) {
        setPin(response.game.codeGame);
        setGameId(response.game.id);
        localStorage.removeItem('asks');
        toast.success(
          '¡Quiz creado con éxito! Redirigiendo a la página de PIN 🚀.',
          {
            position: 'bottom-center',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Flip,
          }
        );
      } else {
        toast.error('Error al crear el juego.', {
          position: 'bottom-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Flip,
        });
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editIndex !== null) {
      addOrUpdateAsk();
      return;
    }

    if (
      !isValidInput(nameGame) ||
      !isValidInput(nickUser) ||
      asks.length === 0
    ) {
      toast.error('Completa el título y al menos una pregunta.', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Flip,
      });
      return;
    }

    try {
      // Prepare the game data to be sent to the server
      const gameData = {
        nameGame: nameGame.trim(),
        detailGame: detailGame,
        nickUser: nickUser.trim(),
        asks: asks.map((ask, index) => ({
          ...ask,
          image: imageUrls[index] || null,
        })),
      };

      console.log('Submitting game data:', gameData);
      createQuiz(gameData);
    } catch (error) {
      toast.error('Error en la creación del juego.', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Flip,
      });
    }

    localStorage.removeItem('nameGame');
    localStorage.removeItem('currentAsk');
    localStorage.removeItem('timer');
    localStorage.removeItem('answers');
    localStorage.removeItem('correctAnswer');
    localStorage.removeItem('asks');
    localStorage.removeItem('detail');
  };

  return (
    <form className=' fondo w-[95%] h-full mt-20  ' onSubmit={handleSubmit}>
      <ToastContainer
        position='bottom-center'
        autoClose={5000}
        limit={2}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      <div className='w-full h-14 flex  items-center'>
        <ModalComponent value={detailGame} onChange={setDetailGame} />
        <input
          maxLength={100}
          placeholder='Coloca un título'
          className=' text-center truncate p-2 md:mx-28   text-md placeholder-slate-500 uppercase rounded-md h-12 w-2/3 mx-5   text-black font-bold focus:outline-none focus:ring-2 ring-secundary'
          type='text'
          value={nameGame}
          onChange={(e) => setNameGame(e.target.value)}
        />
      </div>
      <div className='w-full h-full '>
        <div className='flex justify-center w-full '>
          <textarea
            maxLength={150}
            placeholder='Escribe tu pregunta'
            className=' text-center resize-none px-1 py-4 text-md uppercase rounded-md mt-4 h-14 max-h-24 m-5 w-full text-black  focus:outline-none focus:ring-2 ring-secundary placeholder-slate-500 custom-scroll'
            value={currentAsk}
            onChange={(e) => setCurrentAsk(e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-center items-center h-12 gap-2'>
          <label className='flex justify-center items-center h-6 text-sm rounded-md bg-[#111] '>
            Temporizador (segundos)
          </label>
          <Tooltip
            content='min 3s - max 50s'
            className='bg-primary p-1 text-black rounded-md text-xs'
          >
            <input
              min={3}
              max={50}
              type='number'
              placeholder='Tiempo'
              className='text-center  text-xs uppercase rounded-md  h-20  w-24 text-black font-bold focus:outline-none focus:ring-2 focus:ring-secundary placeholder-slate-400'
              value={timer}
              onChange={(e) => {
                const value = e.target.value;
                setTimer(value);
              }}
            />
          </Tooltip>
        </div>
        <div className='w-full h-96 my-2 rounded-md  flex justify-center items-center'>
          <div className='flex flex-col items-center rounded-md justify-center drop w-96 h-full'>
            {previewImage ? (
              <div className='h-80 relative w-80'>
                <img
                  src={previewImage}
                  alt='Preview'
                  className='w-full h-full object-fit  bg-center rounded-md'
                />
                <button
                  className='button absolute bottom-11 left-5 '
                  onClick={handleDeleteImg}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 69 14'
                    className='svgIcon bin-top'
                  >
                    <g clipPath='url(#clip0_35_24)'>
                      <path
                        fill='black'
                        d='M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z'
                      ></path>
                    </g>
                    <defs>
                      <clipPath id='clip0_35_24'>
                        <rect fill='white' height='14' width='60'></rect>
                      </clipPath>
                    </defs>
                  </svg>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 69 57'
                    className='svgIcon bin-bottom'
                  >
                    <g clipPath='url(#clip0_35_22)'>
                      <path
                        fill='black'
                        d='M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z'
                      ></path>
                    </g>
                    <defs>
                      <clipPath id='clip0_35_22'>
                        <rect fill='white' height='57' width='79'></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            ) : (
              // Si ya hay una imagen cargada, mostrarla como vista previa

              // Si no hay imagen cargada, mostrar el mensaje y el botón
              <>
                <p className='text-white font-bold'>Selecciona una imagen</p>
                <button
                  title='Add New'
                  type='button'
                  className='group cursor-pointer outline-none hover:rotate-90 duration-300'
                  onClick={() => document.getElementById('imageInput').click()} // Simular el click en el input oculto
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='50px'
                    height='50px'
                    viewBox='0 0 24 24'
                    className='stroke-lime-400 fill-none group-hover:fill-lime-800 group-active:stroke-lime-200 group-active:fill-lime-600 group-active:duration-0 duration-300'
                  >
                    <path
                      d='M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z'
                      strokeWidth='1.5'
                    ></path>
                    <path d='M8 12H16' strokeWidth='1.5'></path>
                    <path d='M12 16V8' strokeWidth='1.5'></path>
                  </svg>
                </button>

                {/* Input de tipo file oculto */}
                <input
                  id='imageInput'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='hidden' // Escondemos el input
                />
              </>
            )}
          </div>
        </div>
        {/* <InputFile /> */}

        <div className='grid grid-cols-1 m-5 sm:grid-cols-2 gap-4'>
          {answers.map((answer, index) => (
            <AnswerInput
              key={index}
              index={index}
              answer={answer}
              onChange={handleInputChange}
              isCorrect={
                index === 0
                  ? isCorrectA
                  : index === 1
                    ? isCorrectB
                    : index === 2
                      ? isCorrectC
                      : index === 3
                        ? isCorrectD
                        : false
              }
              onSelect={() => handleSelectAnswer(index)}
            />
          ))}
        </div>
        <div className='flex  justify-center gap-5 m-5'>
          <button
            type='button'
            className='hoverGradiant bg-custom-linear text-black p-2  w-48 max-w-48 rounded-lg  hover:transition duration-200 font-bold text-xs'
            onClick={addOrUpdateAsk}
          >
            {editIndex !== null ? 'Guardar Cambios' : 'Añadir Pregunta'}
          </button>
          <button
            type='submit'
            className='hoverGradiant bg-custom-linear text-black p-2 w-48 rounded-lg shadow-xl  hover:transition duration-200 font-bold text-xs'
          >
            Crear Juego
          </button>
        </div>
        <div className='mt-10 flex gap-2  flex-wrap m-auto justify-center text-xs'>
          {asks.map((ask, index) => (
            <AskCard
              key={index}
              ask={ask}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isCorret={isCorrectA || isCorrectB || isCorrectC || isCorrectD}
            />
          ))}
        </div>
      </div>
    </form>
  );
}