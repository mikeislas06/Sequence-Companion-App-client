"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeamPanel } from "@/components/lobby/TeamPanel";
import { ConfigPanel } from "@/components/lobby/ConfigPanel";
import { Button } from "@/components/ui/Button";
import * as socket from "@/lib/socket";
import type { PublicRoom, TeamColor } from "@/lib/game-types";

export default function LobbyPage() {
	const { code } = useParams<{ code: string }>();
	const router = useRouter();
	const [room, setRoom] = useState<PublicRoom | null>(null);
	const [myId] = useState(() => sessionStorage.getItem("playerId") ?? "");
	const [error, setError] = useState("");

	useEffect(() => {
		const offs = [
			socket.onRoomUpdated(setRoom),
			socket.onGameStarted((r) => {
				setRoom(r);
				router.push(`/game/${code}`);
			}),
			socket.onError(({ message }) => setError(message)),
		];
		return () => offs.forEach((off) => off());
	}, [code, router]);

	const isHost = room?.hostId === myId;
	const activeColors: TeamColor[] =
		room?.config.teamCount === 2 ? ["green", "blue"] : ["green", "blue", "red"];

	return (
		<main className="flex flex-col gap-6 px-4 py-8 max-w-md mx-auto">
			<div className="text-center">
				<p className="text-text-muted text-xs uppercase tracking-widest">Room Code</p>
				<h1 className="font-display text-5xl text-cream tracking-widest mt-1">{code}</h1>
			</div>

			{error && <p className="text-danger text-sm text-center">{error}</p>}

			<div className="flex flex-col gap-3">
				{activeColors.map(
					(color) =>
						room && (
							<TeamPanel
								key={color}
								team={room.teams[color]}
								myPlayerId={myId}
								onJoin={(c) => socket.joinTeam(code, c)}
								disabled={room.status !== "lobby"}
							/>
						),
				)}
			</div>

			{isHost && room && (
				<>
					<ConfigPanel
						config={room.config}
						onChange={() => {
							// Config changes are only applied at room creation in V1
							// Emit a config:update event in V2 if live config changes are needed
						}}
					/>
					<Button fullWidth onClick={() => socket.startGame(code)}>
						Start Game
					</Button>
				</>
			)}

			{!isHost && (
				<p className="text-text-muted text-sm text-center">Waiting for host to start...</p>
			)}
		</main>
	);
}
