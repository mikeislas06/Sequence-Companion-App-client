"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfigPanel } from "@/components/lobby/ConfigPanel";
import { Spinner } from "@/components/ui/Spinner";
import { InstructionsModal } from "@/components/home/InstructionsModal";
import { MenuSheet } from "@/components/home/MenuSheet";
import * as socket from "@/lib/socket";
import type { GameConfig } from "@/lib/game-types";

const DEFAULT_CONFIG: GameConfig = {
	teamCount: 2,
	maxPlayersPerTeam: 2,
	timer: "off",
	enforceNoTableTalk: false,
	allowDeadCards: true,
	showDeckCount: true,
	winningSequences: 2,
};

export default function Home() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
	const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showInstructions, setShowInstructions] = useState(false);
	const [showMenu, setShowMenu] = useState(false);

	useEffect(() => {
		if (!localStorage.getItem("seq_seen_instructions")) {
			setShowInstructions(true);
			localStorage.setItem("seq_seen_instructions", "1");
		}
	}, []);

	useEffect(() => {
		socket.connect();
		const offs = [
			socket.onRoomUpdated((room) => {
				sessionStorage.setItem("currentRoom", JSON.stringify(room));
			}),
			socket.onRoomCreated(({ roomCode, playerId }) => {
				sessionStorage.setItem("playerId", playerId);
				sessionStorage.setItem("playerName", name);
				socket.persistSession(roomCode, playerId, name);
				router.push(`/lobby/${roomCode}`);
			}),
			socket.onRoomJoined(({ roomCode, playerId }) => {
				sessionStorage.setItem("playerId", playerId);
				sessionStorage.setItem("playerName", name);
				socket.persistSession(roomCode, playerId, name);
				router.push(`/lobby/${roomCode}`);
			}),
			socket.onError(({ message }) => {
				setError(message);
				setIsLoading(false);
			}),
		];
		return () => offs.forEach((off) => off());
	}, [name, router]);

	const handleCreate = () => {
		if (!name.trim()) return setError("Enter your name first");
		setIsLoading(true);
		setError("");
		socket.createRoom(name.trim(), config);
	};

	const handleJoin = () => {
		if (!name.trim()) return setError("Enter your name first");
		if (!code.trim()) return setError("Enter a room code");
		setIsLoading(true);
		setError("");
		socket.joinRoom(code.trim().toUpperCase(), name.trim());
	};

	return (
		<main className="relative flex flex-col items-center justify-center min-h-screen px-6 gap-8">
			<button
				className="absolute top-4 right-4 w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-board-green-light/30 transition-colors"
				onClick={() => setShowMenu(true)}
				aria-label="Open menu"
			>
				<span className="w-5 h-0.5 bg-text-muted rounded-full" />
				<span className="w-5 h-0.5 bg-text-muted rounded-full" />
				<span className="w-5 h-0.5 bg-text-muted rounded-full" />
			</button>
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
				{isLoading && <Spinner label="Connecting…" />}
				{mode === "create" && (
					<ConfigPanel
						config={config}
						onChange={(u) => setConfig((prev) => ({ ...prev, ...u }))}
					/>
				)}
				<Button
					fullWidth
					onClick={mode === "create" ? handleCreate : () => setMode("create")}
					disabled={isLoading}
				>
					Create Game
				</Button>
				{mode !== "join" ? (
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
						<Button
							fullWidth
							variant="secondary"
							onClick={handleJoin}
							disabled={isLoading}
						>
							Join
						</Button>
					</>
				)}
			</div>
			<InstructionsModal open={showInstructions} onClose={() => setShowInstructions(false)} />
			<MenuSheet
				open={showMenu}
				onClose={() => setShowMenu(false)}
				onShowInstructions={() => setShowInstructions(true)}
			/>
		</main>
	);
}
