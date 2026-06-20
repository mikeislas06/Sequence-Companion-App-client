"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as socket from "@/lib/socket";
import type { PublicRoom, Card, TeamColor } from "@/lib/game-types";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { Timer } from "@/components/game/Timer";
import { HandDisplay } from "@/components/game/HandDisplay";
import { ActionBar } from "@/components/game/ActionBar";
import { DiscardPile } from "@/components/game/DiscardPile";
import { SequenceTracker } from "@/components/game/SequenceTracker";
import { SequenceAnnouncement } from "@/components/game/SequenceAnnouncement";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function GamePage() {
	const { code } = useParams<{ code: string }>();
	const router = useRouter();
	const [room, setRoom] = useState<PublicRoom | null>(() => {
		try {
			const stored = sessionStorage.getItem("currentRoom");
			return stored ? (JSON.parse(stored) as PublicRoom) : null;
		} catch {
			return null;
		}
	});
	const [hand, setHand] = useState<Card[]>(() => {
		try {
			const stored = sessionStorage.getItem("currentHand");
			return stored ? (JSON.parse(stored) as Card[]) : [];
		} catch {
			return [];
		}
	});
	const [selectedCard, setSelectedCard] = useState<string | null>(null);
	const [currentPlayerId, setCurrentPlayerId] = useState(() => {
		try {
			const stored = sessionStorage.getItem("currentTurn");
			return stored ? (JSON.parse(stored).currentPlayerId ?? "") : "";
		} catch {
			return "";
		}
	});
	const [timerRemaining, setTimerRemaining] = useState(() => {
		try {
			const stored = sessionStorage.getItem("currentTurn");
			const t = stored ? JSON.parse(stored).timerSetting : "off";
			return t === "off" ? 0 : (t as number);
		} catch {
			return 0;
		}
	});
	const [timerTotal, setTimerTotal] = useState(() => {
		try {
			const stored = sessionStorage.getItem("currentTurn");
			const t = stored ? JSON.parse(stored).timerSetting : "off";
			return t === "off" ? 0 : (t as number);
		} catch {
			return 0;
		}
	});
	const [error, setError] = useState("");
	const [myId] = useState(() => {
		if (typeof window === "undefined") return "";
		return localStorage.getItem("seq_playerId") ?? sessionStorage.getItem("playerId") ?? "";
	});
	const [showTracker, setShowTracker] = useState(false);
	const [sequenceTeam, setSequenceTeam] = useState<TeamColor | null>(null);

	useEffect(() => {
		const offs = [
			socket.onRoomUpdated((updatedRoom) => {
				setRoom(updatedRoom);
				sessionStorage.setItem("currentRoom", JSON.stringify(updatedRoom));
				// Sync turn state from room in case turn:started was missed during disconnect
				if (updatedRoom.currentPlayerId !== undefined) {
					setCurrentPlayerId(updatedRoom.currentPlayerId);
				}
			}),
			socket.onHandDealt(({ hand }) => setHand(hand)),
			socket.onHandUpdated(({ hand }) => {
				setHand(hand);
				setSelectedCard(null);
				setError("");
			}),
			socket.onTurnStarted(({ currentPlayerId, timerSetting, remaining }) => {
				setCurrentPlayerId(currentPlayerId);
				const t = timerSetting === "off" ? 0 : (timerSetting as number);
				setTimerTotal(t);
				// Use the server's remaining time when resyncing mid-turn; otherwise
				// start a fresh full countdown.
				setTimerRemaining(remaining !== undefined ? remaining : t);
				setError("");
			}),
			socket.onTimerTick(({ remaining }) => setTimerRemaining(remaining)),
			socket.onSequenceCompleted(({ teamColor }) => setSequenceTeam(teamColor)),
			socket.onError(({ message }) => setError(message)),
		];
		// Pull fresh state on mount (covers navigation in and reconnects).
		socket.resync();
		return () => {
			offs.forEach((off) => off());
		};
	}, [router]);

	// Navigate to the game-over screen off the authoritative room status. The
	// room:updated broadcast carries status + winnerTeam, so this fires reliably
	// for the host (who triggers the win) instead of relying solely on the
	// one-shot game:over event, which sometimes required a manual refresh.
	useEffect(() => {
		if (room?.status === "game_over" && room.winnerTeam) {
			sessionStorage.setItem("winnerTeam", room.winnerTeam);
			// Keep the session so "Play Again" / a reconnect can still rejoin the
			// room (it resets back to the lobby with the same code). The session is
			// only cleared on an explicit leave.
			router.push("/game-over");
		}
	}, [room?.status, room?.winnerTeam, router]);

	// Auto-dismiss the "got a sequence!" announcement after a few seconds so it
	// stays celebratory without blocking the game.
	useEffect(() => {
		if (!sequenceTeam) return;
		const t = setTimeout(() => setSequenceTeam(null), 3500);
		return () => clearTimeout(t);
	}, [sequenceTeam]);

	if (!room) {
		return (
			<main className="flex flex-col items-center justify-center min-h-screen">
				<Spinner label="Loading game…" />
			</main>
		);
	}

	const isMyTurn = currentPlayerId === myId;
	const isHost = room?.hostId === myId;
	const activeTeams: TeamColor[] =
		room?.config.teamCount === 2 ? ["green", "blue"] : ["green", "blue", "red"];
	const allPlayers = room ? Object.values(room.teams).flatMap((t) => t.players) : [];
	const currentPlayer = allPlayers.find((p) => p.id === currentPlayerId);
	const winCount =
		room?.config.winningSequences ?? (room?.config.teamCount === 2 ? 2 : 1);
	const TEAM_TEXT: Record<TeamColor, string> = {
		green: "text-team-green",
		blue: "text-team-blue",
		red: "text-team-red",
	};
	const TEAM_LABEL: Record<TeamColor, string> = { green: "Green", blue: "Blue", red: "Red" };

	return (
		<main className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto min-h-screen">
			{currentPlayer && (
				<TurnIndicator
					playerName={currentPlayer.name}
					teamColor={currentPlayer.teamColor ?? "green"}
					isMyTurn={isMyTurn}
				/>
			)}

			<div className="flex items-center justify-between">
				<Timer remaining={timerRemaining} total={timerTotal} />
				{room?.config.showDeckCount && room.deckCount !== undefined && (
					<span className="text-text-muted text-xs">{room.deckCount} cards left</span>
				)}
			</div>

			{error && <p className="text-danger text-sm text-center">{error}</p>}

			<div className="flex gap-6 flex-wrap">
				{activeTeams.map((color) => (
					<div
						key={color}
						className={`flex flex-col gap-1 ${color === "green" ? "bg-team-green/20" : color === "blue" ? "bg-team-blue/20" : "bg-team-red/20"} rounded-lg p-3 flex-1 min-w-[120px]"}`}
					>
						<div className="flex items-center justify-between gap-2">
							<span
								className={`font-display text-[11px] uppercase tracking-wide font-bold ${TEAM_TEXT[color]}`}
							>
								{TEAM_LABEL[color]}
							</span>
							<span className={`text-sm font-bold ${TEAM_TEXT[color]}`}>
								{room?.sequences?.[color] ?? 0}
								<span className="text-text-muted font-normal">/{winCount}</span>
							</span>
						</div>
						{room?.teams[color].players.map((p) => (
							<span
								key={p.id}
								className={`text-xs ${p.id === currentPlayerId ? "text-cream font-bold" : "text-text-muted"}`}
							>
								{p.name}
							</span>
						))}
					</div>
				))}
			</div>

			<DiscardPile lastPlayedCard={room?.lastPlayedCard} lastPlayedBy={room?.lastPlayedBy} />

			<HandDisplay
				hand={hand}
				selectedCardId={selectedCard}
				onSelect={setSelectedCard}
				disabled={!isMyTurn}
			/>

			{isHost && room && (
				<Button variant="secondary" fullWidth onClick={() => setShowTracker(true)}>
					Track Sequences
				</Button>
			)}

			{showTracker && room && (
				<SequenceTracker room={room} onClose={() => setShowTracker(false)} />
			)}

			<SequenceAnnouncement teamColor={sequenceTeam} onDismiss={() => setSequenceTeam(null)} />

			<ActionBar
				isMyTurn={isMyTurn}
				selectedCardId={selectedCard}
				isHost={isHost}
				allowDeadCards={room?.config.allowDeadCards ?? false}
				enforceNoTableTalk={room?.config.enforceNoTableTalk ?? false}
				activeTeams={activeTeams}
				onPlayCard={() => selectedCard && socket.playCard(code, selectedCard)}
				onDeadCard={() => selectedCard && socket.announceDeadCard(code, selectedCard)}
				onPenalty={(team) => socket.applyPenalty(code, team)}
			/>
		</main>
	);
}
