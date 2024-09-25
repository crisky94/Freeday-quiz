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
              image: question.image || null,
            })),
          }));
        }
      });

      socket.emit('getGamesId', { gameId }, (response) => {
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

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);

      setFormData((prevData) => {
        const newAsks = [...prevData.asks];
        newAsks[index] = {
          ...newAsks[index],
          previewImage: imageUrl,
          selectedFile: file,
          image: imageUrl // Asegúrate de que `image` se actualice aquí si es necesario
        };
        return {
          ...prevData,
          asks: newAsks
        };
      });
    } else {
      toast.error('Selecciona un archivo de imagen válido.');
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        throw new Error('Error al subir imagen.');
      }
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleDeleteImg = (e, index) => {
    e.preventDefault();

    setFormData((prevData) => {
      const newAsks = [...prevData.asks];
      newAsks[index].image = null; // Elimina la imagen
      newAsks[index].previewImage = null; // Elimina el archivo     
      return { ...prevData, asks: newAsks };
    });

  };

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

  const handleAddQuestion = () => {
    setFormData((prevData) => ({
      ...prevData,
      asks: [
        ...prevData.asks,
        { ask: '', a: '', b: '', c: '', d: '', answer: '', timer: 5, image: null, previewImage: null, selectedFile: null },
      ],
    }));
  };

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


  const handleRemoveNewQuestion = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      asks: prevData.asks.filter((_, i) => i !== index),
    }));
  };

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
        toast.error(`Las respuestas A y B para la pregunta ${index + 1} son requeridas.`);
        hasErrors = true;
      }
      if (!ask.isCorrectA && !ask.isCorrectB && !ask.isCorrectC && !ask.isCorrectD) {
        toast.error(`Selecciona al menos una respuesta correcta para la pregunta ${index + 1}.`);
        hasErrors = true;
      }
      if (ask.timer < 3 || ask.timer > 50) {
        toast.error('El temporizador tiene que ser mínimo 3s y máximo 50s.');
        hasErrors = true;
      }
    });

    return hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasErrors = validateForm();
    if (hasErrors) {
      return;
    }

    // Sube las imágenes si es necesario
    const asksWithImages = await Promise.all(
      formData.asks.map(async (ask) => {
        if (ask.selectedFile) {
          try {
            const imageUrl = await uploadImage(ask.selectedFile);
            return { ...ask, image: imageUrl };
          } catch (error) {
            console.log(error);

          }
        }
        return ask;
      })
    );

    const updatedFormData = {
      ...formData,
      asks: asksWithImages,
    };

    socket.emit('updateGame', { formData: updatedFormData, gameId }, (response) => {
      if (response.success) {
        toast('Juego actualizado con éxito. Redirigiendo a inicio.', {
          position: 'bottom-center',
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Flip,
          onClose: () => {
            router.push('/');
          }
        });

      } else {
        toast.error(response.error, {
          position: 'bottom-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Flip,
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
      className='flex flex-col items-center w-full  max-w-3xl mx-auto p-4 min-h-screen pt-16'
      onSubmit={(e) => { handleSubmit(e) }}
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
              <div key={index} className='w-full h-80 my-2 rounded-md  flex justify-center items-center'>
                <div className='flex flex-col items-center rounded-md justify-center drop w-96 h-full'>
                  {ask.image || ask.previewImage ? (
                    <div key={index} className='h-full relative w-full'>
                      <img
                        width={100}
                        height={100}
                        id={`${index + 1}`}
                        src={ask.image || ask.previewImage}
                        alt='Preview'
                        className=' w-80 h-72 object-fit  bg-center rounded-md'
                      />
                      <button
                        className='button absolute bottom-11 left-5 '
                        onClick={(e) => { handleDeleteImg(e, index) }}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 69 14'
                          className='svgIcon bin-top'
                        >
                          <g clipPath='url(#clip0_35_24)'>
                            <path
                              fill='black'
                              d='M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z'
                            ></path>
                          </g>
                          <defs>
                            <clipPath id='clip0_35_24'>
                              <rect fill='white' height='14' width='60'></rect>
                            </clipPath>
                          </defs>
                        </svg>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 69 57'
                          className='svgIcon bin-bottom'
                        >
                          <g clipPath='url(#clip0_35_22)'>
                            <path
                              fill='black'
                              d='M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z'
                            ></path>
                          </g>
                          <defs>
                            <clipPath id='clip0_35_22'>
                              <rect fill='white' height='57' width='79'></rect>
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // Si ya hay una imagen cargada, mostrarla como vista previa

                    // Si no hay imagen cargada, mostrar el mensaje y el botón
                    <>
                      <p className='text-white font-bold'>Selecciona una imagen</p>
                      <button
                        title='Add New'
                        type='button'
                        className='group cursor-pointer outline-none hover:rotate-90 duration-300'
                        onClick={() => document.getElementById(`imageInput${index}`).click()} // Simular el click en el input oculto
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='50px'
                          height='50px'
                          viewBox='0 0 24 24'
                          className='stroke-lime-400 fill-none group-hover:fill-lime-800 group-active:stroke-lime-200 group-active:fill-lime-600 group-active:duration-0 duration-300'
                        >
                          <path
                            d='M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z'
                            strokeWidth='1.5'
                          ></path>
                          <path d='M8 12H16' strokeWidth='1.5'></path>
                          <path d='M12 16V8' strokeWidth='1.5'></path>
                        </svg>
                      </button>

                      {/* Input de tipo file oculto */}
                    </>
                  )}
                  <input
                    id={`imageInput${index}`}
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleImageChange(e, index)}
                    className='hidden' // Escondemos el input
                  />
                </div>
              </div>

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
                      className={`${option === 'a'
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
                      placeholder={`Añadir respuesta ${option === 'a'
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
