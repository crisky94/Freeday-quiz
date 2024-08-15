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
import GameRankings from '@/app/components/RankingsModal';
export default function GamesList() {
  const [games, setGames] = useState([]); // Estado para almacenar la lista de juegos.// Estado para almacenar la lista de juegos.
  const [error, setError] = useState(); // Estado para manejar posibles errores.
  const [nickname, setNickname] = useState(''); // Estado para almacenar el apodo del jugador.
  const [nickUser, setNickUser] = useState(''); // Estado para almacenar el nombre del usuario creador.
  const { user } = useAuth(User); // Obtiene el usuario autenticado del contexto de autenticación.
  const socket = useSocket(); // Obtiene la instancia del socket desde el contexto.
  const [hoveredQuestions, setHoveredQuestions] = useState({}); // Estado para manejar las preguntas que se muestran en la vista previa.

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
            console.log(error);
          } else {
            setGames(response.games);
            console.log(response.games + 'hola');
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
    <section>
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
                    <div className='flex flex-col flex-wrap card2 text-white min-h-72 items-center justify-center md:gap-2 md:min-w-40 bg-[#111] w-auto'>
                      <h2 className='truncate card-title font-bold text-xl text-center justify-center uppercase border-b border-b-white w-full'>
                        {`${i + 1}. ${game.nameGame}`}
                      </h2>
                      {/* Mostrar la fecha de finalización del juego */}
                      {game.updateAt ? (
                        <p className='text-xs '>
                          Actualizado: {formatDate(game.updateAt)}
                        </p>
                      ) : (
                        <p className='text-xs'>
                          Creado: {formatDate(game.endedAt)}
                        </p>
                      )}
                      {/* Botón para abrir el modal de rankings */}
                      <div className='mt-1'>
                        <GameRankings gameId={game.id} />
                      </div>

                      <div className='flex flex-row card-actions justify-center items-center text-center mt-4 gap-2 sm:gap-4'>
                        <Link href={`/pages/modify-page/${game.id}.jsx`}>
                          <button className='edit-button'>
                            {/* Icono de edición */}
                          </button>
                        </Link>
                        <DeleteConfirmation
                          gameId={game.id}
                          onDelete={handleDelete}
                        />
                      </div>

                      <Link
                        className='mt-2 hoverGradiant bg-custom-linear w-44 p-1 rounded-md text-black uppercase'
                        href={`/pages/pinPage/${game.id}`}
                      >
                        <span>Seleccionar</span>
                      </Link>

                      <div
                        className='w-44 bottom-4 absolute transition duration-700 ease-in-out transform hover:scale-105 cursor-zoom-in p-1 text-xs text-black'
                        onMouseEnter={() => handleMouseEnter(game.id)}
                        onMouseLeave={() => handleMouseLeave(game.id)}
                      >
                        <p className='rounded-md w-full bg-primary'>
                          Vista previa
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
    </section>
  );
}
