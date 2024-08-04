'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/socketContext';
import Link from 'next/link';
import { Tooltip } from '@nextui-org/tooltip';
import { useRouter } from 'next/navigation';
import { Bounce,  ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from '../../../loading'
import '../../../styles/page-game/pageGame.css';

export default function GameControlPage({params}) {
  const socket = useSocket();
  const router = useRouter();
  const [gameState, setGameState] = useState('resumed');
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const gameId = params.gameId

  useEffect(() => {
    if (!socket) return;

    // Obtener los detalles del juego y las preguntas
    socket.emit('getGamesId', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        // Solicitar las preguntas para el juego
        socket.emit('getAsks', { gameId }, (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            const gameQuestions = response.questions;
            setQuestions(gameQuestions);
            if (gameQuestions.length > 0) {
              setTimeLeft(gameQuestions[0].timer * 1000); // Configurar el tiempo inicial
            }
          }
        });
      }
    });

    // Manejar la actualización del estado del juego
    const handleGameStateUpdate = (state) => {
      setGameState(state);
      switch (state) {
        case 'paused':
          toast('El juego está pausasdo', { position: "bottom-center", autoClose: 4000, transition: Bounce });
          break;
        case 'resumed':
          toast('El juego está en marcha', { position: "bottom-center", autoClose: 4000, transition: Bounce });
          break;
        case 'stopped':
          toast('El juego ha finalizado', { position: "bottom-center", autoClose: 4000, transition: Bounce });
          break;
        default:
          setMessage('Inicio del juego');
      }
    };

    socket.on('pauseGame', () => {
      setIsPaused(true);
    });

    socket.on('resumeGame', () => {
      setIsPaused(false);
    });

    socket.on('stopGame', () => {
      router.push('/')
    });

    socket.on('updatedAsks', (response) => {
      if (response.asks) {
        console.log(response);
        // Combinar las preguntas actuales con las nuevas preguntas
        setQuestions((prevQuestions) => {
          const updatedQuestionsMap = new Map(prevQuestions.map(q => [q.id, q]));

          // Actualiza o agrega nuevas preguntas
          response.asks.forEach(newAsk => {
            updatedQuestionsMap.set(newAsk.id, { ...updatedQuestionsMap.get(newAsk.id), ...newAsk });
          });

          return Array.from(updatedQuestionsMap.values());
        });
      }
    });
    
    socket.on('updateDeleteAsk', (response) => {
      console.log(response);
      if (response.data) {
        setQuestions((prevQuestions) => {
          // Crear un nuevo Map con las preguntas actuales
          const updatedQuestionsMap = new Map(prevQuestions.map(q => [q.id, q]));

          // Eliminar la pregunta recibida
          updatedQuestionsMap.delete(response.data.id);

          // Convertir el Map actualizado de nuevo a un array
          return Array.from(updatedQuestionsMap.values());
        });
      }
    });

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
    };
  }, [socket, router]);

  useEffect(() => {
    if (timeLeft === null || isPaused) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(intervalId);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, isPaused]);

  const handleTimeUp = async () => {
    setTimeout(() => {
      moveToNextQuestion();     
    }, 4000);
  };

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft((questions[nextIndex]?.timer || 0) * 1000);
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const remainingSeconds = totalSeconds % 60;
    return `${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return <Loading />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full pt-16">
      <div className='bg-custom-linear flex mb-2'>
           <div className='flex flex-col  p-14 m-1 h-auto w-58 sm:w-full items-center bg-black gap-5'>
        <h1 className='uppercase font-bold text-xl text-center'>Sala de control del juego</h1>
        <div className='text-[#1cffe4] font-bold uppercase'>
          {message}
        </div>
        <button onClick={() => {
          if (socket) {
            socket.emit('pauseGame');
            setGameState('paused');
            setMessage('El juego está pausado');
          }
        }} className='text-black hoverGradiant bg-custom-linear w-32 h-10 rounded-md px-2'>Pause</button>
        <button onClick={() => {
          if (socket) {
            socket.emit('resumeGame');
            setGameState('resumed');
            setMessage('El juego está en marcha');
          }
        }} className='text-black hoverGradiant bg-custom-linear w-32 h-10 rounded-md px-2'>Reanudar</button>
        <button onClick={() => {
          if (socket) {
            socket.emit('stopGame');
            setGameState('stopped');
            setMessage('El juego ha sido finalizado');
          }
        }} className='text-black hoverGradiant bg-custom-linear w-32 h-10 rounded-md px-2'>Stop</button>
        <Tooltip className='text-[#fcff00] text-base uppercase' content='Sólo modificar preguntas futuras'>
          <Link onClick={() => {
            if (socket) {
              setMessage('El juego está pausado');
            }
          }} className='mt-5 text-black hoverGradiant bg-custom-linear w-48 h-14 rounded-md py-4 text-center' href={`/pages/modify-page/${gameId}`} target='_blank'>
            Modificar juego
          </Link>
        </Tooltip>
          <div className=' flex flex-col  p-5 m-1  items-center bg-black gap-5 '>
            <p>Preguntas: {currentQuestionIndex + 1} de {questions.length}</p>
            <div className='text-lg text-center'>{currentQuestionIndex + 1}. {currentQuestion?.ask}</div>
            <div className='text-xl font-bold text-center mt-4 text-red-500'>
              Tiempo restante: {formatTime(timeLeft)}
            </div>
          </div>
      </div>
    </div>
      <ToastContainer/>
    </div>
  );
}
