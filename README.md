# Sequence Companion App — Client

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=flat&logo=vercel)](https://your-vercel-url.vercel.app)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/CSS-Tailwind%20CSS%20v4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=flat&logo=socket.io)](https://socket.io)

The frontend for the Sequence Companion App — a real-time multiplayer companion for the Sequence board game. Players create or join rooms, form teams, and track gameplay together using a shared live session.

> The server is in a separate repository: [Sequence-Companion-App-server](https://github.com/mikeislas06/Sequence-Companion-App-server).

## Table of Contents

- [Technologies](#technologies)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Live Demo](#live-demo)

## Technologies

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Real-time:** Socket.IO Client v4
- **Animation:** Framer Motion
- **Linting:** ESLint (Next.js config)

## Features

- Create or join game rooms with a short code
- Team assignment and lobby management
- Real-time hand display with pip-accurate playing card UI
- Play cards, track sequences, and detect game-over conditions
- Sequence row tracker (host-controlled)
- Play Again / Return to Lobby flow
- Mobile-first responsive layout

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- The companion server running locally or deployed (see [Sequence-Companion-App-server](https://github.com/mikeislas06/Sequence-Companion-App-server))

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/mikeislas06/Sequence-Companion-App-client.git
cd Sequence-Companion-App-client
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Create a `.env.local` file at the root of the `client` folder:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

> For production, replace with your deployed server URL (e.g. Railway).

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                 | Description                 | Default                 |
| ------------------------ | --------------------------- | ----------------------- |
| `NEXT_PUBLIC_SERVER_URL` | URL of the Socket.IO server | `http://localhost:3001` |

## Scripts

| Script          | Description                                   |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Start Next.js dev server with hot reload      |
| `npm run build` | Build for production                          |
| `npm run start` | Run production build (requires `build` first) |
| `npm run lint`  | Run ESLint                                    |

## Project Structure

```
client/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home — create or join a room
│   ├── lobby/[code]/     # Lobby — waiting room before game starts
│   ├── game/[code]/      # Game — active session
│   └── game-over/        # Results screen
├── components/
│   ├── game/             # CardItem, HandDisplay, DiscardPile, SequenceTracker
│   ├── lobby/            # TeamPanel
│   └── ui/               # Shared UI (Spinner, etc.)
├── lib/
│   ├── socket.ts         # Socket.IO singleton client
│   ├── game-types.ts     # Shared TypeScript types
│   └── card-utils.ts     # Suit/rank helpers
└── public/
```

## Live Demo

The app is deployed on Vercel:

[Sequence Companion App](https://sequence-companion.vercel.app/)

The server is deployed on Railway — no local setup needed to try the live version.
