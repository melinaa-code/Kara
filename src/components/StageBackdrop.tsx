export function StageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,168,72,0.28),transparent_55%),radial-gradient(ellipse_at_80%_60%,rgba(196,74,54,0.18),transparent_45%),linear-gradient(180deg,#120d0a_0%,#1a1410_40%,#0c0908_100%)]" />
      <div className="stage-beams absolute inset-0 opacity-70" />
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.55%22/></svg>')]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
