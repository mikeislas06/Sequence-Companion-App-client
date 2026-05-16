import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				"board-green": "#2D5A27",
				"board-green-light": "#3D7A35",
				"surface-dark": "#1A3A17",
				cream: "#F5E6C8",
				"text-primary": "#F5E6C8",
				"text-muted": "#A8C5A0",
				"team-green": "#4CAF50",
				"team-blue": "#2196F3",
				"team-red": "#F44336",
				gold: "#FFD700",
				danger: "#FF5252",
			},
			fontFamily: {
				display: ["Cinzel", "serif"],
				body: ["Inter", "sans-serif"],
				card: ["Playfair Display", "serif"],
			},
			keyframes: {
				"pulse-glow": {
					"0%, 100%": { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.7)" },
					"50%": { boxShadow: "0 0 0 8px rgba(76, 175, 80, 0)" },
				},
			},
			animation: {
				"pulse-glow": "pulse-glow 2s ease-in-out infinite",
			},
		},
	},
	plugins: [],
};

export default config;
