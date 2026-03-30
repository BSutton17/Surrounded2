import "./App.css";
import { useEffect, useState } from "react";
import WaitingRoom from "./WaitingRoom";
import { useGameContext } from "./Contex";
import Buffer from "./Components/Buffer";
import Voting from "./Components/Voting";
import Reveal from "./Components/Reveal";
import Leaderboard from "./Components/Leaderboard";
import Podium from "./Components/Podium";
import { PiNotepadBold } from "react-icons/pi";

function useCountdown(endsAt) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!endsAt) {
      setSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const diffMs = Math.max(0, endsAt - Date.now());
      setSecondsLeft(Math.ceil(diffMs / 1000));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 250);
    return () => clearInterval(timer);
  }, [endsAt]);

  return secondsLeft;
}

function App() {
  const [displayGame, setDisplayGame] = useState(false);
  const [myRule, setMyRule] = useState("");
  const [phase, setPhase] = useState("");
  const [hotSeat, setHotSeat] = useState("");
  const [potentialRules, setPotentialRules] = useState([]);
  const [revealAssignments, setRevealAssignments] = useState([]);
  const [scores, setScores] = useState({});
  const [roundNumber, setRoundNumber] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [hasSubmittedVotes, setHasSubmittedVotes] = useState(false);
  const [phaseEndsAt, setPhaseEndsAt] = useState(0);
  const { socket, name, room, isAdmin, players, setPlayers, notepadContent, setNotepadContent, notepadOpen, setNotepadOpen } = useGameContext();
  const secondsLeft = useCountdown(phaseEndsAt);
  // Remove local showNotepad, use context

  useEffect(() => {
    socket.on("updatePlayerList", (playerList) => {
      setPlayers([...playerList]);
    });

    socket.on("gameStarted", () => {
      setDisplayGame(true);
    });

    socket.on("game_data", (payload) => {
      const personalRule = payload?.playerRules?.[name] || "";
      setMyRule(personalRule);
      setPotentialRules(Array.isArray(payload?.potentialRules) ? payload.potentialRules : []);
      setScores(payload?.scores || {});
      setDisplayGame(true);
    });

    socket.on("turn_phase", (payload) => {
      const nextPhase = payload?.phase || "";
      setPhase(nextPhase);
      setHotSeat(payload?.hotSeat || "");
      setPotentialRules(Array.isArray(payload?.potentialRules) ? payload.potentialRules : []);
      setRevealAssignments(Array.isArray(payload?.revealAssignments) ? payload.revealAssignments : []);
      setScores(payload?.scores || {});
      setRoundNumber(payload?.roundNumber || 0);
      setTotalRounds(payload?.totalRounds || 5);
      setPhaseEndsAt(payload?.endsAt || 0);
      if (nextPhase === "voting") {
        setHasSubmittedVotes(false);
      }
      setDisplayGame(true);
    });

    socket.on("game_error", (message) => {
      alert(message || "Game error");
    });

    // Register listeners first, then join to avoid missing the first player list emit.
    socket.emit("join_room", room, name, (response) => {
      if (Array.isArray(response?.players)) {
        setPlayers([...response.players]);
      }
    });

    socket.on("reset_game", () => {
      setPhase("");
      setHotSeat("");
      setPotentialRules([]);
      setRevealAssignments([]);
      setScores({});
      setRoundNumber(0);
      setTotalRounds(5);
      setHasSubmittedVotes(false);
      setPhaseEndsAt(0);
      setDisplayGame(true); 
    });

    return () => {
      socket.off("updatePlayerList");
      socket.off("gameStarted");
      socket.off("game_data");
      socket.off("turn_phase");
      socket.off("game_error");
      socket.off("reset_game");
    };
  }, [room, name, socket, setPlayers]);

  const startGame = () => {
    if (isAdmin) {
      socket.emit("startGame", room);
    }
  };

  const submitVotes = (assignments) => {
    if (hasSubmittedVotes) {
      return;
    }
    socket.emit("submit_votes", room, assignments);
    setHasSubmittedVotes(true);
  };

  const markQuestionAnswered = () => {
    socket.emit("question_answered", room);
  };

  const playerNames = players.map((player) => player.name);

  return (
    <>
      {!displayGame ? (
          <WaitingRoom startGame={startGame} />
      ) : <>
        {phase === "buffer" ? (
          <Buffer
            rules={potentialRules}
            hotSeat={hotSeat}
            secondsLeft={secondsLeft}
            myRule={myRule}
          />
        ) : phase === "hotseat" ? (
          <div className="hot_seat_view">
            <button className="notepad" onClick={() => setNotepadOpen(!notepadOpen)}>
              <PiNotepadBold />
            </button>
            {notepadOpen && (
              <div className="notepad_view">
                <textarea
                  placeholder="Write your notes here..."
                  value={notepadContent}
                  onChange={(e) => setNotepadContent(e.target.value)}
                ></textarea>
              </div>
            )}
            <div className="phase_timer">{secondsLeft}s</div>
            <p>Round {roundNumber}/{totalRounds}</p>
            <h2>Hot Seat: {hotSeat || "Waiting..."}</h2>
            <div className="my_rule_card">
              <h3>Your Rule:</h3>
              <p>{myRule || "Waiting for your assigned rule..."}</p>
            </div>
            {isAdmin && (
              <button className="primary_button" onClick={markQuestionAnswered}>
                Question Answered (+0.5)
              </button>
            )}
          </div>
        ) : phase === "voting" ? (
          <>
          <button className="notepad" onClick={() => setNotepadOpen(!notepadOpen)}>
              <PiNotepadBold />
            </button>
            {notepadOpen && (
              <div className="notepad_view">
                <textarea
                  placeholder="Write your notes here..."
                  value={notepadContent}
                  onChange={(e) => setNotepadContent(e.target.value)}
                ></textarea>
              </div>
            )}
          <Voting
            rules={potentialRules}
            players={playerNames}
            selfName={name}
            secondsLeft={secondsLeft}
            onSubmit={submitVotes}
            hasSubmitted={hasSubmittedVotes}
          />
          </>
        ) : phase === "reveal" ? (
          <Reveal assignments={revealAssignments} secondsLeft={secondsLeft} />
        ) : phase === "leaderboard" ? (
          <Leaderboard scores={scores} secondsLeft={secondsLeft} />
        ) : phase === "podium" ? (
          <Podium scores={scores} />
        ) : (
          <div className="hot_seat_view">
            <h2>Waiting for game state...</h2>
          </div>
        )}
    </>}
    </>
  );
}

export default App;