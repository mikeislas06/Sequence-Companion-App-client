"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center px-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<div
						className="absolute inset-0 bg-black/70"
						onClick={onClose}
					/>
					<motion.div
						className="relative z-10 w-full max-w-sm bg-surface-dark border border-board-green-light rounded-2xl p-6 shadow-2xl"
						initial={{ scale: 0.92, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.92, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
					>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
