import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();
const SERVER_URL = 'https://surroundedtwo-a4ca20ef21f0.herokuapp.com' || 'http://localhost:3001';

export const useGameContext = () => {
  return useContext(GameContext);
};

const getNotepadStorageKey = (roomId, playerName) => {
  return `surrounded2:notepad:${roomId.trim().toLowerCase()}:${playerName.trim().toLowerCase()}`;
};

export const GameProvider = ({ children }) => {

  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState([]);
  const [socket] = useState(() => io(SERVER_URL));
  const [notepadContent, setNotepadContent] = useState('');
  const [notepadOpen, setNotepadOpen] = useState(false); // track open state


  // Load notes from storage every time notepad is opened
  useEffect(() => {
    if (notepadOpen && room && name) {
      const storageKey = getNotepadStorageKey(room, name);
      const savedNotes = localStorage.getItem(storageKey);
      setNotepadContent(savedNotes || '');
      console.log('[Notepad] Loaded from storage:', savedNotes);
    }
  }, [notepadOpen, room, name]);

  useEffect(() => {
    if (!room || !name) return;
    const storageKey = getNotepadStorageKey(room, name);
    localStorage.setItem(storageKey, notepadContent);
    console.log('[Notepad] Saved to storage:', notepadContent);
  }, [room, name, notepadContent]);

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
        notepadContent, setNotepadContent,
        notepadOpen, setNotepadOpen,
        logout
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
export default GameContext;
