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
const BG_LIGHT: Record<TeamColor, string> = {
	green: "bg-team-green/10",
	blue: "bg-team-blue/10",
	red: "bg-team-red/10",
};
const RING: Record<TeamColor, string> = {
	green: "ring-team-green",
	blue: "ring-team-blue",
	red: "ring-team-red",
};
const TEAM_LABEL: Record<TeamColor, string> = {
	green: "Green Team",
	blue: "Blue Team",
	red: "Red Team",
};

interface TeamPanelProps {
	team: PublicTeam;
	myPlayerId: string;
	hostId: string;
	onJoin: (color: TeamColor) => void;
	disabled?: boolean;
	// Manual starting-player selection (host only). When selectable, player rows
	// become tappable to choose the starter; startingPlayerId is highlighted for
	// everyone with a "Starts" badge.
	selectable?: boolean;
	startingPlayerId?: string;
	onSelectPlayer?: (playerId: string) => void;
}

export function TeamPanel({
	team,
	myPlayerId,
	hostId,
	onJoin,
	disabled,
	selectable,
	startingPlayerId,
	onSelectPlayer,
}: TeamPanelProps) {
	const isFull = team.maxPlayers > 0 && team.players.length >= team.maxPlayers;
	const amOnTeam = team.players.some((p) => p.id === myPlayerId);
	const emptySlots =
		team.maxPlayers > 0 ? Math.max(0, team.maxPlayers - team.players.length) : 0;

	return (
		<div className={`rounded-xl border-2 ${BORDER[team.color]} ${BG_LIGHT[team.color]} p-4 flex flex-col gap-3`}>
			<div className="flex justify-between items-center">
				<span className={`font-display text-base font-bold uppercase ${LABEL[team.color]}`}>
					{TEAM_LABEL[team.color]}
				</span>
				<span className="text-text-muted text-xs font-mono">
					{team.players.length}/{team.maxPlayers || "∞"} players
				</span>
			</div>

			<div className="flex flex-col gap-1.5">
				{team.players.map((p) => {
					const isStarter = p.id === startingPlayerId;
					const rowClass = `flex items-center gap-2 rounded-lg px-3 py-2 w-full text-left ${
						isStarter ? `bg-surface-dark/60 ring-2 ${RING[team.color]}` : "bg-surface-dark/60"
					} ${selectable ? "transition-opacity active:opacity-70" : ""}`;
					const badges = (
						<>
							<span className={`w-2 h-2 rounded-full flex-shrink-0 ${BTN_BG[team.color]}`} />
							<span className="text-sm text-text-primary flex-1">{p.name}</span>
							<div className="flex items-center gap-1.5">
								{isStarter && (
									<span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-white ${BTN_BG[team.color]}`}>
										Starts
									</span>
								)}
								{p.id === hostId && (
									<span className="text-[10px] font-bold text-gold uppercase tracking-wide bg-gold/10 px-1.5 py-0.5 rounded">
										Host
									</span>
								)}
								{p.id === myPlayerId && (
									<span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${LABEL[team.color]} bg-surface-dark/60`}>
										You
									</span>
								)}
							</div>
						</>
					);
					return selectable ? (
						<button key={p.id} type="button" onClick={() => onSelectPlayer?.(p.id)} className={rowClass}>
							{badges}
						</button>
					) : (
						<div key={p.id} className={rowClass}>
							{badges}
						</div>
					);
				})}

				{Array.from({ length: emptySlots }).map((_, i) => (
					<div
						key={`empty-${i}`}
						className="flex items-center gap-2 border border-dashed border-text-muted/20 rounded-lg px-3 py-2"
					>
						<span className="w-2 h-2 rounded-full flex-shrink-0 bg-text-muted/20" />
						<span className="text-sm text-text-muted/40 italic">Empty slot</span>
					</div>
				))}
			</div>

			{!amOnTeam && !isFull && !disabled && (
				<button
					onClick={() => onJoin(team.color)}
					className={`w-full min-h-10 rounded-lg ${BTN_BG[team.color]} text-white text-sm font-semibold transition-opacity active:opacity-80`}
				>
					Join {TEAM_LABEL[team.color]}
				</button>
			)}
		</div>
	);
}
