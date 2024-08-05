'use client';

import { useEffect, useState } from 'react';
import Loading from '../../../loading';
import { useSocket } from '@/context/socketContext';
import { useRouter } from 'next/navigation';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../styles/page-game/pageGame.css';

export default function GameQuizPage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Estado para pausar el juego
  const socket = useSocket();
  const code = parseInt(params.code);
  const router = useRouter();

  // !PARA EL RANKING DE PLAYERS TIENES QUE MANEJAR OTRO EVENTO QUE INICIE EN UN ARRAY, NO TE OLVIDES DE LIMPIAR LA TABLA CON UN BOTON DE FINALIZAR JUEGO Y QUE LOS MANDE A TODOS A / Y TAMBIEN QUE SI ESTAN JUGANDO CUANDO ALGUIEN RECARGUE LA PAGINA SALGA EL MISMO AVISO DE LA ROOM YA QUE SI SE RECARGA TIENE QUE VOLVER A / POR QUE ESTA ELIMINADO DE LA BD

  useEffect(() => {
    if (!socket) return;

    const handleGetPlayers = (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        const player = response.players.find(
          (player) => player.socketId === socket.id
        );
        if (player) {
          setPlayerName(player.playerName);
        }
        console.log(response.players);
      }
    };

    socket.emit('getPlayers', { code }, handleGetPlayers);

    return () => {
      socket.off('getPlayers', handleGetPlayers);
    };
  }, [socket, code]);

  useEffect(() => {
    if (socket) {
      // Obtener el estado inicial del juego
      const fetchQuestions = () => {
        socket.emit('getCodeGame', { code }, (response) => {
          console.log(response, 'getcodeGame');
          if (response.error) {
            console.error(response.error);
          } else {
            setQuestions(response.asks);
            setCurrentQuestionIndex(0);
            setTimeLeft((response.asks[0]?.timer || 0) * 1000); // Convertir a milisegundos
            setGameId(response.game.id);
          }
        });
      };
      fetchQuestions();

      // Escuchar eventos de pausa, reanudación y detención
      socket.on('pauseGame', () => {
        setIsPaused(true);
        toast('El juego está pausado', {
          position: 'bottom-center',
          autoClose: 2000,
        });
      });

      socket.on('resumeGame', () => {
        setIsPaused(false);
        toast('El juego está en marcha', {
          position: 'bottom-center',
          autoClose: 2000,
        });

        router.refresh();
      });

      socket.on('stopGame', () => {
        router.push('/pages/ranking'); // Redirigir al ranking cuando el juego se detenga
      });

      socket.on('updatedAsks', (response) => {
        if (response.asks) {
          console.log(response);
          // Combinar las preguntas actuales con las nuevas preguntas
          setQuestions((prevQuestions) => {
            const updatedQuestionsMap = new Map(
              prevQuestions.map((q) => [q.id, q])
            );
            // Actualiza o agrega nuevas preguntas
            response.asks.forEach((newAsk) => {
              updatedQuestionsMap.set(newAsk.id, {
                ...updatedQuestionsMap.get(newAsk.id),
                ...newAsk,
              });
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
            const updatedQuestionsMap = new Map(
              prevQuestions.map((q) => [q.id, q])
            );
            // Eliminar la pregunta recibida
            updatedQuestionsMap.delete(response.data.id);
            // Convertir el Map actualizado de nuevo a un array
            return Array.from(updatedQuestionsMap.values());
          });
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('pauseGame');
        socket.off('resumeGame');
        socket.off('stopGame');
        socket.off('updatedAsks');
        socket.off('updateDeleteAsk');
      }
    };
  }, [socket, code, router]);

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

  useEffect(() => {
    // Guardar el índice actual en localStorage cada vez que cambie
    localStorage.setItem('indexQuestion', currentQuestionIndex);
    // Configurar el temporizador
    setTimeLeft((questions[currentQuestionIndex]?.timer || 0) * 1000); // Convertir a milisegundos
  }, [currentQuestionIndex, questions]);

  const handleAnswerClick = async (answerKey) => {
    if (selectedAnswer !== null || isPaused) return; // Evita cambiar la respuesta si el juego está pausado

    const currentQuestion = questions[currentQuestionIndex];
    localStorage.setItem('indexQuestion', currentQuestionIndex + 1);
    setSelectedAnswer(answerKey);
    setIsCorrect(answerKey === currentQuestion.answer.toLowerCase());

    if (answerKey === currentQuestion.answer.toLowerCase()) {
      const basePoints = 10;
      const timeBonus = Math.floor(timeLeft / 200); // Bonus de puntos basado en el tiempo restante en milisegundos
      const totalPoints = basePoints + timeBonus;
      const newScore = score + totalPoints;
      setScore(newScore);
      await insertPlayer(gameId, playerName, totalPoints);
    } else {
      await insertPlayer(gameId, playerName, 0);
    }
  };

  const insertPlayer = (gameId, playerName, score) => {
    return new Promise((resolve, reject) => {
      socket.emit('insertPlayer', { gameId, playerName, score });
      socket.on('insertPlayerResponse', (data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });

      socket.on('connect_error', (error) => {
        reject('Connection error:', error);
      });
    });
  };

  const handleTimeUp = async () => {
    setShowCorrectAnswer(true);
    setTimeout(() => {
      setIsCorrect(false);
      setSelectedAnswer(null);
      setShowCorrectAnswer(false);
      showToast().then(() => {
        moveToNextQuestion();
      });
    }, 1000);
  };

  const showToast = () => {
    return new Promise((resolve) => {
      toast(`Puntos: ${score}px 🚀`, {
        toastId: 'custom-id-yes',
        position: 'bottom-center',
        autoClose: 2000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: 'light',
        transition: Bounce,
        onClose: resolve,
      });
    });
  };

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft((questions[nextIndex]?.timer || 0) * 1000); // Convertir a milisegundos
    } else {
      localStorage.removeItem('indexQuestion');
      router.push('/pages/ranking');
    }
  };

  if (questions.length === 0) {
    return <Loading />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const getButtonClass = (answerKey) => {
    if (showCorrectAnswer) {
      if (answerKey === currentQuestion.answer.toLowerCase()) {
        return 'ring-4 ring-green-500';
      }
      return answerKey === selectedAnswer ? 'ring-4 ring-red-500' : '';
    }
    if (answerKey === selectedAnswer) {
      return 'ring-4 ring-white';
    }
    return '';
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const remainingSeconds = totalSeconds % 60;
    return `${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className='flex justify-center items-center w-full min-h-screen'>
      <div className='flex flex-col items-center rounded-md mt-20 bg-[#111] max-w-2xl w-full p-1 bg-custom-linear'>
        <ToastContainer />
        <div
          key={currentQuestion.id}
          className='game flex flex-col justify-center items-center mb-5 py-5 w-full p-5 bg-[#111]'
        >
          <div className='flex flex-col items-center justify-center'>
            <p className='text-red-600 text-4xl mt-5 font-bold border-b-2 border-b-red-600 w-20 text-center'>
              {typeof timeLeft === 'number' ? formatTime(timeLeft) : timeLeft}
            </p>
          </div>
          <p className='mt-10 mb-10 text-white text-center text-lg overflow-wrap break-word'>
            {`${currentQuestionIndex + 1}.${currentQuestion.ask}`}
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 w-full'>
            <div
              onClick={() => handleAnswerClick('a')}
              className={`rounded-md p-4 cursor-pointer bg-red-600 ${getButtonClass(
                'a'
              )} text-center overflow-wrap break-word text-sm sm:text-base`}
            >
              {currentQuestion.a}
            </div>
            <div
              onClick={() => handleAnswerClick('b')}
              className={`rounded-md p-4 cursor-pointer bg-blue-600 ${getButtonClass(
                'b'
              )} text-center overflow-wrap break-word text-sm sm:text-base`}
            >
              {currentQuestion.b}
            </div>
            <div
              onClick={() => handleAnswerClick('c')}
              className={`rounded-md p-4 cursor-pointer bg-yellow-600 ${getButtonClass(
                'c'
              )} text-center overflow-wrap break-word text-sm sm:text-base`}
            >
              {currentQuestion.c}
            </div>
            <div
              onClick={() => handleAnswerClick('d')}
              className={`rounded-md p-4 cursor-pointer bg-green-600 ${getButtonClass(
                'd'
              )} text-center overflow-wrap break-word text-sm sm:text-base`}
            >
              {currentQuestion.d}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
