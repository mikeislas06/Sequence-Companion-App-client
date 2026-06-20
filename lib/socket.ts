import { io, Socket } from "socket.io-client";
import type {
	GameConfig,
	TeamColor,
	PublicRoom,
	Card,
	HandUpdate,
	TimerSetting,
	SessionResync,
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

// Re-announce the saved session to the server so it can re-bind this socket to
// the existing player slot and reply with a full state resync.
function attemptRejoin(s: Socket): void {
	if (typeof window === "undefined") return;
	const roomCode = localStorage.getItem("seq_roomCode");
	const playerId = localStorage.getItem("seq_playerId");
	const playerName = localStorage.getItem("seq_playerName");
	if (roomCode && playerId) {
		s.emit("player:rejoin", {
			roomCode,
			playerId,
			...(playerName ? { playerName } : {}),
		});
	}
}

let visibilityHooked = false;

// Mobile browsers (especially iOS PWAs) freeze the socket when the app is
// backgrounded and don't always fire a clean reconnect when it returns. When
// the page becomes visible / focused again, force a reconnect-and-resync so the
// game state is never left stale after app-switching.
function hookVisibilityResync(s: Socket): void {
	if (visibilityHooked || typeof window === "undefined") return;
	visibilityHooked = true;

	const resume = () => {
		if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
		if (!localStorage.getItem("seq_roomCode")) return;
		if (s.connected) {
			attemptRejoin(s);
		} else {
			s.connect(); // the "connect" handler will rejoin once reconnected
		}
	};

	document.addEventListener("visibilitychange", resume);
	window.addEventListener("focus", resume);
	window.addEventListener("online", resume);
}

export function getSocket(): Socket {
	if (!socket) {
		if (!SOCKET_URL) {
			throw new Error("NEXT_PUBLIC_SERVER_URL is not configured. Check your .env.local file.");
		}
		socket = io(SOCKET_URL, {
			autoConnect: false,
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 500,
			reconnectionDelayMax: 4000,
		});

		// On every (re)connection, attempt to rejoin an active session.
		// This fires on initial connect AND after Socket.IO recovers from
		// a dropped connection (PWA backgrounded, screen locked, etc.).
		socket.on("connect", () => attemptRejoin(socket!));
		hookVisibilityResync(socket);
	}
	return socket;
}

// Manually trigger a resync (e.g. when a page mounts and wants fresh state).
export function resync(): void {
	const s = getSocket();
	if (s.connected) attemptRejoin(s);
	else s.connect();
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

export function setStartConfig(
	roomCode: string,
	mode: "default" | "random" | "manual",
	startingPlayerId?: string,
): void {
	getSocket().emit("game:setStartConfig", { roomCode, mode, startingPlayerId });
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

// Intentional leave — tells the server to permanently free the player slot
// (a plain disconnect is treated as transient and keeps the slot for rejoin).
export function leaveRoom(roomCode: string): void {
	getSocket().emit("room:leave", { roomCode });
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

// Fired when a team completes a sequence (the host bumps their count up). Used
// to surface a celebratory announcement to everyone in the room.
export const onSequenceCompleted = (
	handler: (data: { teamColor: TeamColor; count: number }) => void,
): Off => on("sequence:completed", handler);

export const onError = (handler: (data: { message: string }) => void): Off => on("error", handler);

export const onTurnStarted = (
	handler: (data: {
		currentPlayerId: string;
		currentPlayerName: string;
		teamColor: TeamColor;
		timerSetting: TimerSetting;
		remaining?: number;
		deckCount?: number;
	}) => void,
): Off => on("turn:started", handler);

export const onSessionResync = (handler: (data: SessionResync) => void): Off =>
	on("session:resync", handler);

// Fired when an auto-rejoin targets a room that no longer exists. Expected on
// app open with a stale saved session — handled silently, never shown as an error.
export const onSessionInvalid = (handler: (data: { roomCode: string }) => void): Off =>
	on("session:invalid", handler);
