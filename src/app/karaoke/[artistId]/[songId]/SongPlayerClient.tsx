"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getArtist, getSong } from "@/data/catalog";
import { BrandMark } from "@/components/BrandMark";
import { InstrumentalBadge } from "@/components/karaoke/InstrumentalBadge";
import { KaraokePlayer } from "@/components/karaoke/KaraokePlayer";
import { useLocale } from "@/lib/locale";
import { difficultyLabel } from "@/lib/i18n";

export default function SongPlayerClient() {
  const { t, locale } = useLocale();
  const params = useParams<{ artistId: string; songId: string }>();
  const artist = getArtist(params.artistId);
  const song = getSong(params.songId);

  if (!artist || !song || song.artistId !== artist.id) {
    return (
      <main className="px-6 py-10">
        <Link href="/karaoke">{t("back")}</Link>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <BrandMark />
        <Link
          href={`/karaoke/${artist.id}`}
          className="text-sm text-white/50 hover:text-white"
        >
          {t("back")}
        </Link>
      </div>

      <div className="mb-8 text-center">
        <p className="text-sm text-white/45">{artist.name}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--cream)]">
          {song.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <InstrumentalBadge />
          <span className="text-xs uppercase tracking-[0.2em] text-white/35">
            {difficultyLabel(locale, song.difficulty)}
          </span>
        </div>
        <p className="mt-3 text-sm text-white/45">{t("instrumentalHint")}</p>
      </div>

      <KaraokePlayer song={song} />
    </main>
  );
}
