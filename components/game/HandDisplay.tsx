import type { Card } from "@/lib/game-types";
import { CardItem } from "./CardItem";

interface HandDisplayProps {
	hand: Card[];
	selectedCardId: string | null;
	onSelect: (id: string) => void;
	disabled?: boolean;
}

export function HandDisplay({ hand, selectedCardId, onSelect, disabled }: HandDisplayProps) {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-text-muted text-xs uppercase tracking-wide">Your Hand</p>
			<div className="flex flex-wrap gap-2 justify-center pb-4">
				{hand.map((card) => (
					<CardItem
						key={card.id}
						card={card}
						selected={selectedCardId === card.id}
						onClick={() => onSelect(card.id)}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}
