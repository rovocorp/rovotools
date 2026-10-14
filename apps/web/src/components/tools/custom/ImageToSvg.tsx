'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, RotateCcw } from 'lucide-react';
import { getSVG, traceDataUrl, THRESHOLD_AUTO } from '@cadit-app/potrace-ts';
import { assertImageBatchSize, assertImageFileSize } from '@/shared/tools/images';
import { applyFillToTracedSvg, computeTraceScale, normalizeTurdSize, normalizeTraceThreshold, svgOutputName } from '@/shared/tools/svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { downloadBlob, formatBytes, loadImageElement } from './imageUtils';

interface VectorizedFile {
  name: string;
  fromBytes: number;
  toBytes: number;
  sourceUrl: string;
  svgUrl: string;
  svgText: string;
  blob: Blob;
}

const MAX_BATCH = 10;
const TRACE_MAX = 1024;

function isRasterImage(file: File): boolean {
  return file.type.startsWith('image/') && file.type !== 'image/svg+xml';
}

async function vectorizeImage(file: File, threshold: number, turdsize: number, fill: string, invert: boolean): Promise<VectorizedFile> {
  assertImageFileSize(file.size);
  const img = await loadImageElement(file);
  const scale = computeTraceScale(img.naturalWidth, img.naturalHeight, TRACE_MAX);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Your browser would not give this page a canvas to draw on.');
  }
  // Flatten transparency onto white so the tracer sees a clean background.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/png');
  const effectiveThreshold = threshold === THRESHOLD_AUTO ? THRESHOLD_AUTO : threshold;
  const paths = traceDataUrl(dataUrl, {
    threshold: effectiveThreshold,
    turdsize,
    blackOnWhite: !invert,
  });
  const rawSvg = getSVG(paths, 1);
  const svgText = applyFillToTracedSvg(rawSvg, fill.trim() === '' ? '#000000' : fill.trim());
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const base = file.name.replace(/\.[^.]+$/, '') || 'image';
  return {
    name: svgOutputName(base),
    fromBytes: file.size,
    toBytes: blob.size,
    sourceUrl: URL.createObjectURL(file),
    svgUrl: URL.createObjectURL(blob),
    svgText,
    blob,
  };
}

export default function ImageToSvg(): React.ReactElement {
  const [files, setFiles] = useState<ReadonlyArray<File>>([]);
  const [threshold, setThreshold] = useState('auto');
  const [turdsize, setTurdsize] = useState(2);
  const [fill, setFill] = useState('#000000');
  const [invert, setInvert] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReadonlyArray<VectorizedFile>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const result of results) {
        URL.revokeObjectURL(result.sourceUrl);
        URL.revokeObjectURL(result.svgUrl);
      }
    };
  }, [results]);

  function addFiles(incoming: Iterable<File>): void {
    const next = [...files, ...incoming].filter(isRasterImage);
    try {
      assertImageBatchSize(next.length === 0 ? 1 : next.length);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Too many files.');
      return;
    }
    if (next.length > MAX_BATCH) {
      setError(`Vectorize up to ${MAX_BATCH} images at once — the first ${MAX_BATCH} were kept.`);
    } else {
      setError(null);
    }
    setFiles(next.slice(0, MAX_BATCH));
  }

  async function handleVectorize(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const thr = normalizeTraceThreshold(threshold);
      const speckle = normalizeTurdSize(String(turdsize));
      const done: Array<VectorizedFile> = [];
      for (const file of files) {
        done.push(await vectorizeImage(file, thr, speckle, fill, invert));
      }
      for (const previous of results) {
        URL.revokeObjectURL(previous.sourceUrl);
        URL.revokeObjectURL(previous.svgUrl);
      }
      setResults(done);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Vectorization failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    for (const previous of results) {
      URL.revokeObjectURL(previous.sourceUrl);
      URL.revokeObjectURL(previous.svgUrl);
    }
    setFiles([]);
    setResults([]);
    setError(null);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(Array.from(event.dataTransfer.files));
            }}
            className={cn(
              'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-sm transition-colors',
              dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-zinc-300 dark:border-zinc-700',
            )}
          >
            <ImagePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop images here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">PNG · JPG · WEBP · best for logos, icons &amp; line art</span>
          </button>
          <input
            aria-label="Upload images to vectorize"
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
            }}
          />
          {files.length > 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {files.length} file{files.length === 1 ? '' : 's'} selected · {formatBytes(files.reduce((sum, file) => sum + file.size, 0))} total
            </p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="image-to-svg-threshold">Threshold (auto, or 0–255)</Label>
            <input
              id="image-to-svg-threshold"
              type="text"
              value={threshold}
              placeholder="auto"
              onChange={(event) => setThreshold(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image-to-svg-turd">Despeckle — {turdsize}</Label>
            <input
              id="image-to-svg-turd"
              type="range"
              min={0}
              max={50}
              value={turdsize}
              onChange={(event) => setTurdsize(Number(event.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image-to-svg-fill">Fill colour</Label>
            <input
              id="image-to-svg-fill"
              type="text"
              value={fill}
              onChange={(event) => setFill(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={invert}
              onChange={(event) => setInvert(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            Invert (trace light shapes on dark backgrounds)
          </label>
          {error !== null ? (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={files.length === 0 || busy} onClick={() => void handleVectorize()}>
              {busy ? 'Vectorizing…' : 'Vectorize to SVG'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </Button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Best for high-contrast logos, icons and line art. Photos and gradients produce complex, imperfect vectors — try a
            high-contrast version of your image first.
          </p>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Vectorized SVGs</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Original and vectorized previews appear here side by side. Adjust threshold and despeckle, then re-run for a cleaner trace.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.svgUrl} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Original</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.sourceUrl} alt="Original" className="mx-auto max-h-40 rounded-md object-contain" loading="lazy" />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">SVG</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.svgUrl} alt="Vectorized" className="mx-auto max-h-40 rounded-md object-contain" loading="lazy" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{result.name}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {formatBytes(result.fromBytes)} → {formatBytes(result.toBytes)}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => downloadBlob(result.blob, result.name)}>
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Save
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  for (const result of results) {
                    downloadBlob(result.blob, result.name);
                  }
                }}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
