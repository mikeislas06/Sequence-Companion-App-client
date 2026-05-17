"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResultBoard } from "@/components/game-over/ResultBoard";
import { Button } from "@/components/ui/Button";
import * as socket from "@/lib/socket";
import type { TeamColor, PublicRoom } from "@/lib/game-types";

export default function GameOverPage() {
	const router = useRouter();
	const winner = (sessionStorage.getItem("winnerTeam") ?? "green") as TeamColor;
	const room = JSON.parse(sessionStorage.getItem("currentRoom") ?? "null") as PublicRoom | null;
	const myId = sessionStorage.getItem("playerId") ?? "";
	const isHost = room?.hostId === myId;

	useEffect(() => {
		const sock = socket.getSocket();
		sock.on("game:reset", () => {
			if (room) router.push(`/lobby/${room.code}`);
		});
		return () => {
			sock.off("game:reset");
		};
	}, [room, router]);

	if (!room) {
		return (
			<main className="flex flex-col items-center justify-center min-h-screen gap-10 px-6">
				<h1 className="font-display text-4xl text-cream">Game Over</h1>
				<Button fullWidth onClick={() => router.push("/")} className="max-w-xs">
					Back to Home
				</Button>
			</main>
		);
	}

	function handlePlayAgain() {
		if (!room) return;
		if (isHost) {
			socket.resetGame(room.code);
		}
		router.push(`/lobby/${room.code}`);
	}

	return (
		<main className="flex flex-col items-center min-h-screen gap-8 px-6 py-10 max-w-md mx-auto">
			<ResultBoard winner={winner} room={room} />
			<div className="flex flex-col gap-3 w-full max-w-xs">
				<Button fullWidth onClick={handlePlayAgain}>
					Play Again
				</Button>
				<Button fullWidth variant="secondary" onClick={() => router.push("/")}>
					Go Back to Lobby
				</Button>
			</div>
		</main>
	);
}
