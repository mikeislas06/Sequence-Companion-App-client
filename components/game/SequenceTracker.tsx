import type { PublicRoom, TeamColor } from "@/lib/game-types";
import * as socket from "@/lib/socket";

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
const BG: Record<TeamColor, string> = {
	green: "bg-team-green",
	blue: "bg-team-blue",
	red: "bg-team-red",
};
const LABELS: Record<TeamColor, string> = {
	green: "Green",
	blue: "Blue",
	red: "Red",
};

interface SequenceTrackerProps {
	room: PublicRoom;
	onClose: () => void;
}

export function SequenceTracker({ room, onClose }: SequenceTrackerProps) {
	const activeColors: TeamColor[] =
		room.config.teamCount === 2 ? ["green", "blue"] : ["green", "blue", "red"];
	const winCount = room.config.winningSequences ?? (room.config.teamCount === 2 ? 2 : 1);

	return (
		<>
			<div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
			<div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark rounded-t-2xl p-6 pb-10 flex flex-col gap-5 max-w-md mx-auto overflow-y-auto">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-display text-cream text-lg uppercase tracking-wide">
							Sequences
						</h2>
						<p className="text-text-muted text-xs mt-0.5">First to {winCount} wins</p>
					</div>
					<button
						onClick={onClose}
						className="text-text-muted text-3xl leading-none w-10 h-10 flex items-center justify-center"
					>
						×
					</button>
				</div>

				<div className="flex flex-col gap-3">
					{activeColors.map((color) => {
						const count = room.sequences?.[color] ?? 0;
						return (
							<div
								key={color}
								className={`flex items-center justify-between rounded-xl border-2 ${BORDERS[color]} px-5 py-4`}
							>
								<span
									className={`font-display text-base uppercase font-bold ${COLORS[color]}`}
								>
									{LABELS[color]} Team
								</span>
								<div className="flex items-center gap-5">
									<button
										onClick={() => socket.updateSequence(room.code, color, -1)}
										disabled={count === 0}
										className={`w-10 h-10 rounded-full border-2 bg-transparent font-bold text-xl disabled:opacity-30 flex items-center justify-center ${BORDERS[color]} ${COLORS[color]}`}
									>
										−
									</button>
									<span
										className={`font-display text-4xl font-bold min-w-[1.5ch] text-center ${COLORS[color]}`}
									>
										{count}
									</span>
									<button
										onClick={() => socket.updateSequence(room.code, color, 1)}
										disabled={count >= winCount}
										className={`w-10 h-10 rounded-full ${BG[color]} text-white font-bold text-xl disabled:opacity-30 flex items-center justify-center`}
									>
										+
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}
