export type Locale = "fa" | "en";
export type Difficulty = "easy" | "mid" | "hard";

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
  audioUrl: string;
  durationMs: number;
  lyrics: LyricLine[];
  blanks: Blank[];
};
