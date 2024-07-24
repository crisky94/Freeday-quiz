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
// Componente principal para crear un juego
export default function CreateGame() {
  const router = useRouter();
  const socket = useSocket(); // Obteniendo el socket desde el contexto
  const { user } = useAuth(User); // Obteniendo el usuario autenticado desde el contexto de autenticación
  const [nameGame, setNameGame] = useState(''); // Estado para el nombre del juego
  const [nickUser, setNickUser] = useState(''); // Estado para el nickname del usuario
  const [asks, setAsks] = useState([]); // Estado para las preguntas del juego
  const [currentAsk, setCurrentAsk] = useState(''); // Estado para la pregunta actual
  const [answers, setAnswers] = useState(['', '', '', '']); // Estado para las respuestas actuales (cuatro en total)
  const [correctAnswer, setCorrectAnswer] = useState(null); // Estado para la respuesta correcta (índice)
  const [timer, setTimer] = useState('5'); // Estado para el tiempo límite de la pregunta
  const [editIndex, setEditIndex] = useState(null); // Estado para el índice de la pregunta que está siendo editada
  const [pin, setPin] = useState(''); // Estado para el PIN del juego
  const [detailGame, setDetailGame] = useState('');

  useEffect(() => {
    if (user) {
      setNickUser(`${user.firstName} ${user.lastName}`); // Setea el nickname del usuario usando su primer y último nombre
    }
  }, [user]);

  useEffect(() => {
    // Recupera los datos almacenados en LocalStorage al cargar el componente
    const storedNameGame = localStorage.getItem('nameGame');
    const storeTime = localStorage.getItem('timer');
    const storeCurrentAsk = localStorage.getItem('currentAsk');
    const storedCorrectAnswer = localStorage.getItem('correctAnswer');
    const storedAnswers = JSON.parse(localStorage.getItem('answers'));
    const storeAsks = JSON.parse(localStorage.getItem('asks'));
    const storeDetail = localStorage.getItem('detail');
    if (storedNameGame) setNameGame(storedNameGame);
    if (storeCurrentAsk) setCurrentAsk(storeCurrentAsk);
    if (storeTime) setTimer(storeTime);
    if (storedCorrectAnswer !== null)
      setCorrectAnswer(parseInt(storedCorrectAnswer, 10));
    if (storedAnswers) setAnswers(storedAnswers);
    if (storeAsks) setAsks(storeAsks);
    if (storeDetail) setDetailGame(storeDetail);
  }, []);

  useEffect(() => {
    // Guarda los datos en LocalStorage cuando cambian los estados
    localStorage.setItem('nameGame', nameGame);
    localStorage.setItem('currentAsk', currentAsk);
    localStorage.setItem('timer', timer);
    localStorage.setItem('detail', detailGame);
    if (correctAnswer !== null) {
      localStorage.setItem('correctAnswer', correctAnswer.toString());
    }
  }, [nameGame, currentAsk, timer, correctAnswer, detailGame]);

  // Maneja el cambio en el input de las respuestas
  const handleInputChange = (index, value) => {
    const newAnswers = [...answers]; // Copia el array de respuestas
    newAnswers[index] = value; // Cambia el valor de la respuesta en el índice especificado
    setAnswers(newAnswers); // Actualiza el estado de las respuestas
    localStorage.setItem('answers', JSON.stringify(newAnswers)); // Guarda las respuestas en LocalStorage
  };

  // Verifica si la entrada es válida (no vacía y sin solo espacios)
  const isValidInput = (input) => {
    return input.trim() !== ''; // trim quita los espacios en blanco al inicio y al final y luego verifica que el input no sea una cadena vacía
  };

  // Añade una nueva pregunta al juego o guarda cambios en una pregunta existente
  const addOrUpdateAsk = () => {
    // Verifica que la pregunta y todas las respuestas estén completas y que haya una respuesta correcta seleccionada
    if (
      !isValidInput(currentAsk) ||
      answers.some((answer) => !isValidInput(answer)) ||
      correctAnswer === null ||
      !isValidInput(timer)
    ) {
      toast('Completa todos los campos y marca la respuesta correcta.', {
        position: 'bottom-center',
        autoClose: 5000,
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

    // Verifica que el tiempo límite esté dentro del rango permitido
    const numericTimeLimit = parseFloat(timer);
    if (numericTimeLimit < 3 || numericTimeLimit > 50) {
      toast('El tiempo límite debe estar entre 3 y 50 segundos.', {
        position: 'bottom-center',
        autoClose: 5000,
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

    // Crea una nueva pregunta o actualiza la existente
    const newAsk = {
      ask: currentAsk,
      a: answers[0],
      b: answers[1],
      c: answers[2],
      d: answers[3],
      answer: ['A', 'B', 'C', 'D'][correctAnswer],
      timer: numericTimeLimit,
    };

    let updatedAsks;
    if (editIndex !== null) {
      updatedAsks = [...asks];
      updatedAsks[editIndex] = newAsk;
      setAsks(updatedAsks);
      setEditIndex(null);
    } else {
      updatedAsks = [...asks, newAsk]; // Añade la nueva pregunta al array de preguntas
      setAsks(updatedAsks);
    }
    localStorage.setItem('asks', JSON.stringify(updatedAsks)); // Guarda las preguntas en LocalStorage

    // Resetea los campos del formulario
    setCurrentAsk('');
    setAnswers(['', '', '', '']);
    setCorrectAnswer(null);
    setTimer('5');
    localStorage.removeItem('answers');
    localStorage.removeItem('correctAnswer');
  };

  // Maneja la edición de una pregunta existente
  const handleEdit = (index) => {
    const askToEdit = asks[index];
    setCurrentAsk(askToEdit.ask);
    setAnswers([askToEdit.a, askToEdit.b, askToEdit.c, askToEdit.d]);
    setCorrectAnswer(['A', 'B', 'C', 'D'].indexOf(askToEdit.answer));
    setTimer(askToEdit.timer.toString());
    setEditIndex(index);
  };

  // Maneja la eliminación de una pregunta existente
  const handleDelete = (index) => {
    const updatedAsks = asks.filter((_, i) => i !== index);
    setAsks(updatedAsks);
    localStorage.setItem('asks', JSON.stringify(updatedAsks)); // Actualiza las preguntas en LocalStorage
  };
  const handleSelectCorrectAnswer = (index) => {
    setCorrectAnswer(index);
  };
  useEffect(() => {
    if (pin) {
      const timer = setTimeout(() => {
        router.push(`/pages/control-quiz`); // Redirige a la página del juego usando el PIN
      }, 5000);

      return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta antes de que se cumpla el tiempo
    }
  }, [pin]);

  // Maneja el envío del formulario para crear el juego
  const handleSubmit = (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario

    if (editIndex !== null) {
      addOrUpdateAsk();
      return;
    }

    // Verifica que el nombre del juego, el nickname del usuario y al menos una pregunta estén completos
    if (
      !isValidInput(nameGame) ||
      !isValidInput(nickUser) ||
      asks.length === 0
    ) {
      toast('Completa el titulo y al menos una pregunta', {
        position: 'bottom-center',
        autoClose: 5000,
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

    // Crea los datos del juego
    const gameData = {
      nameGame: nameGame.trim(),
      detailGame: detailGame,
      nickUser: nickUser.trim(),
      asks,
    };

    // Emite un evento al servidor para crear el juego
    socket.emit('createGame', gameData, (response) => {
      if (response.game.codeGame) {
        setPin(response.game.codeGame); // Setea el PIN del juego
        localStorage.removeItem('asks');
        toast.success('Redirigiendo a control quiz ✨', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Flip,
        });
      } else {
        alert('Error al crear el juego'); // Muestra un mensaje de error
      }
    });

    // Resetea el formulario
    setNameGame('');
    setAnswers(['', '', '', '']);
    setAsks([]);
    setCorrectAnswer(null);
    setCurrentAsk('');
    setDetailGame('');
  };

  return (
    <form
      className=' fondo w-screen h-screen mt-20 -mx-2 '
      onSubmit={handleSubmit}
    >
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
            type='text'
            placeholder='Escribe tu pregunta'
            className=' text-center text-md uppercase rounded-md mt-4 h-14 m-5 w-full text-black  focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-500'
            value={currentAsk}
            onChange={(e) => setCurrentAsk(e.target.value)}
          />
        </div>

        <div className='flex justify-center items-center h-2'>
          <Tooltip
            content='Coloca el tiempo para la pregunta'
            className='bg-primary p-1 text-black rounded-md text-xs'
          >
            <input
              min={3}
              max={50}
              type='number'
              placeholder='50s max'
              className='text-center  text-xs uppercase rounded-md  h-8  w-24 text-black font-bold focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-400'
              value={timer}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidInput(value)) {
                  const numericValue = parseFloat(value);
                  if (numericValue < 3) {
                    setTimer('3');
                  } else if (numericValue > 50) {
                    setTimer('50');
                  } else {
                    setTimer(value);
                  }
                } else {
                  setTimer('');
                }
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
              correctAnswer={correctAnswer}
              onSelect={handleSelectCorrectAnswer}
              onChange={handleInputChange}
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
