"use client";

import { useEffect, useRef, useState } from "react";
import type { Difficulty } from "@/data/types";
import { blankTimeLimitSec, scoreAnswer } from "@/lib/match";
import { useLocale } from "@/lib/locale";

type Result = {
  ok: boolean;
  score: number;
  responseMs: number;
  heard: string;
};

export function BlankChallenge({
  expectedText,
  difficulty,
  localeLang,
  onResolved,
}: {
  expectedText: string;
  difficulty: Difficulty;
  localeLang: string;
  onResolved: (r: Result) => void;
}) {
  const { t } = useLocale();
  const limit = blankTimeLimitSec(difficulty);
  const [secondsLeft, setSecondsLeft] = useState(limit);
  const [typed, setTyped] = useState("");
  const typedRef = useRef("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const startedAt = useRef(0);
  const done = useRef(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onResolvedRef = useRef(onResolved);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  function finish(heard: string) {
    if (done.current) return;
    done.current = true;
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    const responseMs = Date.now() - (startedAt.current || Date.now());
    const { ok, score } = scoreAnswer(expectedText, heard, difficulty);
    onResolvedRef.current({ ok, score, responseMs, heard });
  }

  useEffect(() => {
    startedAt.current = Date.now();
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tick);
          finish(typedRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
    // finish reads refs; intentional once-on-mount timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function startMic() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus(t("noMic"));
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        const recorder = new MediaRecorder(stream);
        mediaRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size) chunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((tr) => tr.stop());
          if (done.current) return;
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          if (blob.size < 1000) return;
          try {
            const fd = new FormData();
            fd.append("audio", blob, "answer.webm");
            fd.append("language", localeLang);
            const res = await fetch("/api/stt", { method: "POST", body: fd });
            const data = (await res.json()) as { text?: string; error?: string };
            if (data.text) {
              typedRef.current = data.text;
              setTyped(data.text);
              finish(data.text);
            } else if (data.error) {
              setStatus(t("sttUnavailable"));
            }
          } catch {
            setStatus(t("sttUnavailable"));
          }
        };
        recorder.start();
        setListening(true);
        window.setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
          setListening(false);
        }, Math.max(2000, (limit - 2) * 1000));
      } catch {
        setStatus(t("noMic"));
      }
    }
    void startMic();
    return () => {
      cancelled = true;
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, localeLang, t]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-4">
      <div
        className={[
          "flex h-20 w-20 items-center justify-center rounded-full border-2 text-2xl font-semibold",
          secondsLeft <= 3
            ? "border-[var(--danger)] text-[var(--danger)]"
            : "border-[var(--accent)] text-[var(--accent)]",
        ].join(" ")}
      >
        {secondsLeft}
      </div>
      <p className="text-center text-sm text-white/60">
        {listening ? t("listening") : status ?? t("typeFallback")}
      </p>
      <div className="w-full">
        <label className="sr-only" htmlFor="blank-answer">
          {t("typeFallback")}
        </label>
        <input
          id="blank-answer"
          className="input-field w-full text-center text-lg"
          value={typed}
          onChange={(e) => {
            typedRef.current = e.target.value;
            setTyped(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") finish(typedRef.current);
          }}
          placeholder="…"
          autoComplete="off"
          autoFocus
        />
      </div>
      <button type="button" className="btn-primary" onClick={() => finish(typedRef.current)}>
        {t("submit")}
      </button>
    </div>
  );
}
