export type Locale = "fa" | "en";
export type Difficulty = "easy" | "mid" | "hard";

/** Only instrumental / karaoke beds are playable — no lead vocal. */
export type AudioKind = "instrumental";

export type LyricLine = {
  startMs: number;
  endMs: number;
  text: string;
};

export type Blank = {
  id: string;
  startMs: number;
  endMs: number;
  expectedText: string;
  /** line index in lyrics that contains this blank */
  lineIndex: number;
};

export type Artist = {
  id: string;
  locale: Locale;
  name: string;
  slug: string;
  tagline: string;
};

export type Song = {
  id: string;
  artistId: string;
  locale: Locale;
  title: string;
  difficulty: Difficulty;
  /** Must be instrumental karaoke bed (no singer vocal). */
  audioKind: AudioKind;
  audioUrl: string;
  durationMs: number;
  lyrics: LyricLine[];
  blanks: Blank[];
};
