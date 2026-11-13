"use client";

import { useLocale } from "@/lib/locale";

export function InstrumentalBadge({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--accent)]",
        className,
      ].join(" ")}
    >
      {t("instrumental")}
    </span>
  );
}
