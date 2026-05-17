"use client";
import { motion } from "framer-motion";

interface SpinnerProps {
	label?: string;
	size?: "sm" | "md";
}

export function Spinner({ label, size = "md" }: SpinnerProps) {
	const dot = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex gap-1.5">
				{[0, 1, 2].map((i) => (
					<motion.div
						key={i}
						className={`${dot} rounded-full bg-text-muted`}
						animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
						transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
					/>
				))}
			</div>
			{label && <p className="text-text-muted text-sm">{label}</p>}
		</div>
	);
}
