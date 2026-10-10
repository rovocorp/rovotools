/**
 * Word-unscrambler engine (LOCAL, offline-capable, no I/O).
 *
 * Ships an ENABLE-derived core word list (public domain). ENABLE is the
 * public-domain base dictionary Words With Friends was built on; it is
 * close to — but deliberately not identical to — the proprietary
 * tournament lists (TWL/NWL, SOWPODS/CSW) and the WWF list, which cannot
 * be redistributed. Tool copy must say so.
 *
 * Matching is a frequency-map subset check per word — O(n · L) with tiny
 * constants — plus wildcard expansion for `?`/`*` blanks.
 */

export interface UnscrambleOptions {
  readonly mode: "all" | "exact";
  readonly minLength: number;
  readonly maxLength: number;
  readonly limit: number;
  readonly sort: "length" | "score";
}

export interface UnscrambledWord {
  readonly word: string;
  readonly length: number;
  readonly scrabble: number;
  readonly wwf: number;
}

const SCRABBLE_VALUES: Record<string, number> = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8,
  k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1,
  u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
};

// Words With Friends face values (approximate; game rules change rarely).
const WWF_VALUES: Record<string, number> = {
  a: 1, b: 4, c: 4, d: 2, e: 1, f: 4, g: 3, h: 3, i: 1, j: 10,
  k: 5, l: 2, m: 4, n: 2, o: 1, p: 4, q: 10, r: 1, s: 1, t: 1,
  u: 2, v: 5, w: 4, x: 8, y: 3, z: 10,
};

export function scoreWord(word: string, table: Record<string, number>): number {
  let total = 0;
  for (const ch of word) {
    total += table[ch] ?? 0;
  }
  return total;
}

export function scrabbleScore(word: string): number {
  return scoreWord(word, SCRABBLE_VALUES);
}

export function wwfScore(word: string): number {
  return scoreWord(word, WWF_VALUES);
}

/**
 * Curated ENABLE-derived core list: everyday vocabulary plus the classic
 * high-value game words (qi, za, qat, ex, ox, ax). The full 169k ENABLE 2K
 * list is the documented v2 upgrade (lazy JSON chunk); this core keeps the
 * shared bundle untouched and every solve instant.
 */
export const ENABLE_CORE_WORDS: ReadonlyArray<string> = [
  "ad", "am", "an", "as", "at", "ax", "be", "by", "do", "ex", "go", "he", "hi",
  "id", "if", "in", "is", "it", "me", "my", "no", "of", "on", "or", "ox", "qi",
  "so", "to", "up", "us", "we", "za",
  "act", "add", "age", "ago", "aid", "ail", "aim", "air", "ale", "and", "ant",
  "ape", "apt", "arc", "are", "ark", "arm", "art", "ash", "ask", "ate", "awe",
  "axe", "bad", "bag", "ban", "bar", "bat", "bay", "bed", "bee", "beg", "bet",
  "bid", "big", "bin", "bio", "bit", "bog", "boo", "bop", "bot", "bow", "box",
  "boy", "bra", "bud", "bug", "bun", "bus", "but", "buy", "cab", "can", "cap",
  "car", "cat", "cob", "cod", "cog", "con", "coo", "cop", "cot", "cow", "cox",
  "coy", "cry", "cub", "cup", "cur", "cut", "dab", "dad", "dam", "day", "den",
  "dew", "did", "die", "dig", "dim", "din", "dip", "doc", "dog", "dot", "dry",
  "dub", "dud", "due", "dug", "ear", "eat", "ebb", "eco", "ego", "elf", "elk",
  "elm", "end", "era", "ere", "err", "eve", "ewe", "eye", "fan", "far", "fat",
  "fax", "fed", "fee", "fen", "few", "fig", "fin", "fir", "fit", "fix", "flu",
  "fly", "fog", "for", "fox", "fry", "fun", "fur", "gab", "gag", "gal", "gap",
  "gas", "gel", "gem", "get", "gig", "gin", "got", "gum", "gut", "guy", "gym",
  "had", "ham", "has", "hat", "hay", "hem", "hen", "her", "hey", "him", "hip",
  "his", "hit", "hog", "hop", "hot", "how", "hub", "hug", "hum", "hut", "ice",
  "icy", "ill", "ink", "inn", "ion", "ire", "irk", "ism", "ivy", "jab", "jam",
  "jar", "jaw", "jay", "jet", "jig", "job", "jog", "joy", "jug", "jut", "key",
  "kid", "kin", "kit", "qat", "qis", "qua", "quiz", "quota", "lab", "lad",
  "lag", "lap", "law", "lax", "lay", "lea", "led", "lee", "leg", "lei", "let",
  "lid", "lie", "lip", "lit", "lob", "log", "lot", "low", "mac", "mad", "man",
  "map", "mar", "mat", "max", "may", "men", "met", "mix", "mob", "mop", "mow",
  "mud", "mug", "nag", "nap", "net", "new", "nil", "nip", "nod", "nor", "not",
  "now", "oak", "oar", "oat", "odd", "off", "oft", "oil", "old", "ole", "one",
  "orb", "ore", "our", "out", "ova", "owe", "owl", "own", "pad", "pal", "pan",
  "pap", "par", "pat", "pay", "pea", "peg", "pen", "pep", "per", "pet", "pew",
  "pie", "pig", "pin", "pip", "pit", "ply", "pod", "pop", "pot", "pow", "pox",
  "pro", "pry", "pub", "pug", "pun", "pup", "put", "quit", "quilt", "quirk",
  "rag", "ram", "ran", "rap", "rat", "raw", "ray", "red", "ref", "rep", "rev",
  "rib", "rid", "rig", "rim", "rip", "rob", "rod", "rot", "row", "rub", "rug",
  "rum", "run", "rut", "rye", "sac", "sad", "sag", "sap", "sat", "saw", "say",
  "sea", "see", "sen", "set", "sew", "she", "shy", "sin", "sip", "sir", "sit",
  "six", "size", "ski", "sky", "sly", "sob", "sod", "son", "sow", "soy", "spa",
  "spy", "sty", "sub", "sum", "sun", "sup", "tab", "tad", "tag", "tan", "tap",
  "tar", "tea", "ten", "the", "thy", "tie", "tin", "tip", "tit", "tod", "toe",
  "tofu", "ton", "top", "tot", "tow", "toy", "try", "tub", "tug", "two", "type",
  "tyro", "ugly", "undo", "union", "unit", "unite", "until", "upper", "upset",
  "urban", "urge", "urn", "use", "usual", "vague", "valid", "value", "valve",
  "van", "vast", "vault", "veil", "vein", "verse", "verve", "vest", "vet",
  "vex", "via", "vial", "vibe", "video", "view", "vigor", "villa", "violin",
  "viral", "visa", "visor", "vista", "vital", "vivid", "vixen", "vocal",
  "vodka", "vogue", "voice", "void", "volcano", "volt", "volume", "vote",
  "vowel", "voyage", "wagon", "waist", "wait", "wake", "waken", "walk", "wall",
  "walnut", "wander", "want", "ward", "warm", "warn", "warp", "warrant",
  "waste", "watch", "water", "wattle", "wave", "waxen", "weaken", "weary",
  "weave", "wedge", "weedy", "weekly", "weigh", "weight", "weird", "welcome",
  "weld", "well", "went", "wept", "were", "whale", "wheat", "wheel", "wheeze",
  "when", "where", "which", "whiff", "while", "whim", "whine", "whirl",
  "whisk", "white", "whole", "whom", "whose", "wick", "widen", "widow",
  "width", "wield", "wife", "wiggle", "wild", "wilder", "will", "wilt", "wimp",
  "wince", "wind", "window", "wine", "wing", "wink", "winner", "winter",
  "wipe", "wire", "wisdom", "wise", "wish", "wisp", "with", "wither", "witty",
  "wizard", "wobble", "woman", "women", "wonder", "wondrous", "wood", "wooden",
  "wool", "word", "work", "world", "worry", "worse", "worth", "would", "wound",
  "woven", "wrangle", "wrap", "wrath", "wreak", "wreath", "wreck", "wren",
  "wrench", "wrest", "wrestle", "wretch", "wriggle", "wright", "wring",
  "wrinkle", "wrist", "write", "writer", "wrong", "wrote", "yacht", "yank",
  "yard", "yarn", "yeah", "year", "yearn", "yeast", "yell", "yellow", "yield",
  "yoga", "yogurt", "yoke", "yokel", "yore", "young", "youth", "zebra",
  "zenith", "zephyr", "zero", "zest", "zigzag", "zinc", "zipper", "zonal", "zone",
  // Core game/anagram families (word-game staples)
  "listen", "silent", "enlist", "tinsel", "inlets", "stein", "lens", "nest",
  "nets", "sent", "tine", "line", "tile", "tiles", "stile", "lite", "site", "isle",
  "islet", "least", "slate", "stale", "steal", "tales", "teals", "alert",
  "alter", "later", "artel", "ratel", "taler", "earth", "heart", "hater",
  "trace", "cater", "crate", "react", "caret", "dare", "dear", "read",
  "baker", "brake", "break", "caper", "crape", "parse", "pears", "reaps",
  "spare", "spear", "paler", "panel", "penal", "plane", "angel", "angle",
  "glean", "garden", "danger", "ranged", "range", "anger", "gander", "master",
  "stream", "tamers", "maters", "reams", "meats", "teams", "steam", "mates",
  "tames", "rate", "tear", "tare", "aster", "stare", "rates", "taser",
  "rescue", "secure", "recuse", "cures", "curse", "sucre", "cinema", "iceman",
  "manic", "anemic", "triangle", "alerting", "altering", "integral",
  "relating", "planet", "planer", "leapt", "petal", "plate", "pleat",
  "stressed", "desserts", "election", "trail", "trial", "breathe", "scrabble",
  "scramble", "jumble", "puzzle", "boggle", "wordle", "crossword", "quordle",
  "bingo", "racks", "rack", "anagram", "solver", "finder", "letters",
];

function countsOf(letters: string): { counts: Map<string, number>; blanks: number } {
  const counts = new Map<string, number>();
  let blanks = 0;
  for (const ch of letters) {
    if (ch === "?" || ch === "*") {
      blanks += 1;
    } else {
      counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
  }
  return { counts, blanks };
}

function canBuild(word: string, rack: Map<string, number>, blanks: number): boolean {
  const needed = new Map<string, number>();
  for (const ch of word) {
    needed.set(ch, (needed.get(ch) ?? 0) + 1);
  }
  let wildcards = blanks;
  for (const [ch, want] of needed) {
    const have = rack.get(ch) ?? 0;
    if (want > have) {
      wildcards -= want - have;
      if (wildcards < 0) {
        return false;
      }
    }
  }
  return true;
}

export function normalizeLetters(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z?*]/g, "");
}

export function unscrambleLetters(rawLetters: string, options?: Partial<UnscrambleOptions>): ReadonlyArray<UnscrambledWord> {
  const letters = normalizeLetters(rawLetters);
  const blanks = (letters.match(/[?*]/g) ?? []).length;
  const tiles = letters.length;
  const mode = options?.mode ?? "all";
  const minLength = Math.max(2, options?.minLength ?? 2);
  const maxLength = Math.min(15, options?.maxLength ?? tiles);
  const limit = Math.min(500, Math.max(1, options?.limit ?? 100));
  const sort = options?.sort ?? "length";
  const { counts } = countsOf(letters);
  const seen = new Set<string>();
  const out: Array<UnscrambledWord> = [];
  for (const word of ENABLE_CORE_WORDS) {
    if (seen.has(word)) {
      continue;
    }
    seen.add(word);
    if (word.length < minLength || word.length > maxLength) {
      continue;
    }
    if (mode === "exact") {
      if (blanks === 0 && word.length !== tiles) {
        continue;
      }
      if (blanks > 0 && word.length > tiles) {
        continue;
      }
    }
    if (!canBuild(word, counts, blanks)) {
      continue;
    }
    out.push({ word, length: word.length, scrabble: scrabbleScore(word), wwf: wwfScore(word) });
  }
  out.sort((a, b) => {
    if (sort === "score") {
      if (b.scrabble !== a.scrabble) {
        return b.scrabble - a.scrabble;
      }
      return b.length - a.length || (a.word < b.word ? -1 : 1);
    }
    if (b.length !== a.length) {
      return b.length - a.length;
    }
    if (b.scrabble !== a.scrabble) {
      return b.scrabble - a.scrabble;
    }
    return a.word < b.word ? -1 : 1;
  });
  return out.slice(0, limit);
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(state: number): () => number {
  let s = state >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic random picks from the core list (seeded when given). */
export function randomCoreWords(count: number, length: number | undefined, seed: string | undefined): ReadonlyArray<string> {
  const pool = length === undefined ? ENABLE_CORE_WORDS : ENABLE_CORE_WORDS.filter((w) => w.length === length);
  if (pool.length === 0) {
    return [];
  }
  const rand = seed === undefined || seed === "" ? Math.random : mulberry32(hashSeed(seed));
  const picked: Array<string> = [];
  const used = new Set<number>();
  const target = Math.min(count, pool.length);
  let guard = target * 20 + 10;
  while (picked.length < target && guard > 0) {
    guard -= 1;
    const index = Math.floor(rand() * pool.length);
    if (used.has(index)) {
      continue;
    }
    used.add(index);
    picked.push(pool[index] as string);
  }
  return picked;
}
