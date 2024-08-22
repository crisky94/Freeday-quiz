import { useEffect } from 'react';

const usePlayerSocket = ({ socket, setPlayers, setCountdown = null }) => {
  useEffect(() => {
    if (!socket) return;

    const handleNewPlayer = (newPlayer) => {
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
    };

    const handleExitPlayer = (removedPlayerId) => {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== removedPlayerId)
      );
    };

    const handleUpdatePlayer = (updatedPlayer) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === updatedPlayer.id ? updatedPlayer : player
        )
      );
    };

    const handleGameStarted = () => {
      if (setCountdown) setCountdown(true);
    };

    socket.on('gameStarted', handleGameStarted);
    socket.on('updatePlayer', handleUpdatePlayer);
    socket.on('newPlayer', handleNewPlayer);
    socket.on('exitPlayer', handleExitPlayer);

    return () => {
      socket.off('gameStarted', handleGameStarted);
      socket.off('newPlayer', handleNewPlayer);
      socket.off('exitPlayer', handleExitPlayer);
      socket.off('updatePlayer', handleUpdatePlayer);
    };
  }, [socket, setPlayers, setCountdown]);
};

export default usePlayerSocket;
