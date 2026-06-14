import type { Card } from "@/lib/game-types";
import { CardItem } from "./CardItem";

export function DiscardPile({
	lastPlayedCard,
	lastPlayedBy,
}: {
	lastPlayedCard?: Card;
	lastPlayedBy?: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1">
			<p className="text-text-muted text-xs uppercase tracking-wide">Last Played</p>
			<div className="w-16">
				{lastPlayedCard ? (
					<CardItem card={lastPlayedCard} disabled compact />
				) : (
					<div className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-text-muted flex items-center justify-center">
						<span className="text-text-muted text-xs">—</span>
					</div>
				)}
			</div>
			{lastPlayedCard && lastPlayedBy && (
				<p className="text-text-muted text-xs text-center max-w-[8rem] truncate">
					by <span className="text-cream font-semibold">{lastPlayedBy}</span>
				</p>
			)}
		</div>
	);
}
