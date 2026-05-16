import type { Metadata } from "next";
import { Inter, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
	title: "Sequence Companion",
	description: "Real-time companion app for the Sequence board game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				className={`${inter.variable} ${cinzel.variable} ${playfair.variable} bg-board-green min-h-screen font-body text-text-primary`}
			>
				{children}
			</body>
		</html>
	);
}
