import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();
const SERVER_URL = 'https://surroundedtwo-a4ca20ef21f0.herokuapp.com' || 'http://localhost:3001';

export const useGameContext = () => {
  return useContext(GameContext);
};

export const GameProvider = ({ children }) => {

  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState([]);
  const [socket] = useState(() => io(SERVER_URL));

  useEffect(() => {
    const onConnect = () => {
      if (room && name) {
        socket.emit('join_room', room, name);
      }
    };

    socket.on('connect', onConnect);
    return () => {
      socket.off('connect', onConnect);
    };
  }, [socket, room, name]);

  const logout = () => {
    localStorage.removeItem('name');
    localStorage.removeItem('room');
    window.location.reload();
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        room, setRoom,
        name, setName,
        isAdmin, setIsAdmin,
        players, setPlayers,
        logout
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
export default GameContext;
