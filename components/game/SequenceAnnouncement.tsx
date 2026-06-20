"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { TeamColor } from "@/lib/game-types";

const TEAM_TEXT: Record<TeamColor, string> = {
	green: "text-team-green",
	blue: "text-team-blue",
	red: "text-team-red",
};
const TEAM_BORDER: Record<TeamColor, string> = {
	green: "border-team-green",
	blue: "border-team-blue",
	red: "border-team-red",
};
const TEAM_LABEL: Record<TeamColor, string> = { green: "Green", blue: "Blue", red: "Red" };

interface SequenceAnnouncementProps {
	teamColor: TeamColor | null;
	onDismiss: () => void;
}

export function SequenceAnnouncement({ teamColor, onDismiss }: SequenceAnnouncementProps) {
	return (
		<AnimatePresence>
			{teamColor && (
				<motion.div
					className="fixed inset-0 z-[60] flex items-center justify-center px-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<div className="absolute inset-0 bg-black/70" onClick={onDismiss} />
					<motion.div
						className={`relative z-10 w-full max-w-sm bg-surface-dark border-2 ${TEAM_BORDER[teamColor]} rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-3 text-center`}
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
					>
						<span className="text-4xl" aria-hidden>
							🎉
						</span>
						<p className={`font-display text-2xl uppercase font-bold ${TEAM_TEXT[teamColor]}`}>
							Team {TEAM_LABEL[teamColor]}
						</p>
						<p className="text-cream text-base">got a sequence!</p>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
