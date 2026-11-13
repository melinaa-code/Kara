# Lyricue

Karaoke and missing-line battles. Pick a singer, sing along to an **instrumental** bed with synced lyrics, or run a local party tournament (Easy → Mid → Hard) where players fill paused lyric blanks.

## Modes

- **Karaoke** — singer → song → instrumental audio + synced lyrics (you sing)
- **Line Battle** — add players, chooser picks a song per round, turn-based blanks, elimination, leaderboard

## Audio rule

Playable tracks are **instrumental / karaoke beds only** (`audioKind: "instrumental"`) — no lead singer vocal. Lyrics highlight on top of that bed.

## Stack

Next.js (App Router), TypeScript, Tailwind, Zustand. First locale: Persian (`fa`), with English UI strings and locale-tagged catalog for expansion.

## Develop

```bash
npm install
npm run dev
```

Optional: set `OPENAI_API_KEY` for Whisper speech-to-text on blanks. Without it, players can type answers.

## Demo content

Sample artists and original demo lyrics ship with generated instrumental melody beds under `public/audio/`. Replace with licensed instrumental/karaoke tracks when ready.
