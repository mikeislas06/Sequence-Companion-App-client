import { Button } from "@/components/ui/Button";
import type { TeamColor } from "@/lib/game-types";

interface ActionBarProps {
	isMyTurn: boolean;
	selectedCardId: string | null;
	isHost: boolean;
	allowDeadCards: boolean;
	enforceNoTableTalk: boolean;
	activeTeams: TeamColor[];
	onPlayCard: () => void;
	onDeadCard: () => void;
	onPenalty: (t: TeamColor) => void;
}

export function ActionBar({
	isMyTurn,
	selectedCardId,
	isHost,
	allowDeadCards,
	enforceNoTableTalk,
	activeTeams,
	onPlayCard,
	onDeadCard,
	onPenalty,
}: ActionBarProps) {
	return (
		<div className="flex flex-col gap-2">
			<Button fullWidth onClick={onPlayCard} disabled={!isMyTurn || !selectedCardId}>
				Play Card
			</Button>
			{allowDeadCards && (
				<Button
					fullWidth
					variant="secondary"
					onClick={onDeadCard}
					disabled={!isMyTurn || !selectedCardId}
				>
					Announce Dead Card
				</Button>
			)}
			{isHost && enforceNoTableTalk && (
				<div className="flex flex-col gap-1 mt-2">
					<p className="text-text-muted text-xs text-center">No Table Talk Penalty</p>
					<div className="flex gap-2">
						{activeTeams.map((t) => (
							<Button
								key={t}
								variant="danger"
								className="flex-1"
								onClick={() => onPenalty(t)}
							>
								{t[0].toUpperCase() + t.slice(1)}
							</Button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
