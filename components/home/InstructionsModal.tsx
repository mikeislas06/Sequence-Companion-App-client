"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const t = {
	title: "Welcome to Sequence Companion",
	subtitle: "Your digital co-pilot for the Sequence board game.",
	steps: [
		{
			icon: "🃏",
			heading: "Keep the physical board",
			body: "The board and chips stay on the table. This app handles the cards so every player's hand stays private.",
		},
		{
			icon: "📱",
			heading: "Create or join a room",
			body: 'One player creates a game and shares the 4-letter room code. Everyone else taps "Join Game" and enters the code.',
		},
		{
			icon: "🔄",
			heading: "Play your turn",
			body: "When it's your turn, tap the card you want to play. The app tracks turns, enforces rules, and deals new cards automatically.",
		},
		{
			icon: "🏆",
			heading: "Mark sequences on the board",
			body: "Still place chips on the physical board. When a team completes a sequence, the room host must manually mark it in the app — the app then tracks the count and announces the winner.",
		},
	],
	cta: "Let's play!",
};

interface InstructionsModalProps {
	open: boolean;
	onClose: () => void;
}

export function InstructionsModal({ open, onClose }: InstructionsModalProps) {
	return (
		<Modal open={open} onClose={onClose}>
			<div className="flex flex-col gap-5">
				<div className="text-center">
					<h2 className="font-display text-2xl text-cream tracking-wide">{t.title}</h2>
					<p className="text-text-muted text-sm mt-1">{t.subtitle}</p>
				</div>

				<div className="flex flex-col gap-4">
					{t.steps.map((step) => (
						<div key={step.heading} className="flex gap-3 items-start">
							<span className="text-xl shrink-0 mt-0.5">{step.icon}</span>
							<div>
								<p className="font-body font-semibold text-cream text-sm">{step.heading}</p>
								<p className="text-text-muted text-sm leading-relaxed">{step.body}</p>
							</div>
						</div>
					))}
				</div>

				<Button fullWidth onClick={onClose}>
					{t.cta}
				</Button>
			</div>
		</Modal>
	);
}
