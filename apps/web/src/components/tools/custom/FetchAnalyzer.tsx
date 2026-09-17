'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { getOutputLabel, registerCoreTools, toolRegistry } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// The generic ToolRunner seeds the client registry at module scope, but this
// bespoke shell replaces the runner — seed here so require() works on these
// pages.
registerCoreTools(toolRegistry);

interface FetchPageResult {
  readonly ok?: boolean;
  readonly finalUrl?: string;
  readonly truncated?: boolean;
  readonly html?: string;
  readonly error?: string;
}

/**
 * Shared shell for the fetch-capable analyzer tools (SEO checker, Open Graph
 * checker, sitemap checker, tag detector, performance analyzer).
 *
 * Analysis itself is pure and registry-driven: pasted markup goes through the
 * tool's own validate()/execute(), so results are identical with or without
 * fetching. The optional URL box calls POST /api/fetch-page (SSRF-guarded,
 * rate-limited) and drops the fetched markup into the textarea.
 */
export default function FetchAnalyzer({
  toolId,
  contentFieldId,
  contentLabel,
  contentPlaceholder,
  fetchHint,
  analyzeAction,
}: {
  toolId: string;
  contentFieldId: string;
  contentLabel: string;
  contentPlaceholder?: string;
  fetchHint: string;
  analyzeAction: string;
}): React.ReactElement {
  const entry = toolRegistry.require(toolId);
  const outputs = entry.definition.outputs;
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [fetchState, setFetchState] = useState<'idle' | 'loading'>('idle');
  const [fetchNote, setFetchNote] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFetch(): Promise<void> {
    setError(null);
    setFetchNote(null);
    if (url.trim() === '') {
      setError('Enter a page URL to fetch.');
      return;
    }
    setFetchState('loading');
    try {
      const response = await fetch('/api/fetch-page', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await response.json().catch(() => null)) as FetchPageResult | null;
      if (!response.ok || data === null || data.ok !== true || typeof data.html !== 'string') {
        setError(data?.error ?? 'Could not fetch that page.');
        return;
      }
      setContent(data.html);
      setFetchNote(`Fetched ${data.finalUrl ?? url.trim()}${data.truncated === true ? ' (truncated at 2 MB)' : ''} — review, then Analyze.`);
    } catch {
      setError('Could not fetch that page. Check your connection and try again.');
    } finally {
      setFetchState('idle');
    }
  }

  async function onAnalyze(): Promise<void> {
    setError(null);
    setResult(null);
    try {
      const input = { [contentFieldId]: content };
      const validation = entry.definition.validate(input);
      if (!validation.valid) {
        setError(validation.errors[0]?.message ?? 'Check your input and try again.');
        return;
      }
      const out = (await entry.definition.execute(input)) as Record<string, unknown>;
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="space-y-1.5">
          <Label htmlFor={`${toolId}-url`}>Fetch from a live URL (optional — {fetchHint})</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id={`${toolId}-url`}
              inputMode="url"
              placeholder="https://example.com/page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void onFetch()}
              disabled={fetchState === 'loading'}
              className="shrink-0"
            >
              <Download className={cn('h-4 w-4', fetchState === 'loading' && 'animate-spin')} aria-hidden="true" />
              {fetchState === 'loading' ? 'Fetching…' : 'Fetch page'}
            </Button>
          </div>
          {fetchNote !== null ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{fetchNote}</p> : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={contentFieldId}>{contentLabel}</Label>
        <textarea
          id={contentFieldId}
          rows={10}
          placeholder={contentPlaceholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-40 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <Button type="button" onClick={() => void onAnalyze()}>
        {analyzeAction}
      </Button>

      {error !== null ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {result !== null ? (
        <dl className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {outputs.map((field, index) => (
            <div key={field.id} className={index % 2 === 0 ? 'bg-white px-4 py-3 dark:bg-zinc-950' : 'bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60'}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {getOutputLabel('en', field)}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-900 dark:text-zinc-100">
                {String(result[field.id] ?? '—')}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
