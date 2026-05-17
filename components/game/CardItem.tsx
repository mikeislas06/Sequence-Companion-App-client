import type { Card } from "@/lib/game-types";
import { getSuitSymbol, isRedSuit, isTwoEyedJack, isOneEyedJack } from "@/lib/card-utils";

const F = false;
const T = true;

// 5-row × 3-col pip grids — each row is [left, center, right]
const PIP_GRIDS: Record<string, [boolean, boolean, boolean][]> = {
	"2": [
		[F, T, F],
		[F, F, F],
		[F, F, F],
		[F, F, F],
		[F, T, F],
	],
	"3": [
		[F, T, F],
		[F, F, F],
		[F, T, F],
		[F, F, F],
		[F, T, F],
	],
	"4": [
		[T, F, T],
		[F, F, F],
		[F, F, F],
		[F, F, F],
		[T, F, T],
	],
	"5": [
		[T, F, T],
		[F, F, F],
		[F, T, F],
		[F, F, F],
		[T, F, T],
	],
	"6": [
		[T, F, T],
		[F, F, F],
		[T, F, T],
		[F, F, F],
		[T, F, T],
	],
	"7": [
		[T, F, T],
		[F, T, F],
		[T, F, T],
		[F, F, F],
		[T, F, T],
	],
	"8": [
		[T, F, T],
		[F, T, F],
		[T, F, T],
		[F, T, F],
		[T, F, T],
	],
	"9": [
		[T, T, T],
		[F, F, F],
		[T, T, T],
		[F, F, F],
		[T, T, T],
	],
	"10": [
		[T, T, T],
		[T, F, T],
		[F, F, F],
		[T, F, T],
		[T, T, T],
	],
};

function PipGrid({ rank, suitSymbol, color }: { rank: string; suitSymbol: string; color: string }) {
	if (rank === "A") {
		return <span className={`text-4xl leading-none select-none ${color}`}>{suitSymbol}</span>;
	}

	const grid = PIP_GRIDS[rank];
	if (!grid) return null;

	return (
		<div className="flex flex-col justify-between w-full h-full py-0.5">
			{grid.map((row, ri) => (
				<div key={ri} className="flex w-full">
					{row.map((active, ci) => (
						<span
							key={ci}
							className={`flex-1 text-center text-xs leading-none select-none ${active ? color : "invisible"}`}
						>
							{suitSymbol}
						</span>
					))}
				</div>
			))}
		</div>
	);
}

function FaceCardCenter({
	rank,
	suitSymbol,
	red,
	twoEyed,
	oneEyed,
}: {
	rank: string;
	suitSymbol: string;
	red: boolean;
	twoEyed: boolean;
	oneEyed: boolean;
}) {
	const textColor = red ? "text-red-600" : "text-gray-900";
	const bgColor = red ? "bg-red-50" : "bg-gray-100";
	const rankColor = twoEyed ? "text-amber-500" : oneEyed ? "text-red-500" : textColor;

	return (
		<div
			className={"w-full h-full rounded-md flex flex-col items-center justify-center gap-0.5"}
		>
			<span className={`font-display text-2xl font-bold leading-none ${rankColor}`}>
				{rank}
			</span>
			<span className={`text-sm leading-none select-none ${textColor}`}>{suitSymbol}</span>
			{twoEyed && (
				<span className="text-[7px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">
					WILD
				</span>
			)}
			{oneEyed && (
				<span className="text-[7px] font-bold text-red-500 uppercase tracking-wider mt-0.5">
					REM
				</span>
			)}
		</div>
	);
}

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
	const isFaceCard = ["J", "Q", "K"].includes(card.rank);
	const suitSymbol = getSuitSymbol(card.suit);
	const suitColor = red ? "text-red-600" : "text-gray-900";

	const border = twoEyed
		? "border-2 border-amber-400"
		: oneEyed
			? "border-2 border-red-400"
			: "border border-text-muted/30";
	const ring = selected
		? "ring-2 ring-team-green ring-offset-2 ring-offset-board-green -translate-y-2"
		: "";

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`relative bg-cream rounded-xl w-full aspect-2/3 flex flex-col p-1.5 transition-all ${border} ${ring} disabled:opacity-50 disabled:cursor-default overflow-hidden`}
		>
			{/* Top-left corner */}
			<div
				className={`flex flex-col items-center leading-none gap-px self-start ${suitColor}`}
			>
				<span className="font-card font-bold text-xs">{card.rank}</span>
				<span className="text-[10px] select-none">{suitSymbol}</span>
			</div>

			{/* Center */}
			<div className="flex-1 flex items-center justify-center px-1 py-0.5 min-h-0">
				{isFaceCard ? (
					<FaceCardCenter
						rank={card.rank}
						suitSymbol={suitSymbol}
						red={red}
						twoEyed={twoEyed}
						oneEyed={oneEyed}
					/>
				) : (
					<PipGrid rank={card.rank} suitSymbol={suitSymbol} color={suitColor} />
				)}
			</div>

			{/* Bottom-right corner (mirrored via rotate-180) */}
			<div
				className={`flex flex-col items-center leading-none gap-px self-end rotate-180 ${suitColor}`}
			>
				<span className="font-card font-bold text-xs">{card.rank}</span>
				<span className="text-[10px] select-none">{suitSymbol}</span>
			</div>
		</button>
	);
}
