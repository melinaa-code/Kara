import { Suspense } from "react";
import { songs } from "@/data/catalog";
import SongPlayerClient from "./SongPlayerClient";

export function generateStaticParams() {
  return songs.map((s) => ({ artistId: s.artistId, songId: s.id }));
}

export default function KaraokeSongPage() {
  return (
    <Suspense
      fallback={<main className="px-6 py-10 text-white/50">…</main>}
    >
      <SongPlayerClient />
    </Suspense>
  );
}
