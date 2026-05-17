"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { Card } from "@/lib/game-types";
import { CardItem } from "./CardItem";

interface HandDisplayProps {
	hand: Card[];
	selectedCardId: string | null;
	onSelect: (id: string) => void;
	disabled?: boolean;
}

export function HandDisplay({ hand, selectedCardId, onSelect, disabled }: HandDisplayProps) {
	const cols = hand.length >= 5 ? "grid-cols-3" : "grid-cols-2";

	return (
		<div className="flex flex-col gap-2">
			<p className="text-text-muted text-xs uppercase tracking-wide">Your Hand</p>
			<div className={`grid ${cols} gap-2 pb-4`}>
				<AnimatePresence mode="popLayout">
					{hand.map((card) => (
						<motion.div
							key={card.id}
							layout
							initial={{ y: 60, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ x: -80, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<CardItem
								card={card}
								selected={selectedCardId === card.id}
								onClick={() => onSelect(card.id)}
								disabled={disabled}
							/>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}
