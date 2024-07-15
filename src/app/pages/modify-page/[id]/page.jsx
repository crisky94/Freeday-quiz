'use client';
import { useSocket } from '@/context/socketContext';
import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
// import "react-toastify/dist/ReactToastify.css";

export default function EditGame({ params }) {
  const [formData, setFormData] = useState({
    gameName: '',
    gameDetail: '',
    asks: [],
  });

  const socket = useSocket();
  const gameId = params.id;

  useEffect(() => {
    const fetchData = () => {
      socket.emit('getAsks', { gameId }, (response) => {
        console.log('getAsks response:', response);
        if (response.error) {
          console.error(response.error);
        } else {
          setFormData((prevData) => ({
            ...prevData,
            asks: response.questions.map((question) => ({
              ...question,
              answer: question.answer || null,
              timer: question.timer || 30,
            })),
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
      [name]: value,
    }));
  }, []);

  const handleAskChange = useCallback((index, field, value) => {
    setFormData((prevData) => {
      const newAsks = [...prevData.asks];
      newAsks[index] = {
        ...newAsks[index],
        [field]: value,
      };
      return { ...prevData, asks: newAsks };
    });
  }, []);

  const handleCorrectAnswerChange = useCallback((index, option) => {
    setFormData((prevData) => {
      const newAsks = [...prevData.asks];
      newAsks[index] = {
        ...newAsks[index],
        answer: option,
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
          },
        });
      } else {
        toast.error('Error al actualizar el juego', {
          onClose: () => {
            setTimeout(() => {
              window.location.reload();
            });
          },
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
    <form
      className='flex flex-col items-center w-full max-w-3xl mx-auto p-4'
      onSubmit={handleSubmit}
    >
      <div className='card-body w-full border rounded-md flex flex-col justify-center text-center items-center mb-5 py-5 px-5'>
        <label
          className='text-white text-sm sm:text-base font-bold'
          htmlFor='gameName'
        >
          Nombre del Juego:
        </label>
        <input
          className='text-slate-500 text-center rounded-md h-10 placeholder:text-center focus:outline-none ring-4 focus:ring-purple-500 mb-4 w-full'
          type='text'
          id='gameName'
          name='gameName'
          value={formData.gameName}
          onChange={handleChange}
        />

        <label
          className='text-white text-sm sm:text-base font-bold'
          htmlFor='gameDetail'
        >
          Detalle del Juego:
        </label>
        <textarea
          className='text-slate-500 text-center rounded-md placeholder:text-center focus:outline-none ring-4 focus:ring-purple-500 mb-4 w-full resize-none overflow-hidden'
          id='gameDetail'
          name='gameDetail'
          value={formData.gameDetail}
          onChange={handleChange}
          onInput={handleAutoResize}
        />
      </div>
      <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
        {formData.asks.map((ask, index) => (
          <div
            key={index}
            className='card-body border rounded-md flex flex-col justify-center text-center items-center px-5 py-5 w-full'
          >
            <div className='flex flex-col card-title w-full'>
              <label
                className='text-white text-sm sm:text-base font-bold'
                htmlFor={`ask-${index}`}
              >
                Pregunta {index + 1}:
              </label>
              <textarea
                className=' text-slate-500 text-center rounded-md h-10 placeholder:text-center focus:outline-none ring-4 focus:ring-purple-500 mb-4 w-full resize-none overflow-hidden'
                id={`ask-${index}`}
                name={`ask-${index}`}
                value={ask.ask}
                onChange={(e) => handleAskChange(index, 'ask', e.target.value)}
                onInput={handleAutoResize}
              />
            </div>
            <div className='card-body w-full '>
              {['a', 'b', 'c', 'd'].map((option) => (
                <div className='flex gap-2' key={option}>
                  <label
                    className='text-white text-sm sm:text-base mr-4 font-bold'
                    htmlFor={`${option}-${index}`}
                  >
                    Opción {option.toUpperCase()}:
                  </label>
                  <textarea
                    className={` ${
                      option == 'a'
                        ? 'bg-red-600 focus:ring-red-800'
                        : option == 'b'
                        ? 'bg-blue-600 focus:ring-blue-800'
                        : option == 'c'
                        ? 'bg-green-600 focus:ring-green-800'
                        : 'bg-yellow-600 focus:ring-yellow-800'
                    } text-white text-center rounded-md h-10 px-2 placeholder:text-center focus:outline-none ring-4  mb-4 w-full resize-none overflow-hidden`}
                    id={`${option}-${index}`}
                    name={`${option}-${index}`}
                    value={ask[option]}
                    onChange={(e) =>
                      handleAskChange(index, option, e.target.value)
                    }
                    onInput={handleAutoResize}
                  />

                  <input
                    type='radio'
                    value={ask[option]}
                    name={`correctAnswer-${index}`}
                    checked={ask.answer === option}
                    onChange={() => handleCorrectAnswerChange(index, option)}
                  />
                </div>
              ))}

              <div className='flex flex-col card-title w-full justify-center items-center'>
                <label
                  className='text-white text-sm sm:text-base font-bold'
                  htmlFor={`timer-${index}`}
                >
                  Temporizador (segundos):
                </label>
                <input
                  className='text-slate-500 text-center rounded-md h-10 placeholder:text-center focus:outline-none ring-4 focus:ring-purple-500 mb-4 w-20'
                  type='number'
                  min={3}
                  max={50}
                  id={`timer-${index}`}
                  name={`timer-${index}`}
                  value={ask.timer}
                  onChange={(e) =>
                    handleAskChange(index, 'timer', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
      <div className='flex justify-center w-full'>
        <button
          type='submit'
          className='mb-8 mt-4 select-none rounded-lg bg-blue-500 py-4 px-6 text-center align-middle font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-85 focus:shadow-none active:opacity-85 active:shadow-none disabled:opacity-50 disabled:shadow-none'
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
