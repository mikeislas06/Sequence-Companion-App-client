"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as socket from "@/lib/socket";

const DEFAULT_CONFIG = {
	teamCount: 2 as const,
	maxPlayersPerTeam: 2,
	timer: "off" as const,
	enforceNoTableTalk: false,
	allowDeadCards: true,
	showDeckCount: true,
};

export default function Home() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [mode, setMode] = useState<"idle" | "join">("idle");
	const [error, setError] = useState("");

	useEffect(() => {
		socket.connect();
		const offs = [
			socket.onRoomCreated(({ roomCode, playerId }) => {
				sessionStorage.setItem("playerId", playerId);
				sessionStorage.setItem("playerName", name);
				router.push(`/lobby/${roomCode}`);
			}),
			socket.onRoomJoined(({ roomCode, playerId }) => {
				sessionStorage.setItem("playerId", playerId);
				sessionStorage.setItem("playerName", name);
				router.push(`/lobby/${roomCode}`);
			}),
			socket.onError(({ message }) => setError(message)),
		];
		return () => offs.forEach((off) => off());
	}, [name, router]);

	const handleCreate = () => {
		if (!name.trim()) return setError("Enter your name first");
		socket.createRoom(name.trim(), DEFAULT_CONFIG);
	};

	const handleJoin = () => {
		if (!name.trim()) return setError("Enter your name first");
		if (!code.trim()) return setError("Enter a room code");
		socket.joinRoom(code.trim().toUpperCase(), name.trim());
	};

	return (
		<main className="flex flex-col items-center justify-center min-h-screen px-6 gap-8">
			<div className="text-center">
				<h1 className="font-display text-5xl text-cream tracking-wide">SEQUENCE</h1>
				<p className="text-text-muted text-sm mt-2">Card companion app</p>
			</div>
			<div className="w-full max-w-sm flex flex-col gap-4">
				<Input
					id="name"
					label="Your name"
					placeholder="Enter your name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					maxLength={20}
				/>
				{error && <p className="text-danger text-sm text-center">{error}</p>}
				<Button fullWidth onClick={handleCreate}>
					Create Game
				</Button>
				{mode === "idle" ? (
					<Button fullWidth variant="secondary" onClick={() => setMode("join")}>
						Join Game
					</Button>
				) : (
					<>
						<Input
							id="code"
							label="Room code"
							placeholder="e.g. AB4X"
							value={code}
							onChange={(e) => setCode(e.target.value.toUpperCase())}
							maxLength={4}
						/>
						<Button fullWidth variant="secondary" onClick={handleJoin}>
							Join
						</Button>
					</>
				)}
			</div>
		</main>
	);
}
