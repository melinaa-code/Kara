/** Normalize lyric text for fuzzy comparison (Persian + Latin). */
export function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/\u200c/g, " ") // ZWNJ → space
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ی")
    .replace(/[ًٌٍَُِّْٰ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function tokenize(input: string): string[] {
  const n = normalizeText(input);
  return n ? n.split(" ") : [];
}
