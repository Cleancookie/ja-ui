/**
 * ja-ui — fzf-style fuzzy matching.
 *
 * A subsequence matcher with the bonuses that make fzf feel right: a hit at a
 * word boundary beats one mid-word, a tight run beats a scattered one, and a
 * gap costs more the wider it gets. Space-separated terms are ANDed, so
 * "usr set" finds "User settings".
 *
 * Everything here is allocation-light and single-pass — it runs over every
 * candidate on every keystroke, so it has to stay O(haystack).
 */

/** Characters that start a new "word" — a hit just after one scores well. */
const SEPARATORS = "/\\-_ .:,()[]{}#@|>+";

const SCORE_MATCH = 16;
const BONUS_FIRST = 22; // the very first character of the text
const BONUS_BOUNDARY = 18; // just after a separator
const BONUS_CAMEL = 14; // the C in "openCommandPalette"
const BONUS_CONSECUTIVE = 12; // no gap since the previous hit
const PENALTY_GAP_START = -6;
const PENALTY_GAP_EXTEND = -1;
const MAX_GAP_PENALTY = 12;

/** Matches outside the primary region (keywords, description) count for less. */
const SECONDARY_WEIGHT = 0.35;

const isSeparator = (char) => SEPARATORS.includes(char);

const isCamelBoundary = (text, pos) => {
  if (pos === 0) return false;
  const prev = text[pos - 1];
  const here = text[pos];
  return prev === prev.toLowerCase() && prev !== prev.toUpperCase() && here !== here.toLowerCase();
};

/**
 * Walk forward far enough to prove `needle` is a subsequence of `hay`.
 * Returns the index one past the last matched character, or -1.
 * Both arguments must already be lowercase.
 */
export function subsequenceEnd(hay, needle) {
  const hayLength = hay.length;
  const needleLength = needle.length;
  if (needleLength > hayLength) return -1;
  let n = 0;
  for (let h = 0; h < hayLength; h += 1) {
    if (hay.charCodeAt(h) === needle.charCodeAt(n)) {
      n += 1;
      if (n === needleLength) return h + 1;
    }
  }
  return -1;
}

/**
 * Positions of the tightest match that ends where the forward scan ended —
 * fzf's two-pass trick. Cheaper than the full alignment matrix and picks the
 * same run in almost every real case.
 */
function tightestPositions(hay, needle) {
  const end = subsequenceEnd(hay, needle);
  if (end === -1) return null;
  const positions = new Array(needle.length);
  let n = needle.length - 1;
  for (let h = end - 1; h >= 0 && n >= 0; h -= 1) {
    if (hay.charCodeAt(h) === needle.charCodeAt(n)) {
      positions[n] = h;
      n -= 1;
    }
  }
  return positions;
}

/** Score one run of positions against the original-case text. */
function scorePositions(text, positions, primaryLength) {
  let score = 0;
  let previous = -2;
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    let hit = SCORE_MATCH;
    if (pos === 0) hit += BONUS_FIRST;
    else if (isSeparator(text[pos - 1])) hit += BONUS_BOUNDARY;
    else if (isCamelBoundary(text, pos)) hit += BONUS_CAMEL;

    if (pos === previous + 1) hit += BONUS_CONSECUTIVE;
    else if (previous >= 0) {
      const gap = Math.min(pos - previous - 1, MAX_GAP_PENALTY);
      hit += PENALTY_GAP_START + PENALTY_GAP_EXTEND * gap;
    }

    score += pos < primaryLength ? hit : hit * SECONDARY_WEIGHT;
    previous = pos;
  }
  return score;
}

/**
 * Match `query` against `text`.
 *
 * @param {string} text            The haystack, in its original case.
 * @param {string[]} terms         Lowercased query terms — see `parseQuery`.
 * @param {object} [options]
 * @param {string} [options.lowerText]     Pre-lowered `text`, cached by the caller.
 * @param {number} [options.primaryLength] Characters at the start of `text` that
 *   are the "real" label; anything past it (keywords, description) scores less
 *   and is never reported as a highlight position.
 * @returns {{ score: number, positions: number[] } | null}
 */
export function fuzzyMatch(text, terms, options = {}) {
  const lowerText = options.lowerText ?? text.toLowerCase();
  const primaryLength = options.primaryLength ?? text.length;
  if (!terms.length) return { score: 0, positions: [] };

  let score = 0;
  let merged = null;

  for (let t = 0; t < terms.length; t += 1) {
    const positions = tightestPositions(lowerText, terms[t]);
    if (!positions) return null;
    score += scorePositions(text, positions, primaryLength);
    if (merged === null) merged = positions;
    else merged = merged.concat(positions);
  }

  if (terms.length > 1) merged.sort((a, b) => a - b);
  // Highlights only ever point at the visible label.
  const positions = merged[merged.length - 1] < primaryLength
    ? merged
    : merged.filter((pos) => pos < primaryLength);

  return { score, positions };
}

/** Split a raw query into lowercase AND-ed terms. */
export const parseQuery = (query) => query.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * Filter and rank a list of strings. Handy on its own; the command palette
 * uses the pieces above directly so it can keep its own caches.
 *
 * @returns {{ index: number, score: number, positions: number[] }[]}
 */
export function fuzzyFilter(texts, query) {
  const terms = parseQuery(query);
  const results = [];
  for (let i = 0; i < texts.length; i += 1) {
    const match = fuzzyMatch(texts[i], terms);
    if (match) results.push({ index: i, score: match.score, positions: match.positions });
  }
  if (terms.length) {
    results.sort(
      (a, b) => b.score - a.score || texts[a.index].length - texts[b.index].length || a.index - b.index
    );
  }
  return results;
}
