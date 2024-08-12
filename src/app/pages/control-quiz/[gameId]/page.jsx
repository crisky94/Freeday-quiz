'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/socketContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from '../../../loading'
import '../../../styles/page-game/pageGame.css';
import RankingModal from '../../../components/RankingModal';
import EndGame from '@/app/components/EndGame';

export default function GameControlPage({ params }) {
  const socket = useSocket();
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
  const [ showEndGame, setShowEndGame ] = useState(false)
  const [isRankingSent, setIsRankingSent] = useState(false);
  const [players, setPlayers] = useState();
  const [playerId, setPlayerId] = useState();
  const gameId = parseInt(params.gameId);

  useEffect(() => {
    if (!socket) return;

    socket.emit('getGamesId', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        setCode(response.game.codeGame);
        socket.emit('getAsks', { gameId }, (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            const gameQuestions = response.questions;
            setQuestions(gameQuestions);
            if (gameQuestions.length > 0) {
              setTimeLeft(gameQuestions[0].timer * 1000);
            }
          }
        });
      }
    });

    const handleGameStateUpdate = (state) => {
      setGameState(state);
      switch (state) {
        case 'paused':
          toast('El juego está pausado', { position: "bottom-center", autoClose: 4000, transition: Bounce });
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

    socket.on('pauseGame', () => setIsPaused(true));
    socket.on('resumeGame', () => setIsPaused(false));
    // Manejar actualizaciones de preguntas
    socket.on('updatedAsks', (response) => {
      if (response.asks) {
        setQuestions((prevQuestions) => {
          const updatedQuestionsMap = new Map(prevQuestions.map(q => [q.id, q]));
          response.asks.forEach(newAsk => {
            updatedQuestionsMap.set(newAsk.id, { ...updatedQuestionsMap.get(newAsk.id), ...newAsk });
          });
          return Array.from(updatedQuestionsMap.values());
        });
      }
    });

    // Manejar eliminaciones de preguntas
    socket.on('updateDeleteAsk', (response) => {
      if (response.data) {
        setQuestions((prevQuestions) => {
          const updatedQuestionsMap = new Map(prevQuestions.map(q => [q.id, q]));
          updatedQuestionsMap.delete(response.data.id);
          return Array.from(updatedQuestionsMap.values());
        });
      }
    });

    socket.on('stopGame', () => {
      toast('El juego para los jugadores, ha finalizado.', {
        position: "bottom-center", autoClose: 1000, toastId: 'custom-id-yes', onClose: () => {
          setShowEndGame(true);
          setShowRankingModal(true);
        }
      });
    })

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('stopGame');
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

  const handleTimeUp = () => {
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft((questions[nextIndex]?.timer || 0) * 1000);
    } else {
      handleReloadPlayersData();
    }
  };

  const moveToLastQuestion = () => {
    const lastIndex = questions.length -1;
    setCurrentQuestionIndex(lastIndex);
    setTimeLeft(0);
  };
  const handleStopGame = () => {
    if (socket) {
      socket.emit('stopGame');
      setGameState('stopped');
      setMessage('El juego ha sido parado');
      moveToLastQuestion();    
    }
  };

  const handleReloadPlayersData = () => {
    if (socket) {
      socket.emit('getPlayers', { code }, (response) => {
        console.log(response, 'jugadores');
        if (response.error) {
          console.error(response.error);
        } else {
          setPlayers(response.players);
          setPlayerId(response.players.id)
        }
      });
    }
  };

  const handleSendRanking = () => {
    if (socket) {
      socket.emit('playerRanking', { ranking: players });
      setIsRankingSent(true);
      setShowRankingModal(true);
      setSendmsg('Ranking enviado');
    }
  };

  const handleSendMainScreen = () => {
    if (socket) {
      socket.emit('endGame');

      socket.emit('deleteAllPlayers', { gameId }, (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          toast('Redirigiendo a home.', {
            onClose: () => {
              router.push('/')
            }
          });
        }
      });
    }
  }

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
          {
            isPaused ? (
              <button onClick={() => {
                if (socket) {
                  socket.emit('resumeGame');
                  setGameState('resumed');
                  setMessage('El juego está en marcha');
                }
              }} className=' text-black hoverGradiant bg-custom-linear w-32 h-10 rounded-md px-2'>Reanudar</button>
            ) : (
                <button onClick={() => {
                  if (socket) {
                    socket.emit('pauseGame');
                    setGameState('paused');
                    setMessage('El juego está pausado');
                  }
                }} className='text-black hoverGradiant bg-custom-linear w-32 h-10 rounded-md px-2'>Pausar</button>
            )
          }
     
          <button onClick={handleStopGame}
          className=" text-black hoverGradiant bg-custom-linear w-32 h-10 rounded-md px-2">Finalizar</button>
          {showEndGame && (
            <EndGame
              onSend={handleSendMainScreen}
            />
          )}  
            <Link className='btn-edit text-black hoverGradiant bg-custom-linear w-48 h-14 rounded-md py-4 text-center' href={`/pages/modify-page/${gameId}`} target='_blank'>
              Modificar juego
            </Link>
          <div className=' flex flex-col  p-5 m-1  items-center bg-black gap-5 '>
            <p className='break-word'>Preguntas: {currentQuestionIndex + 1} de {questions.length}</p>
            <div className='text-lg text-center'>{currentQuestionIndex + 1}. {currentQuestion?.ask}</div>
            <div className='text-xl font-bold text-center mt-4 text-red-500'>
              Tiempo restante: {formatTime(timeLeft)}
            </div>
          </div>
          {showRankingModal &&
            <RankingModal
              code={code}
              ranking={players}
              onSend={handleSendRanking}/>}
          {sendmsg ? <p className='text-green-500'>{sendmsg}</p> : null}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
