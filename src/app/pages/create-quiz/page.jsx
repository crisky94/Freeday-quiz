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

export default function CreateGame() {
  const router = useRouter();
  const socket = useSocket();
  const { user } = useAuth(User);

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

  const addOrUpdateAsk = () => {
    if (
      !nameGame.trim() ||
      !nickUser.trim() ||
      !currentAsk.trim() ||
      answers.every(answer => !answer.trim()) ||
      (!isCorrectA && !isCorrectB && !isCorrectC && !isCorrectD) ||
      !timer.trim()
    ) {
      toast.error('Completa todos los campos y marca al menos una respuesta correcta.', {
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
    };

    let updatedAsks;
    if (editIndex !== null) {
      updatedAsks = [...asks];
      updatedAsks[editIndex] = newAsk;
      setAsks(updatedAsks);
      setEditIndex(null);
    } else {
      updatedAsks = [...asks, newAsk];
      setAsks(updatedAsks);
    }
    localStorage.setItem('asks', JSON.stringify(updatedAsks));

    setCurrentAsk('');
    setAnswers(['', '', '', '']);
    setIsCorrectA(false); // Restablecer estados
    setIsCorrectB(false);
    setIsCorrectC(false);
    setIsCorrectD(false);
    setTimer('5');
    localStorage.removeItem('answers');
    localStorage.removeItem('correctAnswer');
  };

  const handleEdit = (index) => {
    const askToEdit = asks[index];
    setCurrentAsk(askToEdit.ask);
    setAnswers([askToEdit.a, askToEdit.b, askToEdit.c || '', askToEdit.d || '']);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editIndex !== null) {
      addOrUpdateAsk();
      return;
    }

    if (!isValidInput(nameGame) || !isValidInput(nickUser) || asks.length === 0) {
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

    const gameData = {
      nameGame: nameGame.trim(),
      detailGame: detailGame,
      nickUser: nickUser.trim(),
      asks: asks.map((ask) => ({
        ask: ask.ask,
        a: ask.a,
        b: ask.b,
        c: ask.c,
        d: ask.d,
        isCorrectA: ask.isCorrectA,
        isCorrectB: ask.isCorrectB,
        isCorrectC: ask.isCorrectC,
        isCorrectD: ask.isCorrectD,
        timer: ask.timer,
      }))
    };

    // Enviar juego a través del socket
    socket.emit('createGame', gameData, (response) => {
      console.log(response, 'patata');

      // Suponiendo que el backend devuelve un objeto con `pin` y `gameId`
      if (response.game.codeGame) {
        setPin(response.game.codeGame);
        setGameId(response.game.id);
        toast.success('Redirigiendo a control quiz ✨', {
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
        localStorage.removeItem('nameGame');
        localStorage.removeItem('currentAsk');
        localStorage.removeItem('timer');
        localStorage.removeItem('answers');
        localStorage.removeItem('asks');
        localStorage.removeItem('detail');
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
    setNameGame('');
    setAnswers(['', '', '', '']);
    setAsks([]);
    setIsCorrectA(false); // Restablecer estados
    setIsCorrectB(false);
    setIsCorrectC(false);
    setIsCorrectD(false);
    setCurrentAsk('');
    setDetailGame('');
  };


  return (
    <form className=' fondo w-screen h-screen mt-20  ' onSubmit={handleSubmit}>
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
          className=' text-center truncate p-2 md:mx-28  text-md placeholder-slate-500 uppercase rounded-md h-12 w-2/3 mx-5   text-black font-bold focus:outline-none focus:ring-2 focus:ring-primary'
          type='text'
          value={nameGame}
          onChange={(e) => setNameGame(e.target.value)}
        />
      </div>
      <div className='w-full h-full '>
        <div className='flex justify-center w-full'>
          <input
            maxLength={200}
            type='text'
            placeholder='Escribe tu pregunta'
            className=' text-center truncate px-1 text-md uppercase rounded-md mt-4 h-14 m-5 w-full text-black  focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-500'
            value={currentAsk}
            onChange={(e) => setCurrentAsk(e.target.value)}
          />
        </div>

        <div className='flex flex-col justify-center items-center h-12 gap-2'>
          <label className='flex justify-center items-center h-2'>
            Temporizador (segundos):
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
              className='text-center  text-xs uppercase rounded-md  h-20  w-24 text-black font-bold focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-400'
              value={timer}
              onChange={(e) => {
                const value = e.target.value;
                setTimer(value);
              }}
            />
          </Tooltip>
        </div>

        <div className='grid grid-cols-1 m-5 sm:grid-cols-2 gap-4'>
          {answers.map((answer, index) => (
            <AnswerInput
              key={index}
              index={index}
              answer={answer}
              onChange={handleInputChange}
              isCorrect={
                index === 0 ? isCorrectA :
                  index === 1 ? isCorrectB :
                    index === 2 ? isCorrectC :
                      index === 3 ? isCorrectD : false
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
            />
          ))}
        </div>
      </div>
      {pin ? (
        <div className='flex  -mt-52 justify-center items-center transform transition-transform duration-700'>
          <p className='rounded-md bg-white text-black w-48 text-center'>
            {' '}
            JUEGO CREADO CON ÉXITO
            <br />
            PIN: <strong className='text-secundary'> {pin}</strong>
          </p>
        </div>
      ) : (
        ''
      )}
    </form>
  );
}
