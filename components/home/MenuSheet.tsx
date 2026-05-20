"use client";
import { motion, AnimatePresence } from "framer-motion";

const t = {
	title: "Menu",
	showInstructions: "How to use this app",
	showInstructionsDesc: "Show the welcome guide again",
};

interface MenuSheetProps {
	open: boolean;
	onClose: () => void;
	onShowInstructions: () => void;
}

export function MenuSheet({ open, onClose, onShowInstructions }: MenuSheetProps) {
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-50 flex items-end"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<div className="absolute inset-0 bg-black/60" onClick={onClose} />
					<motion.div
						className="relative z-10 w-full bg-surface-dark border-t border-board-green-light rounded-t-2xl px-6 pt-5 pb-10 shadow-2xl"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ duration: 0.25, ease: "easeOut" }}
					>
						<div className="w-10 h-1 rounded-full bg-text-muted mx-auto mb-5" />
						<p className="font-display text-cream text-lg tracking-wide mb-4">{t.title}</p>

						<div className="flex flex-col gap-1">
							<button
								className="flex items-center gap-4 w-full text-left px-3 py-3 rounded-xl hover:bg-board-green-light/30 transition-colors"
								onClick={() => {
									onClose();
									onShowInstructions();
								}}
							>
								<span className="text-2xl">📖</span>
								<div>
									<p className="font-body font-semibold text-cream text-sm">{t.showInstructions}</p>
									<p className="text-text-muted text-xs">{t.showInstructionsDesc}</p>
								</div>
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
