export type Suit = "S" | "H" | "D" | "C";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type JackType = "two-eyed" | "one-eyed";
export type TeamColor = "green" | "blue" | "red";
export type TimerSetting = "off" | 30 | 60 | 90;
export type RoomStatus = "lobby" | "in_game" | "game_over";

export interface Card {
	id: string;
	rank: Rank;
	suit: Suit;
	jackType?: JackType;
}

export interface GameConfig {
	teamCount: 2 | 3;
	maxPlayersPerTeam: number;
	timer: TimerSetting;
	enforceNoTableTalk: boolean;
	allowDeadCards: boolean;
	showDeckCount: boolean;
	// How many sequences a team must complete to win. 2 for 2 teams; 1 or 2 for
	// 3 teams (host-selectable when 3 teams is chosen).
	winningSequences?: 1 | 2;
	// How the starting player is chosen. "default"/absent → first green player;
	// "random" → server picks a random starting offset; "manual" → host selects
	// startingPlayerId on the lobby screen. The turn order is never reshuffled.
	startingPlayerMode?: "default" | "random" | "manual";
	startingPlayerId?: string;
}

export interface PublicRoom {
	code: string;
	hostId: string;
	status: RoomStatus;
	config: GameConfig;
	teams: Record<TeamColor, PublicTeam>;
	// Players who have joined but not yet picked a team (the "pending" pool).
	unassigned: PublicPlayer[];
	currentPlayerId?: string;
	deckCount?: number;
	lastPlayedCard?: Card;
	lastPlayedBy?: string;
	sequences: Record<TeamColor, number>;
	winnerTeam?: TeamColor;
}

export interface SessionResync {
	roomCode: string;
	playerId: string;
	room: PublicRoom;
	hand: Card[];
	currentPlayerId?: string;
	timerSetting: TimerSetting;
	remaining: number;
}

export interface PublicTeam {
	color: TeamColor;
	players: PublicPlayer[];
	maxPlayers: number;
}

export interface PublicPlayer {
	id: string;
	name: string;
	teamColor: TeamColor | null;
	cardCount: number;
}

export interface HandUpdate {
	hand: Card[];
}
