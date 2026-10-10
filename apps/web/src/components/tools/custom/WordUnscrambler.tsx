'use client';

import { useMemo, useState } from 'react';
import { Copy, Download, RotateCcw, Shuffle } from 'lucide-react';
import { unscrambleLetters } from '@/shared/calculations';
import type { UnscrambledWord } from '@/shared/calculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type Mode = 'all' | 'exact';
type Sort = 'length' | 'score';

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z?*]/g, '');
}

function validateLetters(raw: string): string | null {
  const letters = normalize(raw);
  if (letters === '') {
    return 'Enter 2â€“15 scrambled letters.';
  }
  if (letters.length < 2 || letters.length > 15) {
    return 'Use between 2 and 15 tiles.';
  }
  if ((letters.match(/[?*]/g) ?? []).length > 2) {
    return 'Up to 2 blank tiles (?) are supported.';
  }
  return null;
}

export default function WordUnscrambler(): React.ReactElement {
  const [letters, setLetters] = useState('listen');
  const [mode, setMode] = useState<Mode>('all');
  const [minLength, setMinLength] = useState('2');
  const [maxResults, setMaxResults] = useState('100');
  const [sort, setSort] = useState<Sort>('length');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState<ReadonlyArray<UnscrambledWord> | null>(null);

  function handleUnscramble(): void {
    const problem = validateLetters(letters);
    if (problem !== null) {
      setError(problem);
      setResults(null);
      return;
    }
    setError(null);
    setCopied(false);
    setResults(
      unscrambleLetters(letters, {
        mode,
        minLength: Math.min(15, Math.max(2, Math.floor(Number(minLength)) || 2)),
        limit: Math.min(300, Math.max(1, Math.floor(Number(maxResults)) || 100)),
        sort,
      }),
    );
  }

  function reset(): void {
    setLetters('');
    setMode('all');
    setMinLength('2');
    setMaxResults('100');
    setSort('length');
    setError(null);
    setResults(null);
    setCopied(false);
  }

  const groups = useMemo(() => {
    const map = new Map<number, Array<UnscrambledWord>>();
    for (const word of results ?? []) {
      const bucket = map.get(word.length) ?? [];
      bucket.push(word);
      map.set(word.length, bucket);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [results]);

  function resultText(): string {
    return (results ?? []).map((r) => `${r.word} (${r.length} letters, Scrabble ${r.scrabble}, WWF ${r.wwf})`).join('\n');
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(resultText());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function handleDownload(): void {
    const blob = new Blob([resultText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'word-unscrambler-results.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your tiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wu-letters">Scrambled letters (Aâ€“Z, ? for a blank tile)</Label>
            <textarea
              id="wu-letters"
              value={letters}
              onChange={(event) => setLetters(event.target.value)}
              rows={3}
              placeholder="e.g. listen or silen?"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm uppercase dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="wu-mode">Mode</Label>
              <select
                id="wu-mode"
                value={mode}
                onChange={(event) => setMode(event.target.value as Mode)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="all">All words (subset)</option>
                <option value="exact">Exact (use every tile)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wu-sort">Sort by</Label>
              <select
                id="wu-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="length">Longest first</option>
                <option value="score">Highest score first</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wu-min">Minimum length</Label>
              <input
                id="wu-min"
                inputMode="numeric"
                value={minLength}
                onChange={(event) => setMinLength(event.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wu-max">Max results (1â€“300)</Label>
              <input
                id="wu-max"
                inputMode="numeric"
                value={maxResults}
                onChange={(event) => setMaxResults(event.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>
          {error !== null ? (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleUnscramble}>
              <Shuffle className="h-4 w-4" aria-hidden="true" /> Unscramble
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Matching words</CardTitle>
        </CardHeader>
        <CardContent>
          {results === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Enter your tiles and press Unscramble â€” every dictionary word they can build appears here, grouped by length with Scrabble and Words With Friends scores.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No dictionary words found â€” try a blank tile (?) or fewer letters.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <p role="status" className="text-sm font-semibold">
                  {results.length} word{results.length === 1 ? '' : 's'} found
                  {results[0] !== undefined ? (
                    <span className="font-normal text-zinc-600 dark:text-zinc-400">
                      {' '}Â· longest: <strong>{results[0].word}</strong>
                    </span>
                  ) : null}
                </p>
                <span className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy()}>
                  <Copy className="h-4 w-4" aria-hidden="true" /> {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" aria-hidden="true" /> .txt
                </Button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Words are grouped by length, longest first. Copy or download the list to keep it.
              </p>
              {groups.map(([length, words]) => (
                <section key={length} aria-label={`${length}-letter words`}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {length} letters ({words.length})
                  </h3>
                  <table className="mt-2 w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th scope="col" className="w-10 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          #
                        </th>
                        <th scope="col" className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Word
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {words.map((word, index) => (
                        <tr key={word.word} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                          <th scope="row" className="w-10 px-2 py-1.5 align-top font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            {index + 1}
                          </th>
                          <td className="px-2 py-1.5 font-mono text-base font-bold uppercase text-zinc-900 dark:text-zinc-100">
                            {word.word}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
