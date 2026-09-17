'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Download, ImagePlus, RotateCcw } from 'lucide-react';
import { FAVICON_SIZES, buildFaviconHtml, centerSquareCrop } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { canvasToBlob, downloadBlob, loadImageElement } from './imageUtils';

interface FaviconFile {
  filename: string;
  size: number;
  label: string;
  url: string;
  blob: Blob;
}

export default function FaviconGenerator(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReadonlyArray<FaviconFile>>([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const html = buildFaviconHtml();

  useEffect(() => {
    return () => {
      for (const result of results) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [results]);

  async function handleGenerate(target: File): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const img = await loadImageElement(target);
      const crop = centerSquareCrop(img.naturalWidth, img.naturalHeight);
      const done: Array<FaviconFile> = [];
      for (const entry of FAVICON_SIZES) {
        const canvas = document.createElement('canvas');
        canvas.width = entry.size;
        canvas.height = entry.size;
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
          throw new Error('Your browser would not give this page a canvas to draw on.');
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, entry.size, entry.size);
        const blob = await canvasToBlob(canvas, 'image/png');
        done.push({
          filename: entry.filename,
          size: entry.size,
          label: entry.label,
          url: URL.createObjectURL(blob),
          blob,
        });
      }
      for (const previous of results) {
        URL.revokeObjectURL(previous.url);
      }
      setResults(done);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Generation failed.');
    } finally {
      setBusy(false);
    }
  }

  function choose(next: File | null): void {
    if (next === null || !next.type.startsWith('image/')) {
      return;
    }
    setFile(next);
    setError(null);
    void handleGenerate(next);
  }

  function handleReset(): void {
    for (const previous of results) {
      URL.revokeObjectURL(previous.url);
    }
    setFile(null);
    setResults([]);
    setError(null);
    setCopied(false);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  async function handleCopyHtml(): Promise<void> {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
    } catch {
      setError('Copying failed — select the HTML below and copy it manually.');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your source image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={(event) => {
              event.preventDefault();
              choose(event.dataTransfer.files[0] ?? null);
            }}
            onDragOver={(event) => event.preventDefault()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-8 text-sm dark:border-zinc-700"
          >
            <ImagePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop a logo here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {file === null ? 'Square images work best — wide ones get center-cropped' : file.name}
            </span>
          </button>
          <input
            aria-label="Upload images"
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => choose(event.target.files?.[0] ?? null)}
          />
          {error !== null ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={file === null || busy}
              onClick={() => (file === null ? undefined : void handleGenerate(file))}
            >
              {busy ? 'Generating…' : results.length > 0 ? 'Regenerate' : 'Generate favicons'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Favicon set</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {busy
                ? 'Drawing every size…'
                : 'All six sizes previewed at their real dimensions will appear here.'}
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.filename}
                  className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white bg-[repeating-conic-gradient(#e5e7eb_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.url}
                      alt={result.filename}
                      width={result.size}
                      height={result.size}
                      loading="lazy"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{result.filename}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {result.size} × {result.size} · {result.label}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBlob(result.blob, result.filename)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Save
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  for (const result of results) {
                    downloadBlob(result.blob, result.filename);
                  }
                }}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download all
              </Button>
              <div className="rounded-lg bg-zinc-950 p-3">
                <pre tabIndex={0} aria-label="Generated HTML" className="overflow-x-auto text-xs text-zinc-100">
                  {html}
                </pre>
              </div>
              <Button type="button" variant="outline" onClick={() => void handleCopyHtml()}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? 'Copied!' : 'Copy HTML'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
