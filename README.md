# Lyricue

Karaoke and missing-line battles. Pick a singer, sing along, or run a local party tournament (Easy → Mid → Hard) where players fill paused lyric blanks.

## Modes

- **Karaoke** — singer → song → synced lyrics
- **Line Battle** — add players, chooser picks a song per round, turn-based blanks, elimination, leaderboard

## Stack

Next.js (App Router), TypeScript, Tailwind, Zustand. First locale: Persian (`fa`), with English UI strings and locale-tagged catalog for expansion.

## Develop

```bash
npm install
npm run dev
```

Optional: set `OPENAI_API_KEY` for Whisper speech-to-text on blanks. Without it, players can type answers.

## Demo content

Sample artists and original demo lyrics ship with simple generated melody beds under `public/audio/`. Replace with licensed tracks when ready.
