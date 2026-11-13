import { Suspense } from "react";
import { artists } from "@/data/catalog";
import ArtistSongsClient from "./ArtistSongsClient";

export function generateStaticParams() {
  return artists.map((a) => ({ artistId: a.id }));
}

export default function ArtistSongsPage() {
  return (
    <Suspense
      fallback={
        <main className="px-6 py-10 text-white/50">…</main>
      }
    >
      <ArtistSongsClient />
    </Suspense>
  );
}
