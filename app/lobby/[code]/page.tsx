"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeamPanel } from "@/components/lobby/TeamPanel";
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
	const [myId] = useState(() => sessionStorage.getItem("playerId") ?? "");
	const [error, setError] = useState("");
	const [isStarting, setIsStarting] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const offs = [
			socket.onRoomUpdated((r) => {
				setRoom(r);
				sessionStorage.setItem("currentRoom", JSON.stringify(r));
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
				router.push(`/game/${code}`);
			}),
			socket.onError(({ message }) => {
				setError(message);
				setIsStarting(false);
			}),
		];
		return () => offs.forEach((off) => off());
	}, [code, router]);

	function handleCopyCode() {
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function handleStartGame() {
		setIsStarting(true);
		socket.startGame(code);
	}

	const isHost = room?.hostId === myId;
	const activeColors: TeamColor[] =
		room?.config.teamCount === 2 ? ["green", "blue"] : ["green", "blue", "red"];
	const totalPlayers = room
		? activeColors.reduce((sum, c) => sum + room.teams[c].players.length, 0)
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

			<div className="flex flex-col gap-3">
				{activeColors.map((color) => (
					<TeamPanel
						key={color}
						team={room.teams[color]}
						myPlayerId={myId}
						hostId={room.hostId}
						onJoin={(c) => socket.joinTeam(code, c)}
						disabled={room.status !== "lobby"}
					/>
				))}
			</div>

			<div className="rounded-xl bg-surface-dark/40 border border-text-muted/10 p-4 flex flex-col gap-2">
				<p className="text-text-muted text-xs uppercase tracking-wide">Game Settings</p>
				<div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
					<span className="text-text-muted text-xs">Teams</span>
					<span className="text-cream text-xs font-mono">{room.config.teamCount}</span>
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
				<Button fullWidth onClick={handleStartGame} disabled={isStarting}>
					{isStarting ? "Starting…" : "Start Game"}
				</Button>
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
					socket.disconnect();
					router.push("/");
				}}
			>
				Leave Room
			</Button>
		</main>
	);
}
