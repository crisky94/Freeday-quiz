"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import QRCode from "qrcode.react";

let socket;

const GamePage = () => {
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [game, setGame] = useState(null);

  const params = useParams();
  const gameId = params.gameId;

  useEffect(() => {
    socket = io();

    socket.emit("joinGame", { gameId: parseInt(gameId, 10) }, (response) => {
      if (response.error) {
        console.error(response.error);
      }
    });

    socket.on("playerList", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.emit("getGamesId", { gameId: parseInt(gameId, 10) }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        setGame(response.game);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  const startGame = () => {
    console.log("Juego iniciado");
  };

  if (!game) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>{game.nameGame}</h1>
      <p>{game.detailGame}</p>
      <QRCode value={`http://localhost:3000/game/${gameId}`} />
      <p>PIN: {game.codeGame}</p>
      <button onClick={startGame}>Empezar Juego</button>
      <button onClick={() => setShowModal(true)}>Ver Jugadores</button>

      {showModal && (
        <div className="modal">
          <h2>Jugadores</h2>
          <ul>
            {players.map((player) => (
              <li key={player.socketId}>{player.playerName}</li>
            ))}
          </ul>
          <button onClick={() => setShowModal(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
