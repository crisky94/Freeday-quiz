'use client';

import { useEffect, useState } from 'react';
import Loading from '../../../loading';
import { useSocket } from '../../../../context/SocketContext';
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GamePage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [gameId, setGameId] = useState([]);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const socket = useSocket();
  const code = parseInt(params.code);

  useEffect(() => {
    const playerName = localStorage.getItem('nickname');
    if (playerName) {
      setPlayerName(playerName);
      console.log(playerName);
    }

    if (socket) {
      socket.emit('getCodeGame', { code }, (response) => {
        console.log(response);
        if (response.error) {
          console.error(response.error);
        } else {

          setQuestions(response.asks);
          setCurrentQuestionIndex(0);
          setTimeLeft((response.asks[0]?.timer || 0) * 1000); // Convertir a milisegundos
          setGameId(response.game.id);
        }
      });
    }
  }, [socket, code, playerName]);

  useEffect(() => {
    if (timeLeft === null) return;

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
  }, [timeLeft]);

  const handleAnswerClick = async (answerKey) => {
    if (selectedAnswer !== null) return; // Evita cambiar la respuesta

    const currentQuestion = questions[currentQuestionIndex];
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
    const currentQuestion = questions[currentQuestionIndex];
    setShowCorrectAnswer(true);

    setTimeout(() => {
      setIsCorrect(false);
      setSelectedAnswer(null);
      setShowCorrectAnswer(false);
      showToast()
        .then(() => {
          moveToNextQuestion();
        });
    }, 1000);
  };

  const showToast = () => {
    return new Promise((resolve) => {
      toast(`Puntos: ${score}px  🚀`, {
        toastId: "custom-id-yes",
        position: "bottom-center",
        autoClose: 2000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "light",
        transition: Bounce,
        onClose: resolve,  // Resolviendo la promesa cuando el toast se cierra
      });
    });
  };

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft((questions[nextIndex]?.timer || 0) * 1000); // Convertir a milisegundos
    } else {
      window.location.href = '/pages/ranking';
    }
  };


  if (questions.length === 0) {
    return <Loading />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const getButtonClass = (answerKey) => {
    if (showCorrectAnswer) {
      if (answerKey === currentQuestion.answer.toLowerCase()) {
        return "ring-4 ring-green-500";
      }
      return answerKey === selectedAnswer ? "ring-4 ring-red-500" : "";
    }
    if (answerKey === selectedAnswer) {
      return "ring-4 ring-white";
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
      <div className="flex flex-col gap-5 items-center sm:w-full md:w-2/3 lg:w-1/3 xl:w-2/5 rounded-md mt-20 border-8 border-l-yellow-200 border-r-green-200 border-t-cyan-200 border-b-orange-200 bg-black ">
        <ToastContainer />
        <div key={currentQuestion.id} className="flex flex-col flex-wrap justify-center items-center h-auto mb-5 py-5 px-5 rounded-md w-full">
          <p className='text-red-600 text-4xl mt-5 font-bold'>{typeof timeLeft === 'number' ? formatTime(timeLeft) : timeLeft}</p>
          <p className='flex flex-col mt-10 mb-10 text-white'>{currentQuestionIndex + 1}. {currentQuestion.ask}</p>
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-10 justify-center items-center mt-5 mb-5 w-auto">
            <li onClick={() => handleAnswerClick('a')} className={`rounded-md h-auto w-auto p-4 cursor-pointer bg-red-600 ${getButtonClass('a')}`}>
              {currentQuestion.a}
            </li>
            <li onClick={() => handleAnswerClick('b')} className={`rounded-md h-auto w-auto p-4 cursor-pointer bg-blue-600 ${getButtonClass('b')}`}>
              {currentQuestion.b}
            </li>
          </ul>
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-10 justify-center items-center mt-5 mb-5 w-auto">
            <li onClick={() => handleAnswerClick('c')} className={`rounded-md h-auto w-auto p-4 cursor-pointer bg-green-600 ${getButtonClass('c')}`}>
              {currentQuestion.c}
            </li>
            <li onClick={() => handleAnswerClick('d')} className={`rounded-md h-auto w-auto p-4 cursor-pointer bg-yellow-600 ${getButtonClass('d')}`}>
              {currentQuestion.d}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
