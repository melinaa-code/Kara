"use client";

import { useEffect, useRef, useState } from "react";
import type { Song } from "@/data/types";
import { useLocale } from "@/lib/locale";
import { LyricsView } from "./LyricsView";

export function KaraokePlayer({ song }: { song: Song }) {
  const { t } = useLocale();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentMs(audio.currentTime * 1000);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      await audio.play();
      setPlaying(true);
    }
  };

  const restart = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentMs(0);
    await audio.play();
    setPlaying(true);
  };

  const progress = Math.min(100, (currentMs / song.durationMs) * 100);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <audio ref={audioRef} src={song.audioUrl} preload="auto" />
      <div className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <LyricsView lyrics={song.lyrics} currentMs={currentMs} />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" className="btn-primary" onClick={toggle}>
          {playing ? t("pause") : t("play")}
        </button>
        <button type="button" className="btn-ghost" onClick={restart}>
          {t("restart")}
        </button>
      </div>
    </div>
  );
}
