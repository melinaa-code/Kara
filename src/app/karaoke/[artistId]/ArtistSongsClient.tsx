"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getArtist, getSongsByArtist } from "@/data/catalog";
import { BrandMark } from "@/components/BrandMark";
import { useLocale } from "@/lib/locale";
import { difficultyLabel } from "@/lib/i18n";

export default function ArtistSongsClient() {
  const { t, locale } = useLocale();
  const params = useParams<{ artistId: string }>();
  const artist = getArtist(params.artistId);
  const songs = getSongsByArtist(params.artistId);

  if (!artist) {
    return (
      <main className="px-6 py-10">
        <Link href="/karaoke">{t("back")}</Link>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <BrandMark />
        <Link href="/karaoke" className="text-sm text-white/50 hover:text-white">
          {t("back")}
        </Link>
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--cream)]">
        {artist.name}
      </h1>
      <p className="mt-2 text-white/55">{artist.tagline}</p>

      <h2 className="mt-10 text-sm uppercase tracking-[0.2em] text-white/40">
        {t("songs")}
      </h2>
      <ul className="mt-3 divide-y divide-white/10">
        {songs.map((s) => (
          <li key={s.id}>
            <Link
              href={`/karaoke/${artist.id}/${s.id}`}
              className="flex items-center justify-between py-5 transition hover:text-[var(--accent)]"
            >
              <span className="text-xl text-[var(--cream)]">{s.title}</span>
              <span className="text-xs text-white/40">
                {difficultyLabel(locale, s.difficulty)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
