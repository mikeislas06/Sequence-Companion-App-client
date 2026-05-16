import type { Card, Suit } from "./game-types";

const SUIT_SYMBOLS: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };

export const getSuitSymbol = (suit: Suit): string => SUIT_SYMBOLS[suit];
export const isRedSuit = (suit: Suit): boolean => suit === "H" || suit === "D";
export const getCardLabel = (card: Card): string => `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
export const isJack = (card: Card): boolean => card.rank === "J";
export const isTwoEyedJack = (card: Card): boolean => card.jackType === "two-eyed";
export const isOneEyedJack = (card: Card): boolean => card.jackType === "one-eyed";
