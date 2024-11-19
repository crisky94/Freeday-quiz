'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/socketContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../../loading';
import '../../../styles/page-game/pageGame.css';
import RankingModal from '../../../components/RankingModal';
import EndGame from '@/app/components/EndGame';

// Componente para controlar la página del juego
export default function GameControlPage({ params }) {
  const socket = useSocket(); // Obtención del contexto del socket
  const router = useRouter();
  const [gameState, setGameState] = useState('resumed');
  const [message, setMessage] = useState('');
  const [sendmsg, setSendmsg] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const [isRankingSent, setIsRankingSent] = useState(false);
  const [playerId, setPlayerId] = useState();
  const [players, setPlayers] = useState([]);
  const gameId = parseInt(params.gameId);

  useEffect(() => {
    if (!socket) return;

    // Emitir un evento para obtener el ID del juego y luego las preguntas asociadas
    socket.emit('getGamesId', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        setCode(response.game.codeGame); // Establecer el código del juego
        socket.emit('getAsks', { gameId }, (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            const gameQuestions = response.questions;
            setQuestions(gameQuestions); // Establecer las preguntas del juego
            if (gameQuestions.length > 0) {
              setTimeLeft(gameQuestions[0].timer * 1000);
            }
          }
        });
      }
    });
    // Manejar actualizaciones del estado del juego (pausa, reanudación, finalización)
    const handleGameStateUpdate = (state) => {
      setGameState(state);
      switch (state) {
        case 'paused':
          toast('El juego está pausado', {
            position: 'bottom-center',
            autoClose: 4000,
            transition: Bounce,
          });
          break;
        case 'resumed':
          toast('El juego está en marcha', {
            position: 'bottom-center',
            autoClose: 5000,
            transition: Bounce,
          });
          break;
        case 'stopped':
          toast('El juego ha finalizado', {
            position: 'bottom-center',
            autoClose: 4000,
            transition: Bounce,
          });
          break;
        default:
          setMessage('Inicio del juego');
      }
      console.log(gameState);
    };
    // Escuchar eventos del socket para actualizar el estado del juego en tiempo real
    socket.on('pauseGame', async () => {
      setIsPaused(true);
      await handleReloadPlayersData(); // Recarga los datos de los jugadores al pausar
    });
    socket.on('resumeGame', () => {
      setTimeout(() => {
        setIsPaused(false);
      }, 3050);
    });
    socket.on('updatedAsks', (response) => {
      if (response.asks) {
        setQuestions((prevQuestions) => {
          const updatedQuestionsMap = new Map(
            prevQuestions.map((q) => [q.id, q])
          );
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
    //Para avtualizar en tiempo real las preguntas
    socket.on('updateDeleteAsk', (response) => {
      if (response.data) {
        setQuestions((prevQuestions) => {
          const updatedQuestionsMap = new Map(
            prevQuestions.map((q) => [q.id, q])
          );
          updatedQuestionsMap.delete(response.data.id);
          return Array.from(updatedQuestionsMap.values());
        });
      }
    });

    socket.on('stopGame', () => {
      toast('El juego para los jugadores, ha finalizado.', {
        position: 'bottom-center',
        autoClose: 1000,
        toastId: 'custom-id-yes',
        onClose: () => {
          setShowEndGame(true);
          setShowRankingModal(true);
          handleReloadPlayersData();
        },
      });
    });

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('stopGame');
    };
  }, [socket, router]);
  // Para manejar el temporizador de las preguntas
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
  // Función que se ejecuta cuando el tiempo para una pregunta se agota
  const handleTimeUp = () => {
    setTimeout(() => {
      moveToNextQuestion();
    }, 1020);
  };
  // Función para avanzar a la siguiente pregunta
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft((questions[nextIndex]?.timer || 0) * 1000);
    } else {
      handleReloadPlayersData();
    }
  };
  // Función para saltar a la última pregunta
  const moveToLastQuestion = () => {
    const lastIndex = questions.length - 1;
    setCurrentQuestionIndex(lastIndex);
    setTimeLeft(0);
  };
  // Función para detener el juego
  const handleStopGame = async () => {
    if (socket) {
      // Primero recarga los datos de los jugadores
      await handleReloadPlayersData();

      // Una vez cargados, emite el evento para finalizar el juego
      socket.emit('stopGame');
      setGameState('stopped');
      setMessage('El juego ha finalizado');
      moveToLastQuestion();
      setIsPaused(true);
      // Finalmente, muestra el modal con el ranking actualizado
      setShowRankingModal(true);
    }
  };

  // Función para recargar los datos de los jugadores
  const handleReloadPlayersData = async () => {
    return new Promise((resolve, reject) => {
      if (socket) {
        socket.emit('getPlayers', { code }, (response) => {
          if (response.error) {
            console.error(response.error);
            reject(response.error); // Maneja errores aquí
          } else {
            setPlayers(response.players); // Actualizar la lista de jugadores
            setPlayerId(response.players.id);
            resolve(); // Resuelve la promesa al terminar
          }
        });
        console.log(playerId);
      }
    });
  };

  // Función para enviar el ranking de jugadores
  const handleSendRanking = () => {
    if (socket) {
      socket.emit('playerRanking', { ranking: players });
      setIsRankingSent(true);
      setShowRankingModal(true);
      setSendmsg('Ranking enviado');
    }
  };

  // Función para enviar la pantalla principal después de que el juego finaliza
  const handleSendMainScreen = async () => {
    if (socket) {
      socket.emit('endGame');
      // Guardar el ranking antes de eliminar jugadores
      try {
        await saveRankings(); // Llamada para guardar el ranking
      } catch (error) {
        console.error('Error al guardar el ranking:', error);
        return; // Si ocurre un error al guardar el ranking, no continuar
      }

      // Eliminar jugadores después de guardar el ranking
      socket.emit('deleteAllPlayers', { gameId }, (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          toast('Quiz finalizado, enviando jugadores al inicio', {
            autoClose: 2000,
            onClose: () => {
              router.push('/');
            },
          });
        }
      });
    }
  };
  // Función para guardar los rankings de los jugadores en el servidor
  const saveRankings = async () => {
    const rankings = players
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        gameId,
        playerId: player.id,
        playerName: player.playerName,
        playerScore: player.score,
        rank: index + 1,
      }));

    try {
      const response = await fetch('/api/saveRankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rankings }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el ranking.');
      }
    } catch (error) {
      console.error('Error al guardar el ranking:', error);
      throw error; // Lanzar error para manejarlo en la función de llamada
    }
  };
  // Función para formatear el tiempo restante en segundos
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
    <div className='flex flex-col items-center justify-center h-full w-full pt-12 '>
      <div className=' flex '>
        <div className='flex flex-col px-2   h-screen w-screen items-center bg-[#111] gap-5'>
          <h1 className='uppercase font-bold text-2xl text-center '>
            Sala de control del juego
          </h1>
          <div className='text-[#1cffe4] font-bold uppercase'>{message}</div>
          {isPaused ? (
            <button
              onClick={() => {
                if (socket) {
                  socket.emit('resumeGame');
                  setGameState('resumed');
                  setMessage('El juego está en marcha');
                }
              }}
              className='text-black hoverGradiant bg-custom-linear w-48 h-12 rounded-md px-2 font-bold'
            >
              Reanudar
            </button>
          ) : (
            <button
              onClick={() => {
                if (socket) {
                  socket.emit('pauseGame');
                  setGameState('paused');
                  setMessage('El juego está pausado');
                }
              }}
              className='text-black hoverGradiant font-bold bg-custom-linear w-48 h-12 rounded-md px-2'
            >
              Pausar
            </button>
          )}
          {!showEndGame && (
            <button
              onClick={handleStopGame}
              className='text-black  hoverGradiant font-bold bg-custom-linear w-48 h-12 rounded-md px-2'
            >
              Finalizar
            </button>
          )}
          {showEndGame && <EndGame onSend={handleSendMainScreen} />}
          <Link
            className='btn-edit text-black hoverGradiant font-bold bg-custom-linear w-48 h-12 rounded-md p-3 md:p-2 text-center'
            href={`/pages/modify-page/${gameId}`}
            target='_blank'
          >
            Modificar juego
          </Link>
          <div className='bg-custom-linear max-w-full p-1 mx-8'>
            <div className='flex flex-col p-2  w-full  items-center rounded-sm bg-[#111] '>
              <p className='break-words font-semibold'>
                Preguntas: {currentQuestionIndex + 1} de {questions.length}
              </p>
              <div className='text-md text-center w-full  mx-8    p-2 px-8'>
                <p className=' break-words  whitespace-normal '>
                  {currentQuestion?.ask}
                </p>
              </div>
              <div className='text-xl font-bold text-center mt-1 text-red-500'>
                Tiempo restante: {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {showRankingModal && (
            <RankingModal
              code={code}
              ranking={players}
              onSend={handleSendRanking}
            />
          )}
          {isRankingSent && sendmsg ? (
            <p className='text-green-500'>{sendmsg}</p>
          ) : null}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
