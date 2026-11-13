"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { useLocale } from "@/lib/locale";
import { useBattleStore } from "@/store/battle";

export function BattleLobby() {
  const { t } = useLocale();
  const router = useRouter();
  const players = useBattleStore((s) => s.players);
  const addPlayer = useBattleStore((s) => s.addPlayer);
  const removePlayer = useBattleStore((s) => s.removePlayer);
  const startMatch = useBattleStore((s) => s.startMatch);
  const [name, setName] = useState("");

  const onAdd = () => {
    addPlayer(name);
    setName("");
  };

  const onStart = () => {
    startMatch();
    router.push("/battle/play");
  };

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <BrandMark />
        <Link href="/" className="text-sm text-white/50 hover:text-white">
          {t("back")}
        </Link>
      </div>

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--cream)]">
          {t("battle")}
        </h1>
        <p className="mt-2 text-white/60">{t("addPlayers")}</p>
      </div>

      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder={t("playerName")}
          maxLength={24}
        />
        <button
          type="button"
          className="btn-primary shrink-0"
          onClick={onAdd}
          disabled={!name.trim() || players.length >= 8}
        >
          {t("add")}
        </button>
      </div>

      {players.length >= 8 && (
        <p className="text-sm text-[var(--accent)]">{t("maxPlayers")}</p>
      )}

      <ul className="flex flex-col gap-2">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center justify-between border-b border-white/10 py-3"
          >
            <span className="text-lg text-[var(--cream)]">
              <span className="me-3 text-white/35">{i + 1}</span>
              {p.name}
            </span>
            <button
              type="button"
              className="text-sm text-white/40 hover:text-[var(--danger)]"
              onClick={() => removePlayer(p.id)}
            >
              {t("remove")}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="btn-primary w-full py-4 text-lg"
        onClick={onStart}
        disabled={players.length < 2}
      >
        {t("start")}
      </button>
      {players.length < 2 && (
        <p className="text-center text-sm text-white/45">{t("needPlayers")}</p>
      )}
    </div>
  );
}
