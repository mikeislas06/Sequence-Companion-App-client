import type { TeamColor } from "@/lib/game-types";

const GLOW: Record<TeamColor, string> = {
	green: "shadow-[0_0_0_3px_#4CAF50]",
	blue: "shadow-[0_0_0_3px_#2196F3]",
	red: "shadow-[0_0_0_3px_#F44336]",
};
const DOT: Record<TeamColor, string> = {
	green: "bg-team-green",
	blue: "bg-team-blue",
	red: "bg-team-red",
};
const TEXT: Record<TeamColor, string> = {
	green: "text-team-green",
	blue: "text-team-blue",
	red: "text-team-red",
};

interface TurnIndicatorProps {
	playerName: string;
	teamColor: TeamColor;
	isMyTurn: boolean;
}

export function TurnIndicator({ playerName, teamColor, isMyTurn }: TurnIndicatorProps) {
	return (
		<div
			className={`rounded-xl p-3 bg-surface-dark flex items-center gap-3 transition-shadow ${isMyTurn ? `animate-pulse-glow ${GLOW[teamColor]}` : ""}`}
		>
			<span className={`w-3 h-3 rounded-full shrink-0 ${DOT[teamColor]}`} />
			<div>
				<p className={`font-semibold text-sm ${TEXT[teamColor]}`}>{playerName}</p>
				<p className="text-text-muted text-xs">{isMyTurn ? "Your turn!" : "Playing..."}</p>
			</div>
		</div>
	);
}
