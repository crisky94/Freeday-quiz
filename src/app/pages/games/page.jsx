'use client';
import { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Link from 'next/link';
import { useSocket } from '@/context/socketContext';
import { useAuth } from '../../../context/authContext';
import DeleteConfirmation from '@/app/components/DeleteGame';
import CreateButton from '@/app/components/CreateButton';
import CustomDot from '../../components/CustomDot';
import User from '../../components/User';
import DemoPreview from '@/app/components/DemoPreview';
import '../../styles/games/deleteGame.css';
import '../../styles/games/editButtonGames.css';
import '../../styles/games/ListCard.css';

export default function GamesList() {
  const [games, setGames] = useState([]);// Estado para almacenar la lista de juegos.// Estado para almacenar la lista de juegos.
  const [error, setError] = useState();// Estado para manejar posibles errores.
  const [nickname, setNickname] = useState('');// Estado para almacenar el apodo del jugador.
  const [nickUser, setNickUser] = useState('');// Estado para almacenar el nombre del usuario creador.
  const { user } = useAuth(User);// Obtiene el usuario autenticado del contexto de autenticación.
  const socket = useSocket(); // Obtiene la instancia del socket desde el contexto.
  const [hoveredQuestions, setHoveredQuestions] = useState({});// Estado para manejar las preguntas que se muestran en la vista previa.

  useEffect(() => {

    if (user) {
      setNickUser(`${user.firstName} ${user.lastName}`);
    }

    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    }
  }, [games, nickname]);

  useEffect(() => {
    const fetchData = async () => {
      // Usuario autenticado emite un evento al servidor para obtener la lista de juegos del usuario.
      if (nickUser) {
        socket.emit('getGames', { user: nickUser }, (response) => {
          if (response.error) {
            setError(response.error);
          } else {
            setGames(response.games);
          }
        });
      }
    };

    fetchData();
  }, [nickUser, socket]);

  // Maneja la eliminación de un juego.
  const handleDelete = async (gameId) => {
    socket.emit('deleteGame', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        console.log('Juego eliminado exitosamente');
      }
    });
  };

  //  Maneja el evento cuando el usuario pasa el ratón sobre vista previa.
  const handleMouseEnter = async (gameId) => {
    socket.emit('getGameDetails', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        const firstQuestion = response.game.asks[0];
        const timeLeft = firstQuestion.timer * 1000; // Convertir a milisegundos
        setHoveredQuestions((prev) => ({
          ...prev,
          [gameId]: { question: firstQuestion, timeLeft },
        }));
      }
    });
  };

  // Maneja el evento cuando el usuario retira el ratón sobre vista previa.
  const handleMouseLeave = (gameId) => {
    setHoveredQuestions((prev) => {
      const updated = { ...prev };
      delete updated[gameId];
      return updated;
    });
  };

  // Configuración del carrusel para diferentes tamaños de pantalla.
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  // Función para formatear la fecha en el formato "DD-MM-YYYY".
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Los meses en JavaScript son 0-indexados
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <>
      {user ? (
        <div className='min-h-screen p-2 md:p-16 lg:p-16  '>
          {games.length > 0 ? (
            <>
              <div className='mt-10'>
                <CreateButton />
              </div>
              <Carousel
                responsive={responsive}
                customDot={<CustomDot />}
                swipeable={true}
                arrows={true}
                keyBoardControl={true}
                removeArrowOnDeviceType={['tablet', 'mobile']}
                draggable={true}
                showDots={true}
              >
                {games.map((game, i) => (
                  <div
                    key={game.id}
                    className='card m-1 w-auto rounded-md min-h-72 justify-center items-center text-center mt-10 sm:mt-20 shadow-xl p-1 transition-all'
                  >
                    <div className='flex  flex-col flex-wrap card2 text-white min-h-72 items-center justify-center md:gap-2 md:min-w-40 bg-[#111] w-auto'>
                      <h2 className='truncate  card-title font-bold text-xl text-center justify-center uppercase border-b border-b-white w-full'>
                        {`${i + 1}. ${game.nameGame}`}
                      </h2>
                      <div className='flex flex-row card-actions justify-center items-center text-center mt-4 gap-2 sm:gap-4'>
                        <Link href={`/pages/modify-page/${game.id}.jsx`}>
                          <button className='edit-button'>
                            <svg className='edit-svgIcon' viewBox='0 0 512 512'>
                              <path d='M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z'></path>
                            </svg>
                          </button>
                        </Link>
                        <DeleteConfirmation
                          gameId={game.id}
                          onDelete={handleDelete}
                        />
                      </div>

                      <Link
                        className='mt-5 hoverGradiant bg-custom-linear w-44 p-2 rounded-md text-black uppercase'
                        href={`/pages/pinPage/${game.id}`}
                      >
                        <span>Seleccionar</span>
                      </Link>
                      {/* Mostrar la fecha de finalización del juego */}
                      {game.updateAt ? (
                        <p className='text-sm'>
                          Actualizado: {formatDate(game.updateAt)}
                        </p>
                      ) : (
                        <p className='text-sm'>
                          Creado: {formatDate(game.endedAt)}
                        </p>
                      )}
                      <div
                        className=' w-44 bottom-7 absolute transition duration-700 ease-in-out transform hover:scale-105  cursor-zoom-in p-1 text-xs text-black'
                        onMouseEnter={() => handleMouseEnter(game.id)}
                        onMouseLeave={() => handleMouseLeave(game.id)}
                      >
                        <p className='rounded-md w-full  bg-primary'>
                          Vista previa{' '}
                        </p>
                        {hoveredQuestions[game.id] && (
                          <div className='bg-transparent '>
                            <DemoPreview
                              question={hoveredQuestions[game.id].question}
                              timeLeft={hoveredQuestions[game.id].timeLeft}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </>
          ) : (
            <div className='flex flex-col justify-center items-center w-full h-full min-h-full'>
              <div className='mt-16 mb-4'>
                <CreateButton />
              </div>
              <h1 className='font-bold  bg-[#111] text-[#fed500]'>
                Aún no tienes juegos creados
              </h1>
            </div>
          )}
        </div>
      ) : (
        <h1 className='pt-16 break-words text-center justify-center h-full text-[#fed500] bg-[#111]'>
          Página no autorizada para jugadores, inicia sesión o registrate para
          que puedas ver tus juegos creados o poder crearlos{' '}
        </h1>
      )}
    </>
  );
}
