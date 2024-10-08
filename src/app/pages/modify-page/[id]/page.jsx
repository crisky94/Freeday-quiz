'use client';
import { useSocket } from '@/context/socketContext';
import { useState, useEffect, useCallback } from 'react';
import { Flip, ToastContainer, toast } from 'react-toastify';
import { Tooltip } from '@nextui-org/tooltip';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import DeleteAsk from '@/app/components/DeleteAsk';
import DeleteNewAsk from '@/app/components/DeleteNewAsk';
import '@/app/styles/inputCheckBox.css';
import '@/app/styles/textTareas.css';

export default function EditGame({ params }) {
  // Estado inicial del formulario para el nombre, detalle del juego y preguntas
  const [formData, setFormData] = useState({
    gameName: '',
    gameDetail: '',
    asks: [],
  });

  const socket = useSocket(); // Obtener la instancia del socket desde el contexto
  const gameId = params.id; // Obtener el ID del juego desde los parámetros de la URL

  const router = useRouter();

  useEffect(() => {
    const fetchData = () => {
      // Solicita las preguntas del juego al servidor
      socket.emit('getAsks', { gameId }, (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          setFormData((prevData) => ({
            ...prevData,
            asks: response.questions.map((question) => ({
              id: question.id,
              ask: question.ask || '',
              a: question.a || '',
              b: question.b || '',
              c: question.c || '',
              d: question.d || '',
              timer: question.timer || 5,
              isCorrectA: question.isCorrectA || false,
              isCorrectB: question.isCorrectB || false,
              isCorrectC: question.isCorrectC || false,
              isCorrectD: question.isCorrectD || false,
            })),
          }));
        }
      });
      // Solicita los detalles del juego al servidor
      socket.emit('getGamesId', { gameId }, (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          // Actualiza el estado con los detalles del juego recibidos
          setFormData((prevData) => ({
            ...prevData,
            gameName: response.game.nameGame,
            gameDetail: response.game.detailGame,
          }));
        }
      });
    };

    fetchData(); // Llama a la función para obtener los datos
    // Escucha las actualizaciones de las preguntas desde el servidor y actualiza el estado
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
  // Maneja cambios en los campos de texto del formulario
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);
  // Maneja cambios en los campos específicos de las preguntas
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
  // Maneja cambios en la opción correcta seleccionada para una pregunt
  const handleCorrectAnswerChange = useCallback((index, option, isCorrect) => {
    setFormData((prevData) => {
      const newAsks = [...prevData.asks];
      newAsks[index] = {
        ...newAsks[index],
        [option]: isCorrect,
      };
      return { ...prevData, asks: newAsks };
    });
  }, []);
  // Añade una nueva pregunta al formulario
  const handleAddQuestion = () => {
    setFormData((prevData) => ({
      ...prevData,
      asks: [
        ...prevData.asks,
        { ask: '', a: '', b: '', c: '', d: '', answer: '', timer: 5 },
      ],
    }));
  };
  // Elimina una pregunta existente (ya guardada en el servidor) del formulario
  const handleRemoveQuestion = (askId) => {
    socket.emit('deleteAsk', { askId }, (response) => {
      if (response.success) {
        setFormData((prevData) => {
          // Filtrar las preguntas para eliminar la pregunta con askId
          const updatedAsks = prevData.asks.filter((ask) => ask.id !== askId);
          return {
            ...prevData,
            asks: updatedAsks,
          };
        });
      } else {
        console.error(response.error);
      }
    });
  };
  // Elimina una nueva pregunta (no guardada en el servidor) del formulario
  const handleRemoveNewQuestion = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      asks: prevData.asks.filter((_, i) => i !== index),
    }));
  };
  // Valida los datos del formulario antes de enviarlos al servidor
  const validateForm = () => {
    let hasErrors = false;

    if (!formData.gameName.trim()) {
      toast.error('El nombre del juego es requerido.');
      hasErrors = true;
    }

    formData.asks.forEach((ask, index) => {
      if (!ask.ask.trim()) {
        toast.error(`La pregunta ${index + 1} es requerida.`);
        hasErrors = true;
      }
      if (!ask.a.trim() || !ask.b.trim()) {
        toast.error(
          `Las respuestas A y B para la pregunta ${index + 1} son requeridas.`
        );
        hasErrors = true;
      }
      if (
        !ask.isCorrectA &&
        !ask.isCorrectB &&
        !ask.isCorrectC &&
        !ask.isCorrectD
      ) {
        toast.error(
          `Selecciona al menos una respuesta correcta para la pregunta ${
            index + 1
          }.`
        );
        hasErrors = true;
      }
      if (ask.timer < 3 || ask.timer > 50) {
        toast.error(`El temporizador tiene que ser mínimo 3s y máximo 50s.`);
        hasErrors = true;
      }
    });
    return hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasErrors = validateForm(); // Valida el formulario antes de enviarlo
    if (hasErrors) {
      return;
    }
    // Emite un evento para actualizar el juego en el servidor
    socket.emit('updateGame', { formData, gameId }, (response) => {
      if (response.success) {
        // Muestra una notificación de éxito y redirige al usuario a la página principal
        toast('Juego actualizado con éxito. Redirigiendo a inicio 🚀', {
          position: 'bottom-center',
          hideProgressBar: false,
          autoClose: 2000,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          closeButton: false,
          theme: 'light',
          transition: Flip,
          onClose: () => {
            router.push('/');
          },
        });
      } else {
        toast.error('No se ha podido actualizar el juego');
      }
    });
  };
  // Ajusta automáticamente el tamaño de un textarea al ingresar texto
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
          className='text-sm sm:text-base font-bold uppercase mb-4 p-2 rounded-md'
          htmlFor='gameName'
        >
          Nombre del Juego:
        </label>
        <input
          className='text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-secundary mb-4 w-full'
          type='text'
          id='gameName'
          name='gameName'
          value={formData.gameName}
          onChange={handleChange}
        />
        <label
          className='text-sm sm:text-base font-bold uppercase mb-4 p-2 rounded-md'
          htmlFor='gameDetail'
        >
          Detalle del Juego:
        </label>
        <textarea
          className='text-black text-center rounded-md placeholder:text-center focus:outline-none focus:ring-2 focus:ring-secundary mb-4 w-full resize-none overflow-hidden'
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
                className='text-sm sm:text-base font-bold uppercase mb-4 p-2 rounded-md'
                htmlFor={`ask-${index}`}
              >
                Pregunta {index + 1}:
              </label>
              <textarea
                className='text-black custom-scroll text-center rounded-md placeholder:text-sm placeholder-slate-600    focus:outline-none focus:ring-2 focus:ring-secundary mb-4 p-2 w-full resize-none max-h-24'
                id={`ask-${index}`}
                name={`ask-${index}`}
                value={ask.ask}
                onChange={(e) => handleAskChange(index, 'ask', e.target.value)}
                onInput={handleAutoResize}
                maxLength={150}
                placeholder='Escribe tu pregunta'
              />
            </div>
            <div className='card-body w-full'>
              {['a', 'b', 'c', 'd'].map((option) => (
                <div className='flex items-center' key={option}>
                  <div className='flex w-full relative'>
                    <textarea
                      className={`${
                        option === 'a'
                          ? 'bg-red-500 focus:ring-secundary'
                          : option === 'b'
                          ? 'bg-blue-500 focus:ring-secundary'
                          : option === 'c'
                          ? 'bg-green-500 focus:ring-secundary'
                          : 'bg-yellow-500 focus:ring-secundary'
                      } text-black custom-scroll p-2 pr-9 rounded-md  min-h-24   w-full placeholder-slate-600 text-sm  placeholder:text-sm px-2 focus:outline-none focus:ring-2  mb-2 resize-none overflow-hidden`}
                      id={`${option}-${index}`}
                      type='text'
                      name={`${option}-${index}`}
                      value={ask[option]}
                      maxLength={120}
                      style={{
                        // Ajusta este valor según la altura del textarea
                        lineHeight: '1.2', // Ajusta la altura de línea para el texto
                      }}
                      placeholder={`Añadir respuesta ${
                        option === 'a'
                          ? 'A'
                          : option === 'b'
                          ? 'B'
                          : option === 'c'
                          ? 'C (opcional)'
                          : 'D (opcional)'
                      }`}
                      onChange={(e) =>
                        handleAskChange(index, option, e.target.value)
                      }
                      onInput={handleAutoResize}
                    />{' '}
                    {ask[option] && (
                      <input
                        className='absolute transition duration-700 ease-in-out  hover:scale-150 right-0 top-1/2 transform -translate-y-1/2 -mt-1 mx-1 h-8 w-8 checkBox'
                        type='checkbox'
                        checked={ask[`isCorrect${option.toUpperCase()}`]}
                        onChange={(e) =>
                          handleCorrectAnswerChange(
                            index,
                            `isCorrect${option.toUpperCase()}`,
                            e.target.checked
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
              <div className='flex flex-col card-title w-full justify-center items-center'>
                <label
                  className='text-sm sm:text-base font-bold uppercase mb-4 rounded-md p-2'
                  htmlFor={`timer-${index}`}
                >
                  Temporizador (segundos):
                </label>
                <Tooltip
                  content='min 3s - max 50s'
                  className='bg-primary p-1 text-black rounded-md text-xs flex flex-col card-title w-full justify-center items-center'
                >
                  <input
                    className='text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-[#fcff00] mb-4 w-20'
                    type='number'
                    id={`timer-${index}`}
                    name={`timer-${index}`}
                    value={ask.timer}
                    onChange={(e) =>
                      handleAskChange(index, 'timer', e.target.value)
                    }
                  />
                </Tooltip>
              </div>
              {/* Renderiza el componente adecuado para eliminar una pregunta dependiendo si es nueva o ya existente */}
              {!ask.id ? (
                <DeleteNewAsk askId={index} onClick={handleRemoveNewQuestion} />
              ) : (
                <DeleteAsk askId={ask.id} onClick={handleRemoveQuestion} />
              )}
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
      <div className='flex justify-center mb-4 mt-4 gap-4'>
        <button
          type='button'
          className='btn-add mt-5 font-bold hoverGradiant bg-custom-linear text-black rounded-md px-4 py-2'
          onClick={handleAddQuestion}
        >
          Añadir Pregunta
        </button>
        <button
          type='submit'
          className='btn-add mt-5 font-bold hoverGradiant bg-custom-linear text-black rounded-md px-4 py-2'
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
