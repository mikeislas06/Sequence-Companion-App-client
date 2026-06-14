import type { PublicPlayer } from "@/lib/game-types";

interface PendingPanelProps {
	players: PublicPlayer[];
	myPlayerId: string;
	hostId: string;
}

// Roster box shown at the top of the lobby: everyone who has joined the room but
// not yet picked a team. Players move out of here by tapping a team below.
export function PendingPanel({ players, myPlayerId, hostId }: PendingPanelProps) {
	if (players.length === 0) return null;

	const iAmPending = players.some((p) => p.id === myPlayerId);

	return (
		<div className="rounded-xl border-2 border-dashed border-gold/50 bg-gold/5 p-4 flex flex-col gap-3">
			<div className="flex justify-between items-center">
				<span className="font-display text-base font-bold uppercase text-gold">
					Pending to assign
				</span>
				<span className="text-text-muted text-xs font-mono">{players.length} waiting</span>
			</div>

			<div className="flex flex-col gap-1.5">
				{players.map((p) => (
					<div
						key={p.id}
						className="flex items-center gap-2 rounded-lg px-3 py-2 bg-surface-dark/60"
					>
						<span className="w-2 h-2 rounded-full flex-shrink-0 bg-gold/60" />
						<span className="text-sm text-text-primary flex-1">{p.name}</span>
						<div className="flex items-center gap-1.5">
							{p.id === hostId && (
								<span className="text-[10px] font-bold text-gold uppercase tracking-wide bg-gold/10 px-1.5 py-0.5 rounded">
									Host
								</span>
							)}
							{p.id === myPlayerId && (
								<span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-gold bg-surface-dark/60">
									You
								</span>
							)}
						</div>
					</div>
				))}
			</div>

			<p className="text-text-muted text-xs">
				{iAmPending
					? "Pick a team below to join the game."
					: "Waiting for these players to pick a team."}
			</p>
		</div>
	);
}
