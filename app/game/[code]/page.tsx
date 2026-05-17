"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as socket from "@/lib/socket";
import type { PublicRoom, Card, TeamColor, TimerSetting } from "@/lib/game-types";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { Timer } from "@/components/game/Timer";
import { HandDisplay } from "@/components/game/HandDisplay";
import { ActionBar } from "@/components/game/ActionBar";
import { DiscardPile } from "@/components/game/DiscardPile";
import { SequenceTracker } from "@/components/game/SequenceTracker";
import { Button } from "@/components/ui/Button";

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
	const [myId] = useState(() => sessionStorage.getItem("playerId") ?? "");
	const [showTracker, setShowTracker] = useState(false);

	useEffect(() => {
		const offs = [
			socket.onRoomUpdated((updatedRoom) => {
				setRoom(updatedRoom);
				sessionStorage.setItem("currentRoom", JSON.stringify(updatedRoom));
			}),
			socket.onHandDealt(({ hand }) => setHand(hand)),
			socket.onHandUpdated(({ hand }) => {
				setHand(hand);
				setSelectedCard(null);
			}),
			socket.onTurnStarted(({ currentPlayerId, timerSetting }) => {
				setCurrentPlayerId(currentPlayerId);
				const t = timerSetting === "off" ? 0 : (timerSetting as number);
				setTimerTotal(t);
				setTimerRemaining(t);
			}),
			socket.onTimerTick(({ remaining }) => setTimerRemaining(remaining)),
			socket.onError(({ message }) => setError(message)),
		];
		socket.getSocket().on("game:over", ({ winnerTeam }: { winnerTeam: TeamColor }) => {
			sessionStorage.setItem("winnerTeam", winnerTeam);
			router.push("/game-over");
		});
		return () => {
			offs.forEach((off) => off());
			socket.getSocket().off("game:over");
		};
	}, [router]);

	const isMyTurn = currentPlayerId === myId;
	const isHost = room?.hostId === myId;
	const activeTeams: TeamColor[] =
		room?.config.teamCount === 2 ? ["green", "blue"] : ["green", "blue", "red"];
	const allPlayers = room ? Object.values(room.teams).flatMap((t) => t.players) : [];
	const currentPlayer = allPlayers.find((p) => p.id === currentPlayerId);

	return (
		<main className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto min-h-screen">
			{currentPlayer && (
				<TurnIndicator
					playerName={currentPlayer.name}
					teamColor={currentPlayer.teamColor}
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
						{room?.teams[color].players.map((p) => (
							<span
								key={p.id}
								className={`text-xs ${p.id === currentPlayerId ? "text-cream font-bold" : "text-text-muted"}`}
							>
								{p.name} ({p.cardCount})
							</span>
						))}
					</div>
				))}
			</div>

			<DiscardPile lastPlayedCard={room?.lastPlayedCard} />

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
