import "../App.css";

function Buffer({ rules, hotSeat, secondsLeft, myRule }) {
	return (
		<div className="buffer_view">
			<div className="phase_timer">{secondsLeft}s</div>
			<h2>Next Hot Seat: {hotSeat || "Waiting..."}</h2>
            <div className="my_rule_card">
              <h3>Your Rule:</h3>
              <p>{myRule || "Waiting for your assigned rule..."}</p>
            </div>
			<h3 className="potential-rules">Potential Rules ({rules.length})</h3>
			<ol className="buffer_rules">
				{rules.map((rule, index) => (
					<li key={`${rule}-${index}`}>{rule}</li>
				))}
			</ol>
		</div>
	);
}

export default Buffer;
