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
	return (
		<div className="flex flex-col gap-2">
			<p className="text-text-muted text-xs uppercase tracking-wide">Your Hand</p>
			{/* pt-3 gives headroom for the selected-card -translate-y-2 so it doesn't clip */}
			<div className="overflow-x-auto">
				<div className="grid grid-rows-2 grid-flow-col gap-2 pt-3 pb-2">
					<AnimatePresence mode="popLayout">
						{hand.map((card) => (
							<motion.div
								key={card.id}
								layout
								initial={{ x: 60, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -80, opacity: 0 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="w-24"
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
		</div>
	);
}
