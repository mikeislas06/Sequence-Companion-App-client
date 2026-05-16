import type { PublicTeam, TeamColor } from "@/lib/game-types";

const BORDER: Record<TeamColor, string> = {
	green: "border-team-green",
	blue: "border-team-blue",
	red: "border-team-red",
};
const LABEL: Record<TeamColor, string> = {
	green: "text-team-green",
	blue: "text-team-blue",
	red: "text-team-red",
};
const BTN_BG: Record<TeamColor, string> = {
	green: "bg-team-green",
	blue: "bg-team-blue",
	red: "bg-team-red",
};

interface TeamPanelProps {
	team: PublicTeam;
	myPlayerId: string;
	onJoin: (color: TeamColor) => void;
	disabled?: boolean;
}

export function TeamPanel({ team, myPlayerId, onJoin, disabled }: TeamPanelProps) {
	const isFull = team.maxPlayers > 0 && team.players.length >= team.maxPlayers;
	const amOnTeam = team.players.some((p) => p.id === myPlayerId);

	return (
		<div className={`rounded-xl border-2 ${BORDER[team.color]} p-4 flex flex-col gap-2`}>
			<div className="flex justify-between items-center">
				<span className={`font-display text-sm font-bold uppercase ${LABEL[team.color]}`}>
					{team.color} {isFull ? "🔒" : ""}
				</span>
				<span className="text-text-muted text-xs">
					{team.players.length}/{team.maxPlayers || "∞"}
				</span>
			</div>
			{team.players.map((p) => (
				<div key={p.id} className="text-sm text-text-primary flex items-center gap-2">
					<span className={`w-2 h-2 rounded-full ${BTN_BG[team.color]}`} />
					{p.name}
					{p.id === myPlayerId ? " (you)" : ""}
				</div>
			))}
			{!amOnTeam && !isFull && !disabled && (
				<button
					onClick={() => onJoin(team.color)}
					className={`mt-1 min-h-10 rounded-lg ${BTN_BG[team.color]} text-white text-sm font-semibold`}
				>
					Join
				</button>
			)}
		</div>
	);
}
