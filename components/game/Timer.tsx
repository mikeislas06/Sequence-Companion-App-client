interface TimerProps {
	remaining: number;
	total: number;
}

export function Timer({ remaining, total }: TimerProps) {
	if (total === 0) return null;
	const pct = remaining / total;
	const color = pct > 0.25 ? "text-text-primary" : pct > 0.08 ? "text-yellow-400" : "text-danger";
	const mins = Math.floor(remaining / 60)
		.toString()
		.padStart(2, "0");
	const secs = (remaining % 60).toString().padStart(2, "0");
	return (
		<div className="flex items-center gap-1">
			<span className="text-text-muted text-xs">⏱</span>
			<span className={`font-display text-lg tabular-nums ${color}`}>
				{mins}:{secs}
			</span>
		</div>
	);
}
