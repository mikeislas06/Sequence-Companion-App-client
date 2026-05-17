import type { Card } from "@/lib/game-types";
import { getSuitSymbol, isRedSuit, isTwoEyedJack, isOneEyedJack } from "@/lib/card-utils";

interface CardItemProps {
	card: Card;
	selected?: boolean;
	onClick?: () => void;
	disabled?: boolean;
}

export function CardItem({ card, selected, onClick, disabled }: CardItemProps) {
	const red = isRedSuit(card.suit);
	const twoEyed = isTwoEyedJack(card);
	const oneEyed = isOneEyedJack(card);
	const border = twoEyed
		? "border-2 border-gold"
		: oneEyed
			? "border-2 border-danger"
			: "border border-text-muted/30";
	const ring = selected
		? "ring-2 ring-team-green ring-offset-2 ring-offset-board-green -translate-y-2"
		: "";

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`relative bg-cream rounded-xl w-16 h-24 flex flex-col items-center justify-center transition-all ${border} ${ring} disabled:opacity-50 disabled:cursor-default`}
		>
			<span
				className={`font-card font-bold text-lg leading-none ${red ? "text-red-600" : "text-gray-900"}`}
			>
				{card.rank}
			</span>
			<span className={`text-2xl leading-none ${red ? "text-red-600" : "text-gray-900"}`}>
				{getSuitSymbol(card.suit)}
			</span>
			{twoEyed && (
				<span className="absolute bottom-1 text-[9px] font-bold text-gold leading-none">
					WILD
				</span>
			)}
			{oneEyed && (
				<span className="absolute bottom-1 text-[9px] font-bold text-danger leading-none">
					REM
				</span>
			)}
		</button>
	);
}
