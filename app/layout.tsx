import type { Metadata, Viewport } from "next";
import { Inter, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { SessionResync } from "@/components/SessionResync";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
	title: "Sequence Companion",
	description: "Real-time companion app for the Sequence board game",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Sequence",
	},
	icons: {
		icon: [
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/icon-192.png", type: "image/png" },
		],
		apple: "/apple-touch-icon.png",
	},
};

export const viewport: Viewport = {
	themeColor: "#2D5A27",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				className={`${inter.variable} ${cinzel.variable} ${playfair.variable} bg-board-green min-h-screen font-body text-text-primary`}
			>
				{children}
				<SessionResync />
				<PwaRegister />
			</body>
		</html>
	);
}
