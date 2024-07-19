'use client';
import { useEffect, useState } from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Link from 'next/link';

import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/authContext';
import CreateButton from '@/app/components/CreateButton';
import DeleteConfirmation from '../../components/DeleteGame';
import CustomDot from '../../components/CustomDot';
import User from '../../components/User';


import '../../styles/games/deleteGame.css'
import '../../styles/games/editButtonGames.css'
import '../../styles/games/ListCard.css'

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState();
  const [nickname, setNickname] = useState('');
  const [nickUser, setNickUser] = useState('');
  const { user } = useAuth(User);
  const socket = useSocket();
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
      if (nickUser) {
        console.log(nickUser);
        socket.emit('getGames', { user: nickUser }, (response) => {
          console.log(response);
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

  // const handleClick = () => {
  //   window.location.reload();
  // }

  const handleDelete = async (gameId) => {
    socket.emit('deleteGame', { gameId }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        console.log('Juego eliminado exitosamente');
      }
    });
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 6000, min: 3000 },
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
    }
  };

  return (
    <>
      {
        user ? (
          <div className=" min-h-screen pt-16 ">
            <div className='mt-16'>
              <CreateButton />
            </div>
            {games.length > 0 ? (
              <Carousel
                responsive={responsive}
                removeArrowOnDeviceType={["tablet", "mobile"]}
                containerClass="carousel-container"
                itemClass="carousel-item"
                dotListClass="custom-dot-list"
                customDot={<CustomDot />}
                arrows
                swipeable
                draggable
                showDots
              >
                {games.map((game, i) => (
                  <div
                    key={game.id}
                    className=" card w-full rounded-md sm:p-2 min-h-72 justify-center items-center text-center mt-10 sm:mt-20 shadow-xl transition-all mx-10 sm:mx-12"
                  >
                    <div className="card2 p-6 text-white min-h-72  ">
                      <h2 className="card-title font-bold text-sm sm:text-base uppercase p-6 ">
                        {i + 1}. {game.nameGame}
                      </h2>
                      <div className="flex flex-row card-actions justify-center items-center text-center mt-4 gap-2 sm:gap-4">
                        <Link href={`/pages/modify-page/${game.id}.jsx`}>
                          <button className="edit-button">
                            <svg className="edit-svgIcon" viewBox="0 0 512 512">
                              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                            </svg>
                          </button>
                        </Link>
                        <DeleteConfirmation gameId={game.id} onDelete={handleDelete} />
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="flex flex-col justify-center items-center text-center w-full h-full">
                <h1 className="font-medium">Aún no tienes juegos creados</h1>
              </div>
            )}
          </div>
        ) : ''
      }


    </>
  );
}

