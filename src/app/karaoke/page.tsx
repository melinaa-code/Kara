"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getArtists } from "@/data/catalog";
import { BrandMark } from "@/components/BrandMark";
import { useLocale } from "@/lib/locale";

export default function KaraokeArtistsPage() {
  const { t } = useLocale();
  const [q, setQ] = useState("");
  const artists = useMemo(() => {
    const all = getArtists("fa");
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((a) => a.name.toLowerCase().includes(query));
  }, [q]);

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <BrandMark />
        <Link href="/" className="text-sm text-white/50 hover:text-white">
          {t("back")}
        </Link>
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--cream)]">
        {t("singers")}
      </h1>
      <p className="mt-2 text-white/55">{t("karaokeDesc")}</p>

      <input
        className="input-field mt-8 w-full"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search")}
      />

      <ul className="mt-6 divide-y divide-white/10">
        {artists.map((a) => (
          <li key={a.id}>
            <Link
              href={`/karaoke/${a.id}`}
              className="block py-5 transition hover:text-[var(--accent)]"
            >
              <span className="block text-2xl text-[var(--cream)]">{a.name}</span>
              <span className="text-sm text-white/45">{a.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
