"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getArtist, getSong, getSongsByDifficulty } from "@/data/catalog";
import { BrandMark } from "@/components/BrandMark";
import { LyricsView } from "@/components/karaoke/LyricsView";
import { BlankChallenge } from "@/components/battle/BlankChallenge";
import { useLocale } from "@/lib/locale";
import { difficultyLabel } from "@/lib/i18n";
import {
  ROUND_DIFFICULTIES,
  chooserPlayer,
  currentPlayer,
  useBattleStore,
} from "@/store/battle";

export function BattlePlay() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const state = useBattleStore();
  const player = currentPlayer(state);
  const chooser = chooserPlayer(state);
  const difficulty = ROUND_DIFFICULTIES[state.roundIndex];
  const song = state.songId ? getSong(state.songId) : undefined;
  const blank = song?.blanks[state.blankIndex];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const enteredBlank = useRef(false);

  useEffect(() => {
    if (state.phase === "lobby") router.replace("/battle");
  }, [state.phase, router]);

  // Audio playback + blank detection
  useEffect(() => {
    if (state.phase !== "playing" || !song || !audioRef.current) return;
    const audio = audioRef.current;
    enteredBlank.current = false;

    const onTime = () => {
      const ms = audio.currentTime * 1000;
      setCurrentMs(ms);
      const b = song.blanks[state.blankIndex];
      if (!b || enteredBlank.current) return;
      if (ms >= b.startMs) {
        enteredBlank.current = true;
        audio.pause();
        audio.currentTime = b.startMs / 1000;
        setCurrentMs(b.startMs);
        state.enterBlank();
      }
    };

    const onEnded = () => {
      // finished song without more blanks — treat as survive remaining
      useBattleStore.getState().continueAfterResult(song.blanks.length);
    };

    audio.currentTime =
      state.blankIndex === 0
        ? 0
        : (song.blanks[state.blankIndex - 1]?.endMs ?? 0) / 1000;
    void audio.play();
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.blankIndex, state.turnIndex, song?.id]);

  const pool = useMemo(
    () => getSongsByDifficulty(difficulty, "fa"),
    [difficulty],
  );

  const survivors = state.players.filter((p) => p.alive);
  const leaderboard = [...state.players].sort((a, b) => {
    if (b.roundsSurvived !== a.roundsSurvived)
      return b.roundsSurvived - a.roundsSurvived;
    if (b.correctBlanks !== a.correctBlanks)
      return b.correctBlanks - a.correctBlanks;
    return b.totalScore - a.totalScore;
  });

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <BrandMark />
        <div className="text-sm text-white/50">
          {t("round")} {difficultyLabel(locale, difficulty)} · {t("survivors")}{" "}
          {survivors.length}
        </div>
      </div>

      {song && <audio ref={audioRef} src={song.audioUrl} preload="auto" />}

      {state.phase === "choose" && (
        <section className="animate-fade-up flex flex-col gap-6">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--cream)]">
              {t("chooseSong")}
            </h1>
            <p className="mt-2 text-white/55">
              {chooser?.name} · {difficultyLabel(locale, difficulty)}
            </p>
          </div>
          <ul className="flex flex-col divide-y divide-white/10">
            {pool.map((s) => {
              const artist = getArtist(s.artistId);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-start transition hover:text-[var(--accent)]"
                    onClick={() => state.selectSong(s.id)}
                  >
                    <span>
                      <span className="block text-lg text-[var(--cream)]">
                        {s.title}
                      </span>
                      <span className="text-sm text-white/45">{artist?.name}</span>
                    </span>
                    <span className="text-xs uppercase tracking-wider text-white/35">
                      {difficultyLabel(locale, s.difficulty)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {state.phase === "countdown" && player && (
        <TurnCountdown
          key={`${state.turnIndex}-${state.roundIndex}`}
          playerName={player.name}
          songTitle={song?.title}
          yourTurnLabel={t("yourTurn")}
          readyLabel={t("countdown")}
          onDone={() => {
            enteredBlank.current = false;
            state.beginPlaying();
          }}
        />
      )}

      {(state.phase === "playing" || state.phase === "blank") && song && (
        <section className="animate-fade-up flex flex-col gap-4">
          <div className="text-center">
            <p className="text-sm text-white/45">
              {t("yourTurn")} {player?.name}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--cream)]">
              {song.title}
            </h2>
            <p className="text-sm text-white/40">
              {t("blanksLeft")}{" "}
              {Math.max(0, song.blanks.length - state.blankIndex)}
            </p>
          </div>
          <LyricsView
            lyrics={song.lyrics}
            currentMs={currentMs}
            blankLineIndexes={song.blanks
              .slice(state.blankIndex)
              .map((b) => b.lineIndex)}
          />
          {state.phase === "blank" && blank && (
            <BlankChallenge
              key={`${state.turnIndex}-${state.blankIndex}`}
              expectedText={blank.expectedText}
              difficulty={difficulty}
              localeLang={locale}
              onResolved={({ ok, score, responseMs }) => {
                state.resolveBlank(ok, score, responseMs);
              }}
            />
          )}
        </section>
      )}

      {state.phase === "playerResult" && (
        <section className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
          <p
            className={[
              "font-[family-name:var(--font-display)] text-5xl",
              state.lastBlankOk ? "text-[var(--success)] result-flash" : "text-[var(--danger)] result-flash",
            ].join(" ")}
          >
            {state.lastBlankOk ? t("correct") : t("wrong")}
          </p>
          <p className="text-white/55">
            {state.lastBlankOk ? player?.name : `${player?.name} — ${t("eliminated")}`}
          </p>
          {!state.lastBlankOk && (
            <p className="text-sm text-white/40">{t("passDevice")}</p>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              state.continueAfterResult(song?.blanks.length ?? 0)
            }
          >
            {t("start")}
          </button>
        </section>
      )}

      {state.phase === "roundSummary" && (
        <section className="animate-fade-up flex flex-col gap-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--cream)]">
            {t("roundSummary")}
          </h1>
          <ul className="divide-y divide-white/10">
            {state.players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-3 text-[var(--cream)]"
              >
                <span>{p.name}</span>
                <span
                  className={
                    p.alive ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }
                >
                  {p.alive ? t("advanced") : t("eliminated")}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-primary"
            onClick={() => state.advanceFromRoundSummary()}
          >
            {survivors.length <= 1 || state.roundIndex >= 2
              ? t("finish")
              : t("nextRound")}
          </button>
        </section>
      )}

      {state.phase === "finished" && (
        <section className="animate-fade-up flex flex-col gap-8 py-6 text-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">
              {t("winner")}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[var(--accent)]">
              {leaderboard[0]?.alive
                ? leaderboard[0].name
                : leaderboard[0]?.name ?? "—"}
            </h1>
          </div>
          <div>
            <h2 className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
              {t("leaderboard")}
            </h2>
            <ol className="divide-y divide-white/10 text-start">
              {leaderboard.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-3 text-[var(--cream)]"
                >
                  <span>
                    <span className="me-3 text-white/35">{i + 1}</span>
                    {p.name}
                  </span>
                  <span className="text-sm text-white/45">
                    {t("score")} {p.correctBlanks}/{p.attemptedBlanks || 0}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                state.reset();
                state.startMatch();
              }}
            >
              {t("playAgain")}
            </button>
            <Link href="/" className="btn-ghost text-center">
              {t("back")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function TurnCountdown({
  playerName,
  songTitle,
  yourTurnLabel,
  readyLabel,
  onDone,
}: {
  playerName: string;
  songTitle?: string;
  yourTurnLabel: string;
  readyLabel: string;
  onDone: () => void;
}) {
  const [countdown, setCountdown] = useState(3);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          onDoneRef.current();
          return 0;
        }
        return c - 1;
      });
    }, 700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-sm uppercase tracking-[0.25em] text-white/45">
        {yourTurnLabel}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-5xl text-[var(--cream)]">
        {playerName}
      </h2>
      <p className="text-white/50">{songTitle}</p>
      <div className="mt-6 text-6xl font-semibold text-[var(--accent)]">
        {countdown || readyLabel}
      </div>
    </section>
  );
}
