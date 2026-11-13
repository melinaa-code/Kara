"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Difficulty } from "@/data/types";

export type BattlePhase =
  | "lobby"
  | "choose"
  | "countdown"
  | "playing"
  | "blank"
  | "playerResult"
  | "roundSummary"
  | "finished";

export type Player = {
  id: string;
  name: string;
  alive: boolean;
  correctBlanks: number;
  attemptedBlanks: number;
  totalScore: number;
  totalResponseMs: number;
  roundsSurvived: number;
};

type BattleState = {
  phase: BattlePhase;
  players: Player[];
  roundIndex: number;
  chooserIndex: number;
  turnOrder: string[];
  turnIndex: number;
  songId: string | null;
  blankIndex: number;
  lastBlankOk: boolean | null;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  startMatch: () => void;
  selectSong: (songId: string) => void;
  beginPlaying: () => void;
  enterBlank: () => void;
  resolveBlank: (ok: boolean, score: number, responseMs: number) => void;
  continueAfterResult: (totalBlanks: number) => void;
  advanceFromRoundSummary: () => void;
  reset: () => void;
};

export const ROUND_DIFFICULTIES: Difficulty[] = ["easy", "mid", "hard"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function alivePlayers(players: Player[]) {
  return players.filter((p) => p.alive);
}

function markRoundSurvived(players: Player[], playerId: string, roundIndex: number) {
  return players.map((p) =>
    p.id === playerId && p.alive
      ? { ...p, roundsSurvived: Math.max(p.roundsSurvived, roundIndex + 1) }
      : p,
  );
}

export const useBattleStore = create<BattleState>()(
  persist(
    (set, get) => ({
      phase: "lobby",
      players: [],
      roundIndex: 0,
      chooserIndex: 0,
      turnOrder: [],
      turnIndex: 0,
      songId: null,
      blankIndex: 0,
      lastBlankOk: null,

      addPlayer: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const { players } = get();
        if (players.length >= 8) return;
        set({
          players: [
            ...players,
            {
              id: uid(),
              name: trimmed,
              alive: true,
              correctBlanks: 0,
              attemptedBlanks: 0,
              totalScore: 0,
              totalResponseMs: 0,
              roundsSurvived: 0,
            },
          ],
        });
      },

      removePlayer: (id) => {
        set({ players: get().players.filter((p) => p.id !== id) });
      },

      startMatch: () => {
        const { players } = get();
        if (players.length < 2) return;
        const resetPlayers = players.map((p) => ({
          ...p,
          alive: true,
          correctBlanks: 0,
          attemptedBlanks: 0,
          totalScore: 0,
          totalResponseMs: 0,
          roundsSurvived: 0,
        }));
        set({
          players: resetPlayers,
          roundIndex: 0,
          chooserIndex: 0,
          turnOrder: resetPlayers.map((p) => p.id),
          turnIndex: 0,
          songId: null,
          blankIndex: 0,
          phase: "choose",
          lastBlankOk: null,
        });
      },

      selectSong: (songId) => {
        set({ songId, blankIndex: 0, phase: "countdown", lastBlankOk: null });
      },

      beginPlaying: () => set({ phase: "playing", lastBlankOk: null }),

      enterBlank: () => set({ phase: "blank" }),

      resolveBlank: (ok, score, responseMs) => {
        const state = get();
        const currentId = state.turnOrder[state.turnIndex];
        const players = state.players.map((p) => {
          if (p.id !== currentId) return p;
          return {
            ...p,
            attemptedBlanks: p.attemptedBlanks + 1,
            correctBlanks: p.correctBlanks + (ok ? 1 : 0),
            totalScore: p.totalScore + score,
            totalResponseMs: p.totalResponseMs + responseMs,
            alive: ok ? p.alive : false,
          };
        });
        set({ players, lastBlankOk: ok, phase: "playerResult" });
      },

      continueAfterResult: (totalBlanks) => {
        const state = get();
        const currentId = state.turnOrder[state.turnIndex];
        const current = state.players.find((p) => p.id === currentId);
        const failed = !current?.alive;

        const goNextPlayer = (players: Player[]) => {
          const nextTurn = state.turnIndex + 1;
          if (nextTurn >= state.turnOrder.length) {
            set({ players, phase: "roundSummary", blankIndex: 0 });
            return;
          }
          set({
            players,
            turnIndex: nextTurn,
            blankIndex: 0,
            phase: "countdown",
            lastBlankOk: null,
          });
        };

        if (failed) {
          goNextPlayer(state.players);
          return;
        }

        const nextBlank = state.blankIndex + 1;
        if (nextBlank >= totalBlanks) {
          const players = markRoundSurvived(
            state.players,
            currentId,
            state.roundIndex,
          );
          goNextPlayer(players);
          return;
        }

        set({
          blankIndex: nextBlank,
          phase: "playing",
          lastBlankOk: null,
        });
      },

      advanceFromRoundSummary: () => {
        const state = get();
        const survivors = alivePlayers(state.players);
        if (survivors.length <= 1 || state.roundIndex >= 2) {
          set({ phase: "finished" });
          return;
        }
        const nextRound = state.roundIndex + 1;
        set({
          roundIndex: nextRound,
          turnOrder: survivors.map((p) => p.id),
          turnIndex: 0,
          chooserIndex: nextRound % survivors.length,
          songId: null,
          blankIndex: 0,
          phase: "choose",
          lastBlankOk: null,
        });
      },

      reset: () => {
        set({
          phase: "lobby",
          roundIndex: 0,
          chooserIndex: 0,
          turnOrder: [],
          turnIndex: 0,
          songId: null,
          blankIndex: 0,
          lastBlankOk: null,
          players: get().players.map((p) => ({
            ...p,
            alive: true,
            correctBlanks: 0,
            attemptedBlanks: 0,
            totalScore: 0,
            totalResponseMs: 0,
            roundsSurvived: 0,
          })),
        });
      },
    }),
    {
      name: "lyricue-battle",
      partialize: (s) => ({
        players: s.players.map((p) => ({ id: p.id, name: p.name })),
      }),
      merge: (persisted, current) => {
        const p = persisted as { players?: { id: string; name: string }[] } | undefined;
        if (!p?.players?.length) return current as BattleState;
        return {
          ...current,
          players: p.players.map((x) => ({
            id: x.id,
            name: x.name,
            alive: true,
            correctBlanks: 0,
            attemptedBlanks: 0,
            totalScore: 0,
            totalResponseMs: 0,
            roundsSurvived: 0,
          })),
        } as BattleState;
      },
    },
  ),
);

export function currentPlayer(state: BattleState): Player | undefined {
  const id = state.turnOrder[state.turnIndex];
  return state.players.find((p) => p.id === id);
}

export function chooserPlayer(state: BattleState): Player | undefined {
  const survivors = alivePlayers(state.players);
  if (!survivors.length) return undefined;
  return survivors[state.chooserIndex % survivors.length];
}
