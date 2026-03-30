import "../App.css";

function Leaderboard({ scores, secondsLeft }) {
	const rows = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);

	return (
		<div className="leaderboard_view">
			<div className="phase_timer">{secondsLeft}s</div>
			<h2>Leaderboard</h2>
			<ol className="leaderboard_list">
				{rows.map(([playerName, points]) => (
					<li key={playerName} className="leaderboard_row">
						<span>{playerName}</span>
						<strong>{Number(points).toFixed(1)} pts</strong>
					</li>
				))}
			</ol>
		</div>
	);
}

export default Leaderboard;
