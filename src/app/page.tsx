"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { useLocale } from "@/lib/locale";

export default function HomePage() {
  const { t, locale, setLocale } = useLocale();

  return (
    <main className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-end px-6 pt-6">
        <button
          type="button"
          className="text-xs uppercase tracking-[0.2em] text-white/45 hover:text-[var(--accent)]"
          onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
        >
          {locale === "fa" ? "EN" : "FA"}
        </button>
      </header>

      <section className="relative flex flex-1 flex-col justify-end overflow-visible px-6 pb-16 pt-10 sm:justify-center sm:pb-24">
        <div className="mx-auto w-full max-w-3xl animate-fade-up overflow-visible">
          <BrandMark large />
          <p className="mt-5 max-w-md text-lg text-white/65 sm:text-xl">
            {t("tagline")}
          </p>

          <div className="mt-12 max-w-md">
            <Link href="/karaoke" className="home-cta">
              <span className="block font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
                {t("karaoke")}
              </span>
              <span className="mt-1 block text-sm text-white/45">
                {t("karaokeDesc")}
              </span>
            </Link>
            <Link href="/battle" className="home-cta">
              <span className="block font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
                {t("battle")}
              </span>
              <span className="mt-1 block text-sm text-white/45">
                {t("battleDesc")}
              </span>
            </Link>
          </div>

          <p className="mt-10 text-xs text-white/30">{t("demoNote")}</p>
        </div>
      </section>
    </main>
  );
}
