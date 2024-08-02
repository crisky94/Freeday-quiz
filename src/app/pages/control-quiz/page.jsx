// // 'use client';

// // import { useState } from 'react';
// // import { useSocket } from '@/context/socketContext';

// // function ControlPage() {
// //   const socket = useSocket();


// //   const handlePause = () => {
// //     socket.emit('pauseGame');
// //   };

// //   const handleStop = () => {
// //     socket.emit('stopGame');
// //   };

// //   return (
// //     <div className="flex flex-col gap-5 w-72 items-center pt-16">
// //       <h1 className='uppercase'>Sala de control del juego</h1>
// //       <button onClick={handlePause} className='text-black hoverGradiant bg-custom-linear w-24 h-10 rounded-md'>Pause</button>
// //       <button onClick={handleStop} className='text-black hoverGradiant bg-custom-linear w-24 h-10 rounded-md'>Stop</button>
// //     </div>
// //   )
// // }

// // export default ControlPage

// 'use client';

// import { useSocket } from '@/context/socketContext';
// // import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { Tooltip } from '@nextui-org/tooltip';

// function ControlPage() {
//   const socket = useSocket();
//   const [gameState, setGameState] = useState('stopped'); // Estado inicial del juego
//   const [message, setMessage] = useState('El juego está parado'); // Mensaje inicial
//   const gameId = 1
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(null);
//   const [game, setGame] = useState([]);

//   const handlePause = () => {
//     if (socket) {
//       socket.emit('pauseGame');
//       setGameState('paused');
//       setMessage('El juego está pausado');
//     }
//   };

//   const handleResume = () => {
//     if (socket) {
//       socket.emit('resumeGame');
//       setGameState('resumed');
//       setMessage('El juego está en marcha');
//     }
//   };

//   const hanldeModify = () => {
//     if (socket) {
//       socket.emit('pauseGame');
//       setGameState('paused');
//       setMessage('El juego está pausado');
//     }
//   }

//   const handleStop = () => {
//     if (socket) {
//       socket.emit('stopGame');
//       setGameState('stopped');
//       setMessage('El juego está parado');
//     }
//   };

//   useEffect(() => {
//     if (!socket) return;

//     const handleGameStateUpdate = (state) => {
//       setGameState(state);
//       switch (state) {
//         case 'paused':
//           setMessage('El juego está pausado');
//           break;
//         case 'resumed':
//           setMessage('El juego está en marcha');
//           break;
//         case 'stopped':
//           setMessage('El juego está parado');
//           break;
//         default:
//           setMessage('Inicio del juego');
//       }
//     };

//     socket.on('gameStateUpdate', handleGameStateUpdate);

//     // socket.emit('getGamesId', { gameId }, (response) => {
//     //   console.log('getGamesId response:', response.game);
//     //   if (response.error) {
//     //     console.error(response.error);
//     //   } else {
//     //     setGame(response);
//     //   }
//     // });

//     // socket.emit('getAsks', { gameId }, (response) => {
//     //   console.log('getAsks response:', response.questions);
//     //   if (response.error) {
//     //     console.error(response.error);
//     //   } else {
//     //     setQuestions(response);
//     //   }
//     // });

//     return () => {
//       socket.off('gameStateUpdate', handleGameStateUpdate);
//     };
//   }, [socket]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen w-full ">
//       <div className='bg-custom-linear flex'>
//         <div className='flex flex-col  p-14 m-1 h-auto w-58 sm:w-full items-center bg-black gap-5'>
//           <h1 className='uppercase font-bold text-xl text-center'>Sala de control del juego</h1>
//           <div className='text-[#1cffe4] font-bold uppercase'>
//             {message ? message : ''}
//           </div>
//           <button onClick={handlePause} className='text-black hoverGradiant bg-custom-linear  w-32 h-10 rounded-md px-2'>Pause</button>
//           <button onClick={handleResume} className='text-black hoverGradiant bg-custom-linear w-32 h-10 rounded-md px-2'>Reanudar</button>
//           <button onClick={handleStop} className='text-black hoverGradiant bg-custom-linear  w-32 h-10 rounded-md px-2'>Stop</button>
//           <Tooltip className='text-[#fcff00] text-base uppercase' content='Sólo modificar preguntas futuras'>
//             <Link className='mt-5 text-black hoverGradiant bg-custom-linear  w-44 h-14 rounded-md py-4 text-center' href={`/pages/modify-page/${1}`} onClick={hanldeModify} target='_blank' >
//               Modificar juego
//             </Link>
//           </Tooltip>
//           <Link className='text-black hoverGradiant bg-custom-linear  w-44 h-14 rounded-md py-4 text-center' href={`/pages/page-game/${123456}`} target='_blank' >Juego</Link>
//         </div>
//       </div>
//     </div>

//   );
// }

// export default ControlPage;
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/socketContext';
import Link from 'next/link';
import { Tooltip } from '@nextui-org/tooltip';
import { useRouter } from 'next/navigation';
import { Bounce,  ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from '../../loading';
import '../../styles/page-game/pageGame.css';

export default function GameControlPage({}) {
  const socket = useSocket();
  const router = useRouter();
  const [gameState, setGameState] = useState('resumed');
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // const gameId = params.gameId
  const gameId = 1;

  useEffect(() => {
    if (!socket) return;

    // Obtener los detalles del juego y las preguntas
    socket.emit('getGamesId', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        const game = response.game;
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
      router.push('/pages/pinPage')
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

  const handleAnswerClick = async (answerKey) => {
    if (selectedAnswer !== null || isPaused) return;

    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswer(answerKey);
    setIsCorrect(answerKey === currentQuestion.answer.toLowerCase()); 
  };


  const handleTimeUp = async () => {
    setShowCorrectAnswer(true);

    setTimeout(() => {
      setIsCorrect(false);
      setSelectedAnswer(null);
      setShowCorrectAnswer(false);
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

  const getButtonClass = (answerKey) => {
    if (showCorrectAnswer) {
      if (answerKey === questions[currentQuestionIndex].answer.toLowerCase()) {
        return "ring-4 ring-green-600";
      }    
    }
    
    return '';
  };

  function getButtonColor(key) {
    switch (key) {
      case 'a':
        return 'bg-red-500 hover:bg-red-600';
      case 'b':
        return 'bg-green-500 hover:bg-green-600';
      case 'c':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'd':
        return 'bg-yellow-500 hover:bg-yellow-600';
    
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
      </div>
    </div>

      <div className="game flex flex-col items-center justify-center  w-full">
        <div className='bg-custom-linear flex mb-10'>
          <div className=' flex flex-col  p-5 m-1  items-center bg-black gap-5 '>
        <div className='text-lg text-center'>{currentQuestionIndex + 1}. {currentQuestion?.ask}</div>
        <div className='text-xl font-bold text-center mt-4 text-red-500'>
          Tiempo restante: {formatTime(timeLeft)}
        </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 w-full"'>
          {['a', 'b', 'c', 'd'].map((key) => (
            <button
              key={key}
              onClick={() => handleAnswerClick(key)}
              className={`p-2 m-2 text-white rounded ${getButtonClass(key)} ${getButtonColor(key)}`}
            >
              {currentQuestion[key]}
            </button>
          ))}
        </div>
      </div>
 </div>
 </div>
      <ToastContainer/>
    </div>
  );
}
