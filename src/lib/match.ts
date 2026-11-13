import type { Difficulty } from "@/data/types";
import { normalizeText, tokenize } from "./normalize";

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function tokenF1(expected: string[], actual: string[]): number {
  if (expected.length === 0 && actual.length === 0) return 1;
  if (expected.length === 0 || actual.length === 0) return 0;
  const expSet = new Set(expected);
  let hits = 0;
  for (const t of actual) {
    if (expSet.has(t)) hits += 1;
  }
  const precision = hits / actual.length;
  const recall = hits / expected.length;
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

const thresholds: Record<Difficulty, { f1: number; maxRelEdit: number }> = {
  easy: { f1: 0.55, maxRelEdit: 0.45 },
  mid: { f1: 0.7, maxRelEdit: 0.3 },
  hard: { f1: 0.85, maxRelEdit: 0.18 },
};

export function scoreAnswer(
  expected: string,
  actual: string,
  difficulty: Difficulty,
): { ok: boolean; score: number; normalizedExpected: string; normalizedActual: string } {
  const normalizedExpected = normalizeText(expected);
  const normalizedActual = normalizeText(actual);
  if (!normalizedActual) {
    return { ok: false, score: 0, normalizedExpected, normalizedActual };
  }

  if (normalizedExpected === normalizedActual) {
    return { ok: true, score: 1, normalizedExpected, normalizedActual };
  }

  const expTokens = tokenize(expected);
  const actTokens = tokenize(actual);
  const f1 = tokenF1(expTokens, actTokens);
  const edit = levenshtein(normalizedExpected, normalizedActual);
  const relEdit =
    normalizedExpected.length === 0
      ? 1
      : edit / Math.max(normalizedExpected.length, normalizedActual.length);

  const t = thresholds[difficulty];
  const score = Math.max(0, Math.min(1, f1 * 0.7 + (1 - relEdit) * 0.3));
  const ok = f1 >= t.f1 || relEdit <= t.maxRelEdit;

  return { ok, score, normalizedExpected, normalizedActual };
}

export function blankTimeLimitSec(difficulty: Difficulty): number {
  if (difficulty === "easy") return 12;
  if (difficulty === "mid") return 10;
  return 8;
}
