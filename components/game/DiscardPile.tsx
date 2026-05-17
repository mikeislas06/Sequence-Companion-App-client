import type { Card } from "@/lib/game-types";
import { CardItem } from "./CardItem";

export function DiscardPile({ lastPlayedCard }: { lastPlayedCard?: Card }) {
	return (
		<div className="flex flex-col items-center gap-1">
			<p className="text-text-muted text-xs uppercase tracking-wide">Last Played</p>
			{lastPlayedCard ? (
				<CardItem card={lastPlayedCard} disabled />
			) : (
				<div className="w-16 h-24 rounded-xl border-2 border-dashed border-text-muted flex items-center justify-center">
					<span className="text-text-muted text-xs">—</span>
				</div>
			)}
		</div>
	);
}
