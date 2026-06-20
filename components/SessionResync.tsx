"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as socket from "@/lib/socket";

// Global session restorer. Lives in the root layout so it works no matter which
// page the user lands on — most importantly when a fully-closed PWA reopens to
// "/" while a game is still in progress. It listens for the server's
// `session:resync` snapshot, seeds the per-page caches, and navigates to the
// correct screen (lobby / game / game-over) with the live state intact.
export function SessionResync() {
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Kick a reconnect/rejoin if we have a saved session but aren't on a
		// room page yet (e.g. cold-opened the PWA to the home screen).
		const hasSession =
			typeof window !== "undefined" && !!localStorage.getItem("seq_roomCode");
		if (hasSession) socket.resync();

		// Stale session pointing at a dead room → drop it silently and make sure
		// we're on the home screen, instead of surfacing a "Room not found" error.
		const offInvalid = socket.onSessionInvalid(() => {
			socket.clearSession();
			try {
				sessionStorage.removeItem("currentRoom");
				sessionStorage.removeItem("currentHand");
				sessionStorage.removeItem("currentTurn");
			} catch {
				/* ignore */
			}
			if (pathname !== "/") router.replace("/");
		});

		const off = socket.onSessionResync((data) => {
			const { room, hand, currentPlayerId, timerSetting, roomCode, playerId } = data;

			// Seed the caches each page hydrates from on mount.
			try {
				sessionStorage.setItem("currentRoom", JSON.stringify(room));
				sessionStorage.setItem("currentHand", JSON.stringify(hand));
				sessionStorage.setItem(
					"currentTurn",
					JSON.stringify({ currentPlayerId, timerSetting }),
				);
				sessionStorage.setItem("playerId", playerId);
			} catch {
				/* storage may be unavailable in private mode — non-fatal */
			}

			let target: string;
			if (room.status === "game_over") {
				if (room.winnerTeam) sessionStorage.setItem("winnerTeam", room.winnerTeam);
				target = "/game-over";
			} else if (room.status === "in_game") {
				target = `/game/${roomCode}`;
			} else {
				target = `/lobby/${roomCode}`;
			}

			// Only navigate when we're not already on the right screen, so an
			// in-place reconnect (background→foreground) doesn't disrupt the view.
			//
			// Never pull the user OFF the home page: landing on "/" is a deliberate
			// destination (back button, reload, or wanting a fresh game). Auto-
			// redirecting from "/" used to trap players in their old room. The home
			// screen instead offers an explicit "Rejoin last game?" button. This does
			// NOT affect app/tab-switch reconnection, which happens on room pages
			// where pathname already equals target (so this redirect is skipped).
			if (pathname !== target && pathname !== "/") router.replace(target);
		});

		return () => {
			off();
			offInvalid();
		};
	}, [router, pathname]);

	return null;
}
