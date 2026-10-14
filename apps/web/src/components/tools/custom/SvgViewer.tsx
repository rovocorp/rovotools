'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClipboardCopy, Download, Eye, Upload } from 'lucide-react';
import {
  analyzeSvgComplexity,
  intrinsicSvgSize,
  normalizeSvgSource,
  parseSvgDimensions,
  svgOutputName,
} from '@/shared/tools/svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { downloadBlob, formatBytes } from './imageUtils';

interface ViewerState {
  readonly name: string;
  readonly svgText: string;
  readonly previewUrl: string;
  readonly blob: Blob;
}

type BackgroundMode = 'light' | 'dark' | 'checker';

export default function SvgViewer(): React.ReactElement {
  const [state, setState] = useState<ViewerState | null>(null);
  const [source, setSource] = useState('');
  const [background, setBackground] = useState<BackgroundMode>('checker');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (state !== null) {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state]);

  const applySvg = useCallback((text: string, name: string) => {
    const normalized = normalizeSvgSource(text);
    if (normalized === '' || !/<svg[\s>]/i.test(normalized)) {
      setError('That does not look like valid SVG markup — it needs an <svg> root element.');
      return;
    }
    if (state !== null) {
      URL.revokeObjectURL(state.previewUrl);
    }
    const blob = new Blob([normalized], { type: 'image/svg+xml;charset=utf-8' });
    setState({
      name,
      svgText: normalized,
      previewUrl: URL.createObjectURL(blob),
      blob,
    });
    setError(null);
  }, [state]);

  function handleFile(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      setError('Keep SVG files under 5 MB for smooth previewing.');
      return;
    }
    file.text().then(
      (text) => applySvg(text, file.name || 'preview.svg'),
      () => setError('Could not read that file.'),
    );
  }

  async function handleCopy(): Promise<void> {
    if (state === null) {
      return;
    }
    try {
      await navigator.clipboard.writeText(state.svgText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Clipboard access was blocked — select the source below and copy manually.');
    }
  }

  const dims = state !== null ? parseSvgDimensions(state.svgText) : null;
  const intrinsic = dims !== null ? intrinsicSvgSize(dims) : null;
  const complexity = state !== null ? analyzeSvgComplexity(state.svgText) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Open an SVG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            htmlFor="svg-viewer-file"
            className={cn(
              'flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-sm transition-colors',
              'border-zinc-300 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-700 dark:hover:bg-indigo-950/20',
            )}
          >
            <Upload className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Choose an SVG file</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Or paste source below · nothing is uploaded</span>
          </label>
          <input
            id="svg-viewer-file"
            type="file"
            accept=".svg,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) {
                handleFile(file);
              }
            }}
          />
          <div className="space-y-1.5">
            <Label htmlFor="svg-viewer-source">Or paste SVG source</Label>
            <textarea
              id="svg-viewer-source"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              rows={8}
              placeholder="<svg xmlns=…>…</svg>"
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          {error !== null ? (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <Button type="button" disabled={source.trim() === ''} onClick={() => applySvg(source, 'pasted.svg')}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview pasted SVG
          </Button>
          {state !== null ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy()}>
                  <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                  {copied ? 'Copied' : 'Copy source'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => downloadBlob(state.blob, svgOutputName(state.name))}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download SVG
                </Button>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">File:</span> {state.name}
                </p>
                <p>
                  <span className="font-semibold">Size:</span> {formatBytes(state.blob.size)}
                </p>
                <p>
                  <span className="font-semibold">Intrinsic size:</span>{' '}
                  {intrinsic !== null ? `${intrinsic.width} × ${intrinsic.height} px` : 'unknown'}
                </p>
                <p>
                  <span className="font-semibold">viewBox:</span>{' '}
                  {dims?.viewBox != null
                    ? `${dims.viewBox.minX} ${dims.viewBox.minY} ${dims.viewBox.width} ${dims.viewBox.height}`
                    : 'not set'}
                </p>
                <p>
                  <span className="font-semibold">Elements:</span> {complexity?.elementCount ?? 0} ·{' '}
                  <span className="font-semibold">Paths:</span> {complexity?.pathCount ?? 0}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svg-viewer-bg">Preview background</Label>
                <select
                  id="svg-viewer-bg"
                  value={background}
                  onChange={(event) => setBackground(event.target.value as BackgroundMode)}
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="checker">Checkerboard (shows transparency)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {state === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Load an SVG to see a live preview and its dimensions, viewBox and element counts.
            </p>
          ) : (
            <div
              className={cn(
                'flex min-h-64 items-center justify-center rounded-lg border border-zinc-200 p-4 dark:border-zinc-700',
                background === 'checker' &&
                  'bg-[conic-gradient(#e4e4e7_25%,transparent_0%,transparent_75%,#e4e4e7_0)_0_0/16px_16px dark:bg-[conic-gradient(#27272a_25%,transparent_0%,transparent_75%,#27272a_0)_0_0/16px_16px]',
                background === 'light' && 'bg-white',
                background === 'dark' && 'bg-zinc-900',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.previewUrl} alt={`Preview of ${state.name}`} className="max-h-96 max-w-full object-contain" />
            </div>
          )}
          {state !== null ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">View SVG source</summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-900">{state.svgText}</pre>
            </details>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
