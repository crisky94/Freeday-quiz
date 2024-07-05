'use client';
import { useSocket } from '../../../context/SocketContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import User from '@/app/components/User';

// Componente principal para crear un juego
export default function CreateGame() {
  const socket = useSocket(); // Obteniendo el socket desde el contexto
  const { user } = useAuth(User); // Obteniendo el usuario autenticado desde el contexto de autenticación
  const [nameGame, setNameGame] = useState(''); // Estado para el nombre del juego
  const [nickUser, setNickUser] = useState(''); // Estado para el nickname del usuario
  const [asks, setAsks] = useState([]); // Estado para las preguntas del juego
  const [currentAsk, setCurrentAsk] = useState(''); // Estado para la pregunta actual
  const [answers, setAnswers] = useState(['', '', '', '']); // Estado para las respuestas actuales (cuatro en total)
  const [correctAnswer, setCorrectAnswer] = useState(null); // Estado para la respuesta correcta (índice)
  const [pin, setPin] = useState('');

  // Efecto que se ejecuta cuando el usuario cambia
  useEffect(() => {
    if (user) {
      setNickUser(`${user.firstName} ${user.lastName}`); // Setea el nickname del usuario usando su primer y último nombre
      console.log(user); // Imprime el usuario en la consola
    }
  }, [user]);

  // Maneja el cambio en el input de las respuestas
  const handleInputChange = (index, value) => {
    const newAnswers = [...answers]; // Copia el array de respuestas
    newAnswers[index] = value; // Cambia el valor de la respuesta en el índice especificado
    setAnswers(newAnswers); // Actualiza el estado de las respuestas
  };

  // Añade una nueva pregunta al juego
  const addAsk = () => {
    // Verifica que la pregunta y todas las respuestas estén completas y que haya una respuesta correcta seleccionada
    if (
      !currentAsk ||
      answers.some((answer) => !answer) ||
      correctAnswer === null
    ) {
      alert(
        'Por favor, completa la pregunta y todas las respuestas y selecciona la respuesta correcta.'
      );
      return;
    }

    // Crea una nueva pregunta
    const newAsk = {
      ask: currentAsk,
      a: answers[0],
      b: answers[1],
      c: answers[2],
      d: answers[3],
      answer: ['A', 'B', 'C', 'D'][correctAnswer],
    };

    setAsks([...asks, newAsk]); // Añade la nueva pregunta al array de preguntas
    setCurrentAsk(''); // Resetea la pregunta actual
    setAnswers(['', '', '', '']); // Resetea las respuestas
    setCorrectAnswer(null); // Resetea la respuesta correcta
  };

  // Maneja el envío del formulario para crear el juego
  const handleSubmit = (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario
    // Verifica que el nombre del juego, el nickname del usuario y al menos una pregunta estén completos
    if (!nameGame || !nickUser || asks.length === 0) {
      alert(
        'Por favor, completa el título del juego, tu nickname y añade al menos una pregunta.'
      );
      return;
    }

    // Crea los datos del juego
    const gameData = {
      nameGame,
      nickUser,
      asks,
    };

    // Emite un evento al servidor para crear el juego
    socket.emit('createGame', gameData, (response) => {
      if (response.game.codeGame) {
        setPin(response.game.codeGame);
        console.log('pin numero:' + pin);
      } else {
        alert('error al crear juego'); // Muestra un mensaje de éxito con el código del juego
        // Aquí puedes redirigir a la página del juego o limpiar el formulario
      }
    });

    // Resetea el formulario
    setNameGame('');
    setAnswers(['', '', '', '']);
    setAsks([]);
    setCorrectAnswer(null);
    setCurrentAsk('');
  };

  return (
    <form className='fondo w-screen h-screen' onSubmit={handleSubmit}>
      <div className='w-full h-14 flex justify-center items-center'>
        <input
          placeholder='Coloca un título'
          className='text-center placeholder-slate-500 uppercase rounded-md h-12 w-full mx-24 text-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-purple-700'
          type='text'
          value={nameGame}
          onChange={(e) => setNameGame(e.target.value)}
        />
      </div>

      <div className='w-full h-full'>
        <div className='flex justify-center w-full'>
          <input
            type='text'
            placeholder='Escribe tu pregunta y marca la correcta'
            className='text-center uppercase rounded-md mt-4 h-14 m-5 w-full text-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-purple-700 placeholder-slate-500'
            value={currentAsk}
            onChange={(e) => setCurrentAsk(e.target.value)}
          />
        </div>

        <div className='grid grid-cols-1 m-5 sm:grid-cols-2 gap-4'>
          {Array.isArray(answers) &&
            answers.length === 4 &&
            answers.map((answer, index) => (
              <div
                key={index}
                className={`${
                  index === 0
                    ? 'bg-red-500'
                    : index === 1
                    ? 'bg-blue-500'
                    : index === 2
                    ? 'bg-green-500'
                    : 'bg-yellow-500'
                }  flex items-center p-4 rounded-lg shadow-xl hover:shadow-purple-700/50 hover:transition duration-200`}
              >
                <input
                  type='text'
                  placeholder={`Añadir respuesta ${index + 1}`}
                  className='h-full w-full bg-transparent border-none  placeholder-slate-500 focus:outline-none text-black'
                  value={answer}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
                <input
                  type='radio'
                  className='h-5 w-5 mt-1 '
                  name='answer'
                  checked={correctAnswer === index}
                  onChange={() => setCorrectAnswer(index)}
                />
              </div>
            ))}
        </div>
        <div className='flex  justify-center gap-5 m-5'>
          <button
            type='button'
            className='bg-blue-500 text-white p-2  w-48 max-w-48 rounded-lg shadow-xl hover:shadow-purple-700/50 hover:transition duration-200'
            onClick={addAsk}
          >
            Añadir Pregunta
          </button>
          <button
            type='submit'
            className='bg-green-500 text-white p-2 w-48 rounded-lg shadow-xl hover:shadow-purple-700/50 hover:transition duration-200'
          >
            Crear Juego
          </button>
        </div>

        <div className='mt-10 flex gap-2  flex-wrap m-auto justify-center '>
          {asks.map((ask, index) => (
            <div
              key={index}
              className=' bg-slate-200 text-black  w-96 max-w-48 p-2 rounded-lg m-2 shadow-sm shadow-purple-700	 '
            >
              <p>
                <strong>Pregunta:</strong> {ask.ask}
              </p>
              <p>
                <strong>A:</strong> {ask.a}
              </p>
              <p>
                <strong>B:</strong> {ask.b}
              </p>
              <p>
                <strong>C:</strong> {ask.c}
              </p>
              <p>
                <strong>D:</strong> {ask.d}
              </p>
              <p>
                <strong>Respuesta Correcta:</strong> {ask.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
      {pin ? (
        <div className='flex  -mt-52 justify-center items-center '>
          <p className='rounded-md bg-white text-black w-48 text-center'>
            {' '}
            JUEGO CREADO CON EXÍTO
            <br />
            PIN: <strong className='text-primary'> {pin}</strong>
          </p>
        </div>
      ) : (
        ''
      )}
    </form>
  );
}
