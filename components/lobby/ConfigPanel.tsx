import type { GameConfig, TimerSetting } from "@/lib/game-types";

function Toggle({
	label,
	value,
	onChange,
}: {
	label: string;
	value: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between py-2 border-b border-board-green">
			<span className="text-sm text-text-primary">{label}</span>
			<button
				onClick={() => onChange(!value)}
				className={`w-12 h-6 rounded-full transition-colors ${value ? "bg-team-green" : "bg-text-muted"}`}
			>
				<span
					className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${value ? "translate-x-6" : "translate-x-0"}`}
				/>
			</button>
		</div>
	);
}

interface ConfigPanelProps {
	config: GameConfig;
	onChange: (u: Partial<GameConfig>) => void;
}

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
	return (
		<div className="bg-surface-dark rounded-xl p-4 flex flex-col gap-3">
			<h2 className="font-display text-sm text-cream uppercase tracking-wide">Settings</h2>

			<div className="flex items-center justify-between">
				<span className="text-sm text-text-primary">Teams</span>
				<div className="flex gap-2">
					{([2, 3] as const).map((n) => (
						<button
							key={n}
							onClick={() => onChange({ teamCount: n })}
							className={`w-10 h-8 rounded-lg text-sm font-semibold ${config.teamCount === n ? "bg-team-green text-white" : "bg-board-green-light text-text-muted"}`}
						>
							{n}
						</button>
					))}
				</div>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-sm text-text-primary">Players/team</span>
				<div className="flex gap-1">
					{[1, 2, 3, 4].map((n) => (
						<button
							key={n}
							onClick={() => onChange({ maxPlayersPerTeam: n })}
							className={`w-9 h-8 rounded-lg text-xs font-semibold ${config.maxPlayersPerTeam === n ? "bg-team-green text-white" : "bg-board-green-light text-text-muted"}`}
						>
							{n}
						</button>
					))}
				</div>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-sm text-text-primary">Timer</span>
				<div className="flex gap-1">
					{(["off", 30, 60, 90] as TimerSetting[]).map((t) => (
						<button
							key={String(t)}
							onClick={() => onChange({ timer: t })}
							className={`px-2 h-8 rounded-lg text-xs font-semibold ${config.timer === t ? "bg-team-green text-white" : "bg-board-green-light text-text-muted"}`}
						>
							{t === "off" ? "Off" : `${t}s`}
						</button>
					))}
				</div>
			</div>

			<Toggle
				label="No Table Talk penalty"
				value={config.enforceNoTableTalk}
				onChange={(v) => onChange({ enforceNoTableTalk: v })}
			/>
			<Toggle
				label="Allow Dead Cards"
				value={config.allowDeadCards}
				onChange={(v) => onChange({ allowDeadCards: v })}
			/>
			<Toggle
				label="Show deck count"
				value={config.showDeckCount}
				onChange={(v) => onChange({ showDeckCount: v })}
			/>
		</div>
	);
}
