'use client';

import { useEffect, useState } from 'react';
import Loading from '@/app/loading';
import { useSocket } from '../../../../context/SocketContext';

export default function GamePage({ params }) {
  // Estados para almacenar datos del juego
  const [questions, setQuestions] = useState([]); // Preguntas del juego
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Índice de la pregunta actual
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Respuesta seleccionada por el usuario
  const [isCorrect, setIsCorrect] = useState(null); // Indica si la respuesta seleccionada es correcta o incorrecta
  const [timeLeft, setTimeLeft] = useState(null); // Tiempo restante para la pregunta actual
  const socket = useSocket(); // Socket para la comunicación con el servidor
  const code = parseInt(params.code); // Código del juego obtenido de los parámetros

  // Efecto para cargar las preguntas del juego al montar el componente
  useEffect(() => {
    if (socket) {
      // Emitir evento para obtener las preguntas del juego
      socket.emit('getCodeGame', { code }, (response) => {
        if (response.error) {
          console.error(response.error); // Manejar error si ocurre al obtener las preguntas
        } else {
          setQuestions(response.asks); // Establecer las preguntas obtenidas del servidor
          setCurrentQuestionIndex(0); // Inicializar el índice de la pregunta actual
          setTimeLeft(response.asks[0]?.timer || 0); // Establecer el temporizador inicial para la primera pregunta
        }
      });
    }
  }, [socket, code]);

  // Efecto para manejar el temporizador
  useEffect(() => {
    if (timeLeft === null) return; // Si el tiempo restante es nulo, no hacer nada

    // Intervalo para decrementar el tiempo restante cada segundo
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId); // Limpiar intervalo cuando el tiempo llegue a cero
          handleTimeUp(); // Llamar función cuando se acabe el tiempo
          return 0; // O cualquier otro valor que desees mostrar cuando se acabe el tiempo
        }
        return prevTime - 1; // Decrementar el tiempo restante
      });
    }, 1000);

    return () => clearInterval(intervalId); // Limpiar intervalo al desmontar el componente
  }, [timeLeft]);

  // Función para manejar el click en una respuesta
  const handleAnswerClick = (answerKey) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerCorrect = answerKey === currentQuestion.answer.toLowerCase(); // Verificar si la respuesta es correcta
    setSelectedAnswer(answerKey); // Establecer respuesta seleccionada por el usuario
    setIsCorrect(isAnswerCorrect); // Establecer si la respuesta es correcta o no
  };

  // Función para manejar cuando se acaba el tiempo
  const handleTimeUp = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswer(currentQuestion.answer.toLowerCase()); // Establecer respuesta correcta automáticamente
    setIsCorrect(true); // Marcar respuesta como correcta cuando se acaba el tiempo

    // Esperar 3 segundos antes de pasar a la siguiente pregunta
    setTimeout(() => {
      setIsCorrect(false);
      setSelectedAnswer(null)// Limpiar estado de respuesta correcta
      moveToNextQuestion(); // Pasar a la siguiente pregunta
    }, 3000);
  };

  // Función para pasar a la siguiente pregunta
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex); // Establecer siguiente índice de pregunta
      setTimeLeft(questions[nextIndex]?.timer || 0); // Establecer temporizador para la siguiente pregunta
    } else {
      console.log('Fin de las preguntas'); // Manejar finalización de todas las preguntas
    }
  };

  // Si no hay preguntas cargadas aún, mostrar mensaje de carga
  if (questions.length === 0) {
    return <Loading/>;
  }

  // Obtener la pregunta actual
  const currentQuestion = questions[currentQuestionIndex];

  // Función para obtener la clase de estilo del botón de respuesta
  const getButtonClass = (answerKey) => {
    if (selectedAnswer === null) {
      return "";
    }
    if (answerKey === selectedAnswer) {
      return isCorrect ? "ring-4 ring-green-700" : "ring-4 ring-red-800";
    }
    if (!isCorrect && answerKey === currentQuestion.answer.toLowerCase()) {
      return "ring-4 ring-green-500";
    }
    return "";
  };

  // Función para formatear el tiempo restante en formato MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Renderizado del componente de juego
  return (
    <div className="flex flex-col mt-10 gap-5 items-center sm:w-full md:w-2/3 lg:w-1/3 xl:w-2/5 bg-white bg-opacity-60 rounded-md">
      <div key={currentQuestion.id} className="flex flex-col flex-wrap justify-center items-center h-auto  mb-5 py-5 px-5 rounded-md w-full">
        <p className='text-red-600 text-3xl mt-5'>{typeof timeLeft === 'number' ? formatTime(timeLeft) : timeLeft}</p>
        <p className='flex flex-col mt-10 mb-10 text-black'>{currentQuestionIndex + 1}. {currentQuestion.ask}</p>
        <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-10 justify-center items-center mt-5 mb-5 w-auto">
          <li onClick={() => handleAnswerClick('a')} className={`rounded-md h-auto w-auto p-2 cursor-pointer bg-red-600 ${getButtonClass('a')}`}>
            {currentQuestion.a}
          </li>
          <li onClick={() => handleAnswerClick('b')} className={`rounded-md h-auto w-auto p-2 cursor-pointer bg-blue-600 ${getButtonClass('b')}`}>
            {currentQuestion.b}
          </li>
        </ul>
        <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-10 justify-center items-center mt-5 mb-5 w-auto">
          <li onClick={() => handleAnswerClick('c')} className={`rounded-md h-auto w-auto p-2 cursor-pointer bg-green-600 ${getButtonClass('c')}`}>
            {currentQuestion.c}
          </li>
          <li onClick={() => handleAnswerClick('d')} className={`rounded-md h-auto w-auto p-2 cursor-pointer bg-yellow-600 ${getButtonClass('d')}`}>
            {currentQuestion.d}
          </li>
        </ul>
        {/* {isCorrect !== null && (
          <p className={`text-lg mt-2 ${isCorrect ? 'text-green-600' : ''}`}>
            Respuesta correcta: {currentQuestion.answer.toUpperCase()}
          </p>
        )} */}
      </div>
    </div>
  );
}
