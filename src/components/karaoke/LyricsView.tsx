"use client";

import type { LyricLine } from "@/data/types";

export function LyricsView({
  lyrics,
  currentMs,
  blankLineIndex,
  blankLineIndexes,
  hideBlankText,
}: {
  lyrics: LyricLine[];
  currentMs: number;
  blankLineIndex?: number | null;
  blankLineIndexes?: number[];
  hideBlankText?: boolean;
}) {
  const active = lyrics.findIndex(
    (l) => currentMs >= l.startMs && currentMs < l.endMs,
  );
  const hidden = new Set(blankLineIndexes ?? []);
  if (hideBlankText && blankLineIndex != null) hidden.add(blankLineIndex);

  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden px-4">
      <ul className="flex flex-col gap-3 py-8 text-center">
        {lyrics.map((line, i) => {
          const isActive = i === active;
          const isBlank = hidden.has(i);
          return (
            <li
              key={`${line.startMs}-${i}`}
              className={[
                "lyric-line transition-all duration-300",
                isActive
                  ? "scale-105 text-2xl font-semibold text-[var(--accent)] sm:text-3xl"
                  : "text-lg text-white/45 sm:text-xl",
                isActive ? "lyric-pulse" : "",
              ].join(" ")}
            >
              {isBlank ? (
                <span className="tracking-widest text-[var(--accent)]">————</span>
              ) : (
                line.text
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
