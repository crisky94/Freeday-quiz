import { useEffect } from 'react';

const usePlayerSocket = ({ socket, fetchAvatar, setPlayers, setCountdown }) => {
  useEffect(() => {
    if (!socket) return;

    const handleNewPlayer = async (newPlayer) => {
      const avatar = await fetchAvatar(newPlayer.playerName);
      setPlayers((prevPlayers) => [...prevPlayers, { ...newPlayer, avatar }]);
    };

    const handleExitPlayer = (removedPlayerId) => {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== removedPlayerId)
      );
    };

    const handleUpdatePlayer = async (updatedPlayer) => {
      const avatar = await fetchAvatar(updatedPlayer.playerName);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === updatedPlayer.id ? { ...updatedPlayer, avatar } : player
        )
      );
    };

    const handleGameStarted = () => {
      setCountdown(true);
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
  }, [socket, fetchAvatar, setPlayers, setCountdown]);
};

export default usePlayerSocket;
