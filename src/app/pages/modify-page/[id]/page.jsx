'use client';
import { useSocket } from '@/context/socketContext';
import { useState, useEffect, useCallback } from 'react';
import { Flip, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import DeleteAsk from '@/app/components/DeleteAsk';

export default function EditGame({ params }) {
  const [formData, setFormData] = useState({
    gameName: '',
    gameDetail: '',
    asks: [],
  });

  const socket = useSocket();
  const gameId = params.id;
  const router = useRouter();
  const [isNew, setIsnew] = useState(false);

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
              id: question.id, // Asegúrate de que cada pregunta existente tenga su id
              ask: question.ask || '',
              a: question.a || '',
              b: question.b || '',
              c: question.c || '',
              d: question.d || '',
              timer: question.timer || 5,
              answer: question.answer || null,
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
    // Escuchar actualizaciones de preguntas desde el servidor
    socket.on('updateQuestions', (updatedAsks) => {
      setFormData((prevData) => ({
        ...prevData,
        asks: updatedAsks,
      }));
    });

    return () => {
      socket.off('updateQuestions');
    };
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

  const handleAddQuestion = () => {
    setFormData((prevData) => ({
      ...prevData,
      asks: [
        ...prevData.asks,
        { ask: '', a: '', b: '', c: '', d: '', answer: '', timer: 5 },
      ],
    }));
  };

  const handleRemoveQuestion = (askId) => {
    socket.emit('deleteAsk', { askId }, (response) => {
      if (response.success) {
        router.refresh();
        setFormData((prevData) => ({
          ...prevData,
          asks: prevData.asks.filter((ask) => ask.id !== askId),
        }));
      } else {
        console.error(response.error);
      }
    });
  };

  const handleClearNewQuestions = () => {
    setFormData((prevData) => {
      // Filtrar solo las preguntas existentes (con id)
      const newAsks = prevData.asks.filter((ask) => ask.id);
      return {
        ...prevData,
        asks: newAsks,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('updateGame', { formData, gameId }, (response) => {
      if (response.success) {
        toast('Juego actualizado con éxito 🚀', {
          position: 'bottom-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: 'light',
          transition: Flip,
          onClose: () => {
            setTimeout(() => {
              router.push('/');
            });
          },
        });
      } else {
        toast.error('No se ha podido actualizar el juego');
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
      className='flex flex-col items-center w-full  max-w-3xl mx-auto p-4 min-h-screen pt-16'
      onSubmit={handleSubmit}
    >
      <div className='card-body w-full border-2 border-l-yellow-200 border-r-green-200 border-t-cyan-200 border-b-orange-200 bg-[#111] rounded-md flex flex-col justify-center text-center mx-14 items-center mb-5 py-5 px-5'>
        <label
          className='text-sm sm:text-base font-bold uppercase mb-4   p-2 rounded-md'
          htmlFor='gameName'
        >
          Nombre del Juego:
        </label>
        <input
          className='text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-yellow-200 mb-4 w-full'
          type='text'
          id='gameName'
          name='gameName'
          value={formData.gameName}
          onChange={handleChange}
        />
        <label
          className='text-sm sm:text-base font-bold uppercase mb-4 s p-2 rounded-md'
          htmlFor='gameDetail'
        >
          Detalle del Juego:
        </label>
        <textarea
          className='text-black text-center rounded-md placeholder:text-center focus:outline-none focus:ring-2 focus:ring-yellow-200 mb-4 w-full resize-none overflow-hidden'
          id='gameDetail'
          name='gameDetail'
          value={formData.gameDetail}
          onChange={handleChange}
          onInput={handleAutoResize}
        />
      </div>
      <div className='w-full flex flex-wrap gap-4'>
        {formData.asks.map((ask, index) => (
          <div
            key={index}
            className='border border-l-yellow-200 border-r-green-200 border-t-cyan-200 border-b-orange-200 bg-[#111] rounded-md flex flex-col justify-start text-center items-center px-5 py-5 w-full md:w-[calc(50%-0.5rem)]'
          >
            <div className='flex flex-col text-center items-center card-title w-full'>
              <label
                className='text-sm sm:text-base font-bold uppercase mb-2  text-center  w-40 rounded-md'
                htmlFor={`ask-${index}`}
              >
                Pregunta {index + 1}:
              </label>
              <textarea
                className='text-black text-center rounded-md placeholder:text-center focus:outline-none focus:ring-2 focus:ring-yellow-200 mb-4 p-2 w-full resize-none overflow-hidden'
                id={`ask-${index}`}
                name={`ask-${index}`}
                value={ask.ask}
                onChange={(e) => handleAskChange(index, 'ask', e.target.value)}
                onInput={handleAutoResize}
              />
            </div>
            <div className='card-body w-full'>
              {['a', 'b', 'c', 'd'].map((option) => (
                <div className='flex items-center  ' key={option}>
                  <label
                    className='text-md p-1  font-bold uppercase mb-4   h-6 rounded-md'
                    htmlFor={`${option}-${index}`}
                  >
                    {option.toUpperCase()}:
                  </label>

                  <div className='flex w-full  relative'>
                    <input
                      className={`${
                        option === 'a'
                          ? 'bg-red-500 focus:ring-red-800'
                          : option === 'b'
                          ? 'bg-blue-500 focus:ring-blue-800'
                          : option === 'c'
                          ? 'bg-green-500 focus:ring-green-800'
                          : 'bg-yellow-500 focus:ring-yellow-600'
                      } text-black  text-center truncate rounded-md h-10
    placeholder:text-justify 
    focus:outline-none focus:ring-2 ring-yellow-400 mb-2 w-full  resize-none overflow-hidden`}
                      id={`${option}-${index}`}
                      type='text'
                      name={`${option}-${index}`}
                      value={ask[option]}
                      onChange={(e) =>
                        handleAskChange(index, option, e.target.value)
                      }
                      onInput={handleAutoResize}
                      required
                    />
                    <input
                      className='absolute right-0 top-1/2 transform -translate-y-1/2 -mt-1  mx-1 h-5'
                      type='radio'
                      value={ask[option]}
                      name={`correctAnswer-${index}`}
                      checked={ask.answer === option}
                      onChange={() => handleCorrectAnswerChange(index, option)}
                      required
                    />
                  </div>
                </div>
              ))}
              <div className='flex flex-col card-title w-full justify-center items-center'>
                <label
                  className='text-sm sm:text-base font-bold uppercase mb-4  rounded-md p-2'
                  htmlFor={`timer-${index}`}
                >
                  Temporizador (segundos):
                </label>
                <input
                  className='text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-[#fcff00] mb-4 w-20'
                  type='number'
                  min={5}
                  max={50}
                  id={`timer-${index}`}
                  name={`timer-${index}`}
                  value={ask.timer}
                  onChange={(e) =>
                    handleAskChange(index, 'timer', e.target.value)
                  }
                />
              </div>
              {!ask.id ? (
                <button
                  type='button'
                  className='btn-clear mt-2 bg-red-600 hover:bg-red-500 text-white rounded-md px-4 py-2'
                  onClick={handleClearNewQuestions}
                >
                  Limpiar
                </button>
              ) : (
                <DeleteAsk askId={ask.id} onClick={handleRemoveQuestion} />
              )}
            </div>
          </div>
        ))}
      </div>

      <ToastContainer />
      <div className='flex justify-center mb-4 gap-2'>
        <button
          type='button'
          className='btn-add mt-5 hoverGradiant bg-custom-linear text-black rounded-md px-4 py-2'
          onClick={handleAddQuestion}
        >
          Añadir Pregunta
        </button>
        <button className='btn-add mt-5 hoverGradiant bg-custom-linear text-black rounded-md px-4 py-2'>
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
