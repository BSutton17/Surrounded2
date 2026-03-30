import "../App.css";

function Podium({ scores }) {
	const ranked = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);

	return (
		<div className="podium_view">
			<h2>Final Podium</h2>
			<div className="podium_grid">
				{ranked.map(([playerName, points], index) => (
					<div key={playerName} className={`podium_card podium_${index + 1}`}>
						<div className="podium_place">#{index + 1}</div>
						<div className="podium_name">{playerName}</div>
						<div className="podium_points">{Number(points).toFixed(1)} pts</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default Podium;
