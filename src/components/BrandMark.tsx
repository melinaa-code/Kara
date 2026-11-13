import Link from "next/link";

export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <Link href="/" className="group inline-flex max-w-full items-baseline gap-2 no-underline">
      <span
        className={[
          "font-[family-name:var(--font-display)] tracking-tight text-[var(--accent)]",
          large
            ? "text-[clamp(2.75rem,12vw,6rem)] leading-none"
            : "text-2xl leading-none",
        ].join(" ")}
      >
        Lyricue
      </span>
    </Link>
  );
}
