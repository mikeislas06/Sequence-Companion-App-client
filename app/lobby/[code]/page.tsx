"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeamPanel } from "@/components/lobby/TeamPanel";
import { PendingPanel } from "@/components/lobby/PendingPanel";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import * as socket from "@/lib/socket";
import type { PublicRoom, TeamColor } from "@/lib/game-types";

export default function LobbyPage() {
	const { code } = useParams<{ code: string }>();
	const router = useRouter();
	const [room, setRoom] = useState<PublicRoom | null>(() => {
		try {
			const stored = sessionStorage.getItem("currentRoom");
			return stored ? (JSON.parse(stored) as PublicRoom) : null;
		} catch { return null; }
	});
	const [myId] = useState(() => {
		if (typeof window === "undefined") return "";
		return localStorage.getItem("seq_playerId") ?? sessionStorage.getItem("playerId") ?? "";
	});
	const [error, setError] = useState("");
	const [isStarting, setIsStarting] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const offs = [
			socket.onRoomUpdated((r) => {
				setRoom(r);
				sessionStorage.setItem("currentRoom", JSON.stringify(r));
				setError("");
			}),
			socket.onHandDealt(({ hand }) => {
				sessionStorage.setItem("currentHand", JSON.stringify(hand));
			}),
			socket.onTurnStarted((data) => {
				sessionStorage.setItem("currentTurn", JSON.stringify(data));
			}),
			socket.onGameStarted((r) => {
				setRoom(r);
				sessionStorage.setItem("currentRoom", JSON.stringify(r));
			}),
			socket.onError(({ message }) => {
				setError(message);
				setIsStarting(false);
			}),
		];
		// Pull fresh state on mount (covers navigation in and reconnects).
		socket.resync();
		return () => offs.forEach((off) => off());
	}, [code, router]);

	// Navigate off the authoritative room status rather than the one-shot
	// game:started event. room:updated / session:resync also carry the status,
	// so the host (and everyone) lands on the game screen as soon as the room is
	// in_game — no missed-event race that previously needed a manual refresh.
	useEffect(() => {
		if (room?.status === "in_game") {
			router.push(`/game/${code}`);
		}
	}, [room?.status, code, router]);

	function handleCopyCode() {
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function handleStartGame() {
		setIsStarting(true);
		setError("");
		socket.startGame(code);
	}

	const startMode = room?.config.startingPlayerMode ?? "default";
	const startingPlayerId = room?.config.startingPlayerId;
	// Manual mode with nobody chosen yet blocks the start (host taps a name first).
	const needsStarterPick = startMode === "manual" && !startingPlayerId;

	function toggleRandomStart() {
		socket.setStartConfig(code, startMode === "random" ? "default" : "random");
	}
	function toggleManualStart() {
		socket.setStartConfig(code, startMode === "manual" ? "default" : "manual");
	}
	function selectStarter(playerId: string) {
		socket.setStartConfig(code, "manual", playerId);
	}

	const isHost = room?.hostId === myId;
	const activeColors: TeamColor[] =
		room?.config.teamCount === 2 ? ["green", "blue"] : ["green", "blue", "red"];
	const pendingPlayers = room?.unassigned ?? [];
	const hasPending = pendingPlayers.length > 0;
	const totalPlayers = room
		? activeColors.reduce((sum, c) => sum + room.teams[c].players.length, 0) + pendingPlayers.length
		: 0;
	const totalSlots = room
		? activeColors.reduce((sum, c) => sum + (room.teams[c].maxPlayers || 0), 0)
		: 0;

	if (!room) {
		return (
			<main className="flex flex-col items-center justify-center min-h-screen gap-4">
				<Spinner label="Connecting to room..." />
			</main>
		);
	}

	return (
		<main className="flex flex-col gap-6 px-4 py-8 max-w-md mx-auto">
			<div className="text-center flex flex-col items-center gap-2">
				<p className="text-text-muted text-xs uppercase tracking-widest">Room Code</p>
				<h1 className="font-display text-6xl text-cream tracking-widest">{code}</h1>
				<button
					onClick={handleCopyCode}
					className="text-xs text-text-muted underline underline-offset-2 active:opacity-60 transition-opacity"
				>
					{copied ? "Copied!" : "Tap to copy"}
				</button>
			</div>

			{error && <p className="text-danger text-sm text-center">{error}</p>}

			<div className="flex items-center justify-between px-1">
				<span className="text-text-muted text-xs uppercase tracking-wide">Players</span>
				<span className="text-text-muted text-xs font-mono">{totalPlayers}/{totalSlots}</span>
			</div>

			<PendingPanel players={pendingPlayers} myPlayerId={myId} hostId={room.hostId} />

			<div className="flex flex-col gap-3">
				{activeColors.map((color) => (
					<TeamPanel
						key={color}
						team={room.teams[color]}
						myPlayerId={myId}
						hostId={room.hostId}
						onJoin={(c) => socket.joinTeam(code, c)}
						disabled={room.status !== "lobby"}
						selectable={isHost && startMode === "manual"}
						startingPlayerId={startMode === "manual" ? startingPlayerId : undefined}
						onSelectPlayer={selectStarter}
					/>
				))}
			</div>

			{isHost && (
				<div className="rounded-xl bg-surface-dark/40 border border-text-muted/10 p-4 flex flex-col gap-3">
					<p className="text-text-muted text-xs uppercase tracking-wide">Starting player</p>
					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							onClick={toggleRandomStart}
							aria-pressed={startMode === "random"}
							className={`min-h-10 rounded-lg text-sm font-semibold transition-opacity active:opacity-80 ${
								startMode === "random"
									? "bg-gold text-surface-dark"
									: "bg-surface-dark/60 text-text-muted border border-text-muted/20"
							}`}
						>
							Randomize
						</button>
						<button
							type="button"
							onClick={toggleManualStart}
							aria-pressed={startMode === "manual"}
							className={`min-h-10 rounded-lg text-sm font-semibold transition-opacity active:opacity-80 ${
								startMode === "manual"
									? "bg-gold text-surface-dark"
									: "bg-surface-dark/60 text-text-muted border border-text-muted/20"
							}`}
						>
							Choose player
						</button>
					</div>
					<p className="text-text-muted text-xs">
						{startMode === "random"
							? "A random player will start the game."
							: startMode === "manual"
								? needsStarterPick
									? "Tap a player above to set who starts."
									: "Tap a player above to change who starts."
								: "Default: the first green player starts. Pick a mode to change it."}
					</p>
				</div>
			)}

			<div className="rounded-xl bg-surface-dark/40 border border-text-muted/10 p-4 flex flex-col gap-2">
				<p className="text-text-muted text-xs uppercase tracking-wide">Game Settings</p>
				<div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
					<span className="text-text-muted text-xs">Teams</span>
					<span className="text-cream text-xs font-mono">{room.config.teamCount}</span>
					<span className="text-text-muted text-xs">Win at</span>
					<span className="text-cream text-xs font-mono">
						{(room.config.winningSequences ?? (room.config.teamCount === 2 ? 2 : 1))}{" "}
						{(room.config.winningSequences ?? (room.config.teamCount === 2 ? 2 : 1)) === 1
							? "sequence"
							: "sequences"}
					</span>
					<span className="text-text-muted text-xs">Timer</span>
					<span className="text-cream text-xs font-mono">
						{room.config.timer === "off" ? "Off" : `${room.config.timer}s`}
					</span>
					<span className="text-text-muted text-xs">Dead cards</span>
					<span className="text-cream text-xs font-mono">{room.config.allowDeadCards ? "On" : "Off"}</span>
					<span className="text-text-muted text-xs">No table talk</span>
					<span className="text-cream text-xs font-mono">{room.config.enforceNoTableTalk ? "On" : "Off"}</span>
				</div>
			</div>

			{isHost ? (
				<div className="flex flex-col gap-2">
					<Button fullWidth onClick={handleStartGame} disabled={isStarting || needsStarterPick || hasPending}>
						{isStarting ? "Starting…" : "Start Game"}
					</Button>
					{hasPending ? (
						<p className="text-text-muted text-xs text-center">
							Everyone must pick a team before the game can start.
						</p>
					) : (
						needsStarterPick && (
							<p className="text-text-muted text-xs text-center">Choose a starting player to begin.</p>
						)
					)}
				</div>
			) : (
				<div className="flex flex-col items-center gap-3 py-2">
					<Spinner size="sm" />
					<p className="text-text-muted text-sm">Waiting for host to start the game…</p>
				</div>
			)}

			<Button
				fullWidth
				variant="secondary"
				onClick={() => {
					// Emit the leave first, then keep the socket alive so the packet
					// actually flushes (disconnecting immediately can drop it).
					socket.leaveRoom(code);
					socket.clearSession();
					router.push("/");
				}}
			>
				Leave Room
			</Button>
		</main>
	);
}
