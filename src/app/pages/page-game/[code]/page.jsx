'use client';

import { useEffect, useState, useCallback } from 'react';
import Loading from '../../../loading';
import { useSocket } from '@/context/socketContext';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../styles/page-game/pageGame.css';
import BeforeUnloadHandler from '@/app/components/closePage';
import ScoreAlert from '@/app/components/ScoreAlert';

export default function GameQuizPage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]); // Respuesta seleccionada por el jugador
  const [playerName, setPlayerName] = useState('');
  const [socketId, setSocketId] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Estado para pausar el juego
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const socket = useSocket(); // Obtener instancia del socket
  const code = parseInt(params.code); // Código del juego tomado de los parámetros
  const router = useRouter();

  // Verifica si el jugador tiene un nickname almacenado en la sesión
  useEffect(() => {
    const userNick = sessionStorage.getItem('nickname');
    if (!userNick) {
      router.push('/'); // Redirige al inicio si no hay nickname
    }
  }, [router]);

  useEffect(() => {
    if (!socket) {
      router.push('/'); // Redirige al inicio si el socket no está disponible
    } else {
      console.log(socketId);

      setSocketId(socket.id);
    }
  }, [socket, router]);

  useEffect(() => {
    if (!socket) return;
    // Obtener jugadores del servidor y actualizar el estado del jugador actual
    const handleGetPlayers = (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        const player = response.players.find(
          (player) => player.socketId === socket.id
        );
        if (player) {
          setPlayerName(player.playerName); // Almacena el nombre del jugador
          setPlayerId(player.id); // Guarda el playerId aquí
        }
      }
    };

    socket.emit('getPlayers', { code }, handleGetPlayers); // Solicita la lista de jugadores al servidor

    return () => {
      socket.off('getPlayers', handleGetPlayers);
    };
  }, [socket, code]);

  useEffect(() => {
    if (socket) {
      // Obtener el estado inicial del juego
      const fetchQuestions = () => {
        socket.emit('getCodeGame', { code }, (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            setQuestions(response.asks); // Almacena las preguntas del juego
            setCurrentQuestionIndex(0); // Reinicia el índice de preguntas
            setTimeLeft((response.asks[0]?.timer || 0) * 1000); // Convertir a milisegundos
            setGameId(response.game.id); // Guarda el ID del juego
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
      });

      socket.on('stopGame', () => {
        toast('El juego ha finalizado', {
          position: 'bottom-center',
          autoClose: 1000,
          toastId: 'custom-id-yes',
          onClose: () => {
            router.push(`/pages/ranking/${code}`);
          },
        });
      });
      // Actualiza las preguntas cuando se recibe una actualización del servidor
      socket.on('updatedAsks', (response) => {
        if (response.asks) {
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
      // Elimina preguntas cuando se recibe una solicitud de eliminación del servidor
      socket.on('updateDeleteAsk', (response) => {
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
  }, [socket, code, router, playerName]);

  useEffect(() => {
    // Maneja el temporizador de las preguntas
    if (timeLeft === null || isPaused) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(intervalId);
          handleTimeUp(); // Maneja la acción cuando se acaba el tiempo
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, isPaused]);

  useEffect(() => {
    // Configura el temporizador cuando cambia la pregunta
    setTimeLeft((questions[currentQuestionIndex]?.timer || 0) * 1000); // Convertir a milisegundos
  }, [currentQuestionIndex, questions]);

  const handleAnswerClick = async (answerKey) => {
    if (isPaused) return; // Evita cambiar la respuesta si el juego está pausado

    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerSelected = selectedAnswers.includes(answerKey);

    if (isAnswerSelected) {
      // Desmarcar la respuesta si ya está seleccionada
      setSelectedAnswers(selectedAnswers.filter(answer => answer !== answerKey));
    } else {
      // Marcar la respuesta como seleccionada
      setSelectedAnswers([...selectedAnswers, answerKey]);
    }

    // Calcula si la respuesta seleccionada es correcta
    const isSelectedAnswerCorrect =
      (answerKey === 'a' && currentQuestion.isCorrectA) ||
      (answerKey === 'b' && currentQuestion.isCorrectB) ||
      (answerKey === 'c' && currentQuestion.isCorrectC) ||
      (answerKey === 'd' && currentQuestion.isCorrectD);

    if (isSelectedAnswerCorrect) {
      // Si la respuesta seleccionada es correcta, suma los puntos
      const correctAnswers = [
        (currentQuestion.isCorrectA ? 'a' : null),
        (currentQuestion.isCorrectB ? 'b' : null),
        (currentQuestion.isCorrectC ? 'c' : null),
        (currentQuestion.isCorrectD ? 'd' : null),
      ].filter(Boolean);

      const selectedCorrectCount = selectedAnswers.filter(answer => correctAnswers.includes(answer)).length;
      const totalCorrectAnswers = correctAnswers.length;

      const basePoints = 10;
      const timeBonus = Math.floor(timeLeft / 200); // Bonus de puntos basado en el tiempo restante en milisegundos
      const totalPoints = (basePoints * (selectedCorrectCount / totalCorrectAnswers)) + timeBonus;

      const newScore = score + totalPoints;
      setScore(newScore);
      await insertPlayer(gameId, playerName, totalPoints); // Inserta los puntos del jugador en el servidor
    } else {
      // Si la respuesta seleccionada es incorrecta, no suma puntos
      await insertPlayer(gameId, playerName, 0); // Inserta cero puntos si la respuesta es incorrecta
    }
  };

  // Inserta la puntuación del jugador en el servidor
  const insertPlayer = (gameId, playerName, score) => {
    return new Promise((resolve, reject) => {
      socket.emit('insertPlayer', { gameId, playerName, score }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });

      socket.on('connect_error', (error) => {
        reject('Connection error:', error);
      });
    });
  };
  // Maneja la acción cuando se acaba el tiempo de una pregunta
  const handleTimeUp = async () => {
    setShowCorrectAnswer(true); // Muestra la respuesta correcta
    setAlertMessage(`Puntos: ${score}px 🚀`);
    setAlertType('info');
    setTimeout(() => {
      setSelectedAnswers([]); // Limpia las respuestas seleccionadas
      setShowCorrectAnswer(false);
      moveToNextQuestion();
    }, 1000);
  };

  // Mueve a la siguiente pregunta o finaliza el juego si no hay más preguntas
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft((questions[nextIndex]?.timer || 0) * 1000); // Convertir a milisegundos
    } else {
      socket.emit('stopGame');
      router.push(`/pages/ranking/${code}`);
    }
  };

  const deletePlayer = useCallback(() => {
    if (!socket || !playerId) {
      console.error('Player ID not found or socket not connected');
      return;
    }

    socket.emit('deletePlayer', { playerId, code }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        sessionStorage.clear();
        localStorage.clear();
        console.log('Quiz finalizado, redirigiendo a inicio');
        router.push('/'); // Redirigir a la página principal después de eliminar al jugador
      }
    });
  }, [socket, code, router, playerId]);

  if (questions.length === 0) {
    return <Loading />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const getButtonClass = (answerKey) => {
    const isSelected = selectedAnswers.includes(answerKey);
    if (showCorrectAnswer) {
      const isCorrectAnswer =
        (answerKey === 'a' && currentQuestion.isCorrectA) ||
        (answerKey === 'b' && currentQuestion.isCorrectB) ||
        (answerKey === 'c' && currentQuestion.isCorrectC) ||
        (answerKey === 'd' && currentQuestion.isCorrectD);

      if (isCorrectAnswer) {
        return 'ring-4 ring-green-500';
      }
      if (isSelected) {
        return 'ring-4 ring-red-500';
      }
      return '';
    }
    if (isSelected) {
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
      <BeforeUnloadHandler onBeforeUnload={deletePlayer} />
      <ScoreAlert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage('')}
        autoClose={!!alertMessage}
      />
      <ToastContainer />
     {currentQuestion && (
  <div className='flex flex-col items-center rounded-md mt-20 bg-[#111] max-w-2xl w-full p-1 bg-custom-linear min-w-screen'>
    <div
      key={currentQuestion.id}
      className='game flex flex-col justify-center items-center mb-5 py-5 w-full p-5 bg-[#111]'
    >
      <div className='flex flex-col items-center justify-center'>
        <p className='text-red-600 text-4xl mt-5 font-bold border-b-2 border-b-red-600 w-20 text-center'>
          {typeof timeLeft === 'number' ? formatTime(timeLeft) : timeLeft}
        </p>
      </div>
      <p className='mt-10 mb-8 text-white text-center text-lg overflow-wrap break-word'>
        {`${currentQuestionIndex + 1}. ${currentQuestion.ask}`}
      </p>
            <div className={`grid gap-5 w-full py-4 md:grid-cols-2 sm:grid-cols-1 xs:grid-cols-1  ${currentQuestion.c && currentQuestion.d ? 'grid-cols-1' : 'grid-cols-1'}`}>
        <div
          onClick={() => handleAnswerClick('a')}
                className={`rounded-md p-4 cursor-pointer w-full bg-red-600 ${getButtonClass('a')} text-center overflow-wrap break-word text-sm sm:text-base`}
        >
          {currentQuestion.a}
        </div>
        <div
          onClick={() => handleAnswerClick('b')}
                className={`rounded-md p-4 cursor-pointer w-full bg-blue-600 ${getButtonClass('b')} text-center overflow-wrap break-word text-sm sm:text-base  ${currentQuestion.c && currentQuestion.d ? 'grid-cols-1' : ''}`}
        >
          {currentQuestion.b}
        </div>

        {currentQuestion.c && (
          <div
            onClick={() => handleAnswerClick('c')}
            className={`rounded-md p-4 cursor-pointer bg-yellow-600 col-span-1 w-full ${getButtonClass('c')} text-center overflow-wrap break-word text-sm sm:text-base ${
              !currentQuestion.d ? 'col-span-1 md:col-span-2 justify-self-center md:w-[308px]' : ''
            }`}
          >
            {currentQuestion.c}
          </div>
        )}

        {currentQuestion.d && (
          <div
            onClick={() => handleAnswerClick('d')}
            className={`rounded-md p-4 cursor-pointer bg-green-600 ${getButtonClass('d')} text-center overflow-wrap break-word text-sm sm:text-base ${
              !currentQuestion.c ? 'col-span-2' : ''
            }`}
          >
            {currentQuestion.d}
          </div>
        )}
      </div>
    </div>
  </div>
)}

    </div>

  );
}