import { normalizeLetters, randomCoreWords, scrabbleScore, unscrambleLetters, wwfScore } from "@/shared/calculations";
import { describe, expect, it } from "vitest";

describe("unscramble engine", () => {
  it("finds full anagrams of LISTEN plus shorter sub-words", () => {
    const words = unscrambleLetters("listen", { mode: "all" }).map((r) => r.word);
    for (const expected of ["listen", "silent", "enlist", "tinsel", "inlets", "lens", "nest", "line", "tile"]) {
      expect(words, `missing ${expected}`).toContain(expected);
    }
  });

  it("exact mode only returns full-rack anagrams", () => {
    const words = unscrambleLetters("listen", { mode: "exact" }).map((r) => r.word);
    expect(words.length).toBeGreaterThan(0);
    for (const word of words) {
      expect(word.length).toBe(6);
    }
    expect(words).toContain("silent");
  });

  it("never reuses a tile it does not have", () => {
    const words = unscrambleLetters("aab", { mode: "all" }).map((r) => r.word);
    expect(words).not.toContain("abb");
  });

  it("supports blank tiles", () => {
    const words = unscrambleLetters("silen?", { mode: "all" }).map((r) => r.word);
    expect(words).toContain("silent");
  });

  it("scores classic game words correctly", () => {
    expect(scrabbleScore("jazz")).toBe(29);
    expect(scrabbleScore("qi")).toBe(11);
    expect(wwfScore("qi")).toBe(11);
  });

  it("normalizes messy input", () => {
    expect(normalizeLetters(" LiStEn! ")).toBe("listen");
  });

  it("draws seeded random words deterministically", () => {
    const first = randomCoreWords(8, undefined, "rovo-seed-1");
    const second = randomCoreWords(8, undefined, "rovo-seed-1");
    expect(first).toEqual(second);
    expect(first.length).toBe(8);
  });
});
