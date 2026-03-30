import { useMemo, useState } from "react";
import "../App.css";

function Voting({ rules, players, selfName, secondsLeft, onSubmit, hasSubmitted }) {
	const [assignments, setAssignments] = useState({});
	const [selectedPlayer, setSelectedPlayer] = useState("");

	const availablePlayers = useMemo(
		() => players.filter((playerName) => playerName !== selfName),
		[players, selfName]
	);

	const assignedPlayers = useMemo(() => new Set(Object.values(assignments)), [assignments]);
	const unassignedPlayers = useMemo(
		() => availablePlayers.filter((playerName) => !assignedPlayers.has(playerName)),
		[availablePlayers, assignedPlayers]
	);

	const onDropToRule = (event, rule) => {
		event.preventDefault();
		const draggedPlayer = event.dataTransfer.getData("text/plain");
		if (!availablePlayers.includes(draggedPlayer)) {
			return;
		}

		setAssignments((prev) => {
			const next = { ...prev };
			for (const [existingRule, assignedPlayer] of Object.entries(next)) {
				if (assignedPlayer === draggedPlayer) {
					delete next[existingRule];
				}
			}
			next[rule] = draggedPlayer;
			return next;
		});
	};

	const clearRuleAssignment = (rule) => {
		setAssignments((prev) => {
			const next = { ...prev };
			delete next[rule];
			return next;
		});
	};

	const assignPlayerToRule = (playerName, rule) => {
		if (!availablePlayers.includes(playerName) || hasSubmitted) {
			return;
		}

		setAssignments((prev) => {
			const next = { ...prev };
			for (const [existingRule, assignedPlayer] of Object.entries(next)) {
				if (assignedPlayer === playerName) {
					delete next[existingRule];
				}
			}
			next[rule] = playerName;
			return next;
		});
		setSelectedPlayer("");
	};

	const submit = () => {
		onSubmit(assignments);
	};

	return (
		<div className="voting_view">
			<div className="phase_timer">{secondsLeft}s</div>
			<h2>Voting Phase</h2>
			<p>Drag each player to a rule, or tap a player then tap a rule on mobile</p>

			<div className="voting_grid">
				<div className="voting_players_column">
					<h3>Players</h3>
					<ul className="player_pool">
						{unassignedPlayers.map((playerName) => (
							<li
								key={playerName}
								className={`draggable_player ${selectedPlayer === playerName ? "selected_player" : ""}`}
								draggable={!hasSubmitted}
								onDragStart={(event) => event.dataTransfer.setData("text/plain", playerName)}
								onClick={() => setSelectedPlayer((prev) => (prev === playerName ? "" : playerName))}
							>
								{playerName}
							</li>
						))}
					</ul>
				</div>

				<div className="voting_rules_column">
					<h3>Rules</h3>
					<div className="rules_drop_list">
						{rules.map((rule, index) => (
							<div
								key={`${rule}-${index}`}
								className={`rule_drop_row ${selectedPlayer ? "rule_drop_target" : ""}`}
								onDragOver={(event) => event.preventDefault()}
								onDrop={(event) => onDropToRule(event, rule)}
								onClick={() => selectedPlayer && assignPlayerToRule(selectedPlayer, rule)}
							>
								<div className="rule_text">{rule}</div>
								<button
									type="button"
									className="assigned_name"
									disabled={!assignments[rule] || hasSubmitted}
									onClick={() => clearRuleAssignment(rule)}
								>
									{assignments[rule] || "Drop a player name here"}
								</button>
							</div>
						))}
					</div>
				</div>
			</div>

			<button className="primary_button" onClick={submit} disabled={hasSubmitted}>
				{hasSubmitted ? "Votes Submitted" : "Submit Votes"}
			</button>
		</div>
	);
}

export default Voting;
