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
}

export interface PublicRoom {
	code: string;
	hostId: string;
	status: RoomStatus;
	config: GameConfig;
	teams: Record<TeamColor, PublicTeam>;
	currentPlayerId?: string;
	deckCount?: number;
	lastPlayedCard?: Card;
	sequences: Record<TeamColor, number>;
	winnerTeam?: TeamColor;
}

export interface PublicTeam {
	color: TeamColor;
	players: PublicPlayer[];
	maxPlayers: number;
}

export interface PublicPlayer {
	id: string;
	name: string;
	teamColor: TeamColor;
	cardCount: number;
}

export interface HandUpdate {
	hand: Card[];
}
