import { io, Socket } from "socket.io-client";
import type {
	GameConfig,
	TeamColor,
	PublicRoom,
	Card,
	HandUpdate,
	TimerSetting,
} from "./game-types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;
let socket: Socket | null = null;

// ---------------------------------------------------------------------------
// Session persistence — localStorage survives PWA background and screen lock
// ---------------------------------------------------------------------------

export function persistSession(roomCode: string, playerId: string, playerName: string): void {
	if (typeof window === "undefined") return;
	localStorage.setItem("seq_roomCode", roomCode);
	localStorage.setItem("seq_playerId", playerId);
	localStorage.setItem("seq_playerName", playerName);
}

export function clearSession(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem("seq_roomCode");
	localStorage.removeItem("seq_playerId");
	localStorage.removeItem("seq_playerName");
}

// ---------------------------------------------------------------------------
// Socket singleton
// ---------------------------------------------------------------------------

export function getSocket(): Socket {
	if (!socket) {
		if (!SOCKET_URL) {
			throw new Error("NEXT_PUBLIC_SERVER_URL is not configured. Check your .env.local file.");
		}
		socket = io(SOCKET_URL, { autoConnect: false });

		// On every (re)connection, attempt to rejoin an active session.
		// This fires on initial connect AND after Socket.IO recovers from
		// a dropped connection (PWA backgrounded, screen locked, etc.).
		socket.on("connect", () => {
			if (typeof window === "undefined") return;
			const roomCode = localStorage.getItem("seq_roomCode");
			const playerId = localStorage.getItem("seq_playerId");
			const playerName = localStorage.getItem("seq_playerName");
			if (roomCode && playerId) {
				socket!.emit("player:rejoin", {
					roomCode,
					playerId,
					...(playerName ? { playerName } : {}),
				});
			}
		});
	}
	return socket;
}

export function connect(): void {
	getSocket().connect();
}

export function connectIfNeeded(): void {
	const s = getSocket();
	if (!s.connected) s.connect();
}

export function disconnect(): void {
	socket?.disconnect();
	socket = null;
}

// Emitters
export function createRoom(hostName: string, config: GameConfig): void {
	getSocket().emit("room:create", { hostName, config });
}

export function joinRoom(roomCode: string, playerName: string): void {
	getSocket().emit("room:join", { roomCode, playerName });
}

export function joinTeam(roomCode: string, teamColor: TeamColor): void {
	getSocket().emit("team:join", { roomCode, teamColor });
}

export function startGame(roomCode: string): void {
	getSocket().emit("game:start", { roomCode });
}

export function playCard(roomCode: string, cardId: string): void {
	getSocket().emit("card:play", { roomCode, cardId });
}

export function announceDeadCard(roomCode: string, cardId: string): void {
	getSocket().emit("card:dead", { roomCode, cardId });
}

export function applyPenalty(roomCode: string, targetTeam: TeamColor): void {
	getSocket().emit("penalty:apply", { roomCode, targetTeam });
}

export function updateSequence(roomCode: string, teamColor: TeamColor, delta: 1 | -1): void {
	getSocket().emit("sequence:update", { roomCode, teamColor, delta });
}

export function resetGame(roomCode: string): void {
	getSocket().emit("game:reset", { roomCode });
}

// Listeners
type Off = () => void;
function on<T>(event: string, handler: (data: T) => void): Off {
	getSocket().on(event, handler);
	return () => getSocket().off(event, handler);
}

export const onRoomUpdated = (handler: (room: PublicRoom) => void): Off =>
	on("room:updated", handler);

export const onRoomCreated = (
	handler: (data: { roomCode: string; playerId: string }) => void,
): Off => on("room:created", handler);

export const onRoomJoined = (
	handler: (data: { roomCode: string; playerId: string }) => void,
): Off => on("room:joined", handler);

export const onGameStarted = (handler: (room: PublicRoom) => void): Off =>
	on("game:started", handler);

export const onHandDealt = (handler: (update: HandUpdate) => void): Off =>
	on("hand:dealt", handler);

export const onHandUpdated = (handler: (update: HandUpdate) => void): Off =>
	on("hand:updated", handler);

export const onCardPlayed = (
	handler: (data: { playerId: string; card: Card; deckCount?: number }) => void,
): Off => on("card:played", handler);

export const onTimerTick = (handler: (data: { remaining: number }) => void): Off =>
	on("timer:tick", handler);

export const onDeckReshuffled = (handler: () => void): Off => on("deck:reshuffled", handler);

export const onPenaltyApplied = (
	handler: (data: { teamColor: TeamColor; reason: string }) => void,
): Off => on("penalty:applied", handler);

export const onError = (handler: (data: { message: string }) => void): Off => on("error", handler);

export const onTurnStarted = (
	handler: (data: {
		currentPlayerId: string;
		currentPlayerName: string;
		teamColor: TeamColor;
		timerSetting: TimerSetting;
		deckCount?: number;
	}) => void,
): Off => on("turn:started", handler);
