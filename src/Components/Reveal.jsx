import "../App.css";

function Reveal({ assignments, secondsLeft }) {
	return (
		<div className="reveal_view">
			<div className="phase_timer">{secondsLeft}s</div>
			<h2>Rule Reveal</h2>
			<div className="reveal_list">
				{assignments.map((entry) => (
					<div className="reveal_row" key={`${entry.player}-${entry.rule}`}>
						<strong>{entry.player}</strong>
						<span>{entry.rule}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default Reveal;
