import type { PublicRoom, TeamColor } from "@/lib/game-types";

const LABELS: Record<TeamColor, string> = {
	green: "Green Team",
	blue: "Blue Team",
	red: "Red Team",
};
const COLORS: Record<TeamColor, string> = {
	green: "text-team-green",
	blue: "text-team-blue",
	red: "text-team-red",
};
const BORDERS: Record<TeamColor, string> = {
	green: "border-team-green",
	blue: "border-team-blue",
	red: "border-team-red",
};

interface ResultBoardProps {
	winner: TeamColor;
	room: PublicRoom;
}

export function ResultBoard({ winner, room }: ResultBoardProps) {
	const activeColors: TeamColor[] =
		room.config.teamCount === 2 ? ["green", "blue"] : ["green", "blue", "red"];

	return (
		<div className="flex flex-col items-center gap-6 w-full">
			<span className="text-7xl">🏆</span>
			<h1 className={`font-display text-4xl text-center ${COLORS[winner]}`}>
				{LABELS[winner]} Wins!
			</h1>

			<div className="w-full flex flex-col gap-3">
				{activeColors.map((color) => {
					const team = room.teams[color];
					const sequences = room.sequences?.[color] ?? 0;
					const isWinner = color === winner;

					return (
						<div
							key={color}
							className={`rounded-xl border-2 ${BORDERS[color]} p-4 ${isWinner ? "bg-board-green-light/40" : ""}`}
						>
							<div className="flex justify-between items-center mb-2">
								<span className={`font-display text-sm font-bold uppercase ${COLORS[color]}`}>
									{LABELS[color]} {isWinner ? "🏆" : ""}
								</span>
								<span className={`font-display text-xl font-bold ${COLORS[color]}`}>
									{sequences} {sequences === 1 ? "sequence" : "sequences"}
								</span>
							</div>
							<div className="flex flex-col gap-0.5">
								{team.players.map((p) => (
									<span key={p.id} className="text-text-muted text-sm">
										{p.name}
									</span>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
