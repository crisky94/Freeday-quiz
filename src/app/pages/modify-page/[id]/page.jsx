'use client';

import { useSocket } from '../../../../context/SocketContext';
import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import User from '../../../components/User';
import '../../../styles/pageModify.css';

export default function EditGame({ params }) {
  const [formData, setFormData] = useState({
    gameName: '',
    gameDetail: '',
    asks: []
  });

  const socket = useSocket();
  const gameId = params.id;
  // const { user } = useAuth(User);

  useEffect(() => {
    const fetchData = () => {
      socket.emit('getAsks', { gameId }, (response) => {
        console.log('getAsks response:', response);
        if (response.error) {
          console.error(response.error);
        } else {
          setFormData((prevData) => ({
            ...prevData,
            asks: response.questions.map(question => ({
              ...question,
              ask: question.ask || '',
              answer: question.answer || null,
              timer: question.timer || 30
            }))
          }));
        }
      });

      socket.emit('getGamesId', { gameId }, (response) => {
        console.log('getGamesId response:', response);
        if (response.error) {
          console.error(response.error);
        } else {
          setFormData((prevData) => ({
            ...prevData,
            gameName: response.game.nameGame,
            gameDetail: response.game.detailGame,
          }));
        }
      });
    };

    fetchData();
  }, [gameId, socket]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  const handleAskChange = useCallback((index, field, value) => {
    setFormData((prevData) => {
      const newAsks = [...prevData.asks];
      newAsks[index] = {
        ...newAsks[index],
        [field]: value
      };
      return { ...prevData, asks: newAsks };
    });
  }, []);

  const handleCorrectAnswerChange = useCallback((index, option) => {
    setFormData((prevData) => {
      const newAsks = [...prevData.asks];
      newAsks[index] = {
        ...newAsks[index],
        answer: option
      };
      return { ...prevData, asks: newAsks };
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    console.log('formData:', formData);
    socket.emit('updateGame', { formData, gameId }, (response) => {
      console.log('updateGame response:', response);
      if (response.success) {
        toast.success('Juego actualizado', {
          onClose: () => {
            setTimeout(() => {
              window.location.href = '/';
            });
          }
        });
      } else {
        toast.error('Error al actualizar el juego', {
          onClose: () => {
            setTimeout(() => {
              window.location.reload();
            });
          }
        });
      }
    });
  };

  const handleAutoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <form className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 min-h-screen pt-16" onSubmit={handleSubmit}>
      <div className="card-body w-full border  rounded-md flex flex-col justify-center text-center items-center mb-5 py-5 px-5 ">
        <label className=" text-sm sm:text-base font-bold uppercase mb-4 bg-black" htmlFor="gameName">Nombre del Juego:</label>
        <input
          className="text-slate-500 text-center rounded-md h-10 placeholder:text-center focus:outline-none ring-4  focus:ring-yellow-200 mb-4 w-full"
          type="text"
          id="gameName"
          name="gameName"
          value={formData.gameName}
          onChange={handleChange}
        />

        <label className=" text-sm sm:text-base font-bold uppercase mb-4 bg-black" htmlFor="gameDetail">Detalle del Juego:</label>
        <textarea
          className="text-slate-500 text-center rounded-md placeholder:text-center focus:outline-none ring-4 focus:ring-yellow-200 mb-4 w-full resize-none overflow-hidden"
          id="gameDetail"
          name="gameDetail"
          value={formData.gameDetail}
          onChange={handleChange}
          onInput={handleAutoResize}
        />
      </div>
      <div className="w-full flex flex-wrap gap-4">
        {formData.asks.map((ask, index) => (
          <div key={index} className=" border rounded-md flex flex-col justify-start text-center items-center px-5 py-5 w-full md:w-[calc(50%-0.5rem)]">
            <div className="flex flex-col text-center items-center card-title w-full">
              <label className=" text-sm sm:text-base font-bold uppercase mb-4 bg-black w-40" htmlFor={`ask-${index}`}>Pregunta {index + 1}:</label>
              <textarea
                className="text-slate-500 text-center rounded-md placeholder:text-center focus:outline-none ring-4 focus:ring-yellow-200 mb-4 p-2 w-full resize-none overflow-hidden"
                id={`ask-${index}`}
                name={`ask-${index}`}
                value={ask.ask}
                onChange={(e) => handleAskChange(index, 'ask', e.target.value)}
                onInput={handleAutoResize}
              />
            </div>
            <div className="card-body w-full">
              {['a', 'b', 'c', 'd'].map((option) => (
                <div className="flex gap-2" key={option}>
                  <label className=" text-sm sm:text-base mr-4 font-bold uppercase bg-black w-40 h-5" htmlFor={`${option}-${index}`}>Opción {option.toUpperCase()}:</label>
                  <textarea
                    className={`${option === "a"
                      ? 'bg-red-600 focus:ring-red-800'
                      : option === "b"
                        ? 'bg-blue-600 focus:ring-blue-800'
                        : option === 'c'
                          ? 'bg-[#00ff01] focus:ring-green-800'
                          : 'bg-[#fcff00] focus:ring-yellow-600'
                      } text-black text-center rounded-md h-10 px-2 placeholder:text-center focus:outline-none ring-4 ring-yellow-400 mb-4 w-full resize-none overflow-hidden`}
                    id={`${option}-${index}`}
                    name={`${option}-${index}`}
                    value={ask[option]}
                    onChange={(e) => handleAskChange(index, option, e.target.value)}
                    onInput={handleAutoResize}
                  />

                  <input
                    type="radio"
                    value={ask[option]}
                    name={`correctAnswer-${index}`}
                    checked={ask.answer === option}
                    onChange={() => handleCorrectAnswerChange(index, option)}
                  />
                </div>
              ))}
              <div className="flex flex-col card-title w-full justify-center items-center">
                <label className=" text-sm sm:text-base font-bold uppercase mb-4 bg-black" htmlFor={`timer-${index}`}>Temporizador (segundos):</label>
                <input
                  className="text-slate-500 text-center rounded-md h-10 placeholder:text-center focus:outline-none ring-4 ring-white focus:ring-[#fcff00] mb-4 w-20"
                  type="number"
                  min={3}
                  max={50}
                  id={`timer-${index}`}
                  name={`timer-${index}`}
                  value={ask.timer}
                  onChange={(e) => handleAskChange(index, 'timer', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
      <div className="flex justify-center mt-10 mb-10">
        <button type="submit" className="btnfos-5 h-10 w-32  rounded-md text-black">
          Guardar
        </button>
      </div>
    </form>
  );
}
