import { useGameContext } from "./Contex";

function WaitingRoom({ startGame }) {
  const { room, players, isAdmin } = useGameContext();
 return (
    <div className="waiting_room">
      {isAdmin ? (
        <h1>Game Code: {room}</h1>
      ) : (
        <h1>Waiting for Players</h1>
      )}
      <ul>
        {players.map((player, index) => (
          <li className="playerList" key={player.socketId || index}>{player.name}</li>
        ))}
      </ul>

      {isAdmin && (
        <button onClick={startGame} className="start-button">
          Start Game
        </button>
      )}
    </div>
  );
}

export default WaitingRoom; 