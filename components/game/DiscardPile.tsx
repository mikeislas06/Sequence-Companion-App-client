import type { Card } from "@/lib/game-types";
import { CardItem } from "./CardItem";

export function DiscardPile({ lastPlayedCard }: { lastPlayedCard?: Card }) {
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
		</div>
	);
}
