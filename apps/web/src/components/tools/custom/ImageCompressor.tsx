'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, RotateCcw } from 'lucide-react';
import {
  assertImageBatchSize,
  findQualityForTarget,
  imageQualityToRatio,
  normalizeImageQuality,
} from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  canvasToBlob,
  downloadBlob,
  formatBytes,
  loadImageElement,
  replaceExtension,
} from './imageUtils';

interface CompressedFile {
  name: string;
  fromBytes: number;
  toBytes: number;
  url: string;
  blob: Blob;
}

const COMMON_TARGETS = [
  { label: '100 KB forms', kb: 100 },
  { label: '200 KB blog', kb: 200 },
];

async function encodeImage(
  img: HTMLImageElement,
  width: number,
  height: number,
  mime: 'image/jpeg' | 'image/webp',
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Your browser would not give this page a canvas to draw on.');
  }
  // JPEG/WebP-from-transparent: flatten onto white instead of black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvasToBlob(canvas, mime, imageQualityToRatio(quality));
}

export default function ImageCompressor(): React.ReactElement {
  const [files, setFiles] = useState<ReadonlyArray<File>>([]);
  const [mode, setMode] = useState<'quality' | 'target'>('quality');
  const [quality, setQuality] = useState(72);
  const [targetKb, setTargetKb] = useState('100');
  const [webp, setWebp] = useState(false);
  const [capWidth, setCapWidth] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReadonlyArray<CompressedFile>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const result of results) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [results]);

  function addFiles(incoming: Iterable<File>): void {
    const next = [...files, ...incoming].filter((file) => file.type.startsWith('image/'));
    try {
      assertImageBatchSize(next.length === 0 ? 1 : next.length);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Too many files.');
      return;
    }
    if (next.length > 20) {
      setError('Batches are capped at 20 images — the first 20 were kept.');
    } else {
      setError(null);
    }
    setFiles(next.slice(0, 20));
  }

  async function handleCompress(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const q = normalizeImageQuality(String(quality), 72);
      const targetBytes = Math.floor(Number(targetKb) * 1024);
      if (mode === 'target' && (!Number.isFinite(targetBytes) || targetBytes <= 0)) {
        throw new RangeError('Enter a target size in KB, e.g. 100.');
      }
      const done: Array<CompressedFile> = [];
      for (const file of files) {
        const img = await loadImageElement(file);
        const scale = capWidth ? Math.min(1, 1920 / img.naturalWidth) : 1;
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const push = (blob: Blob, name: string): void => {
          done.push({
            name,
            fromBytes: file.size,
            toBytes: blob.size,
            url: URL.createObjectURL(blob),
            blob,
          });
        };
        if (mode === 'target') {
          const best = await findQualityForTarget(
            async (probe) => (await encodeImage(img, width, height, 'image/jpeg', probe)).size,
            targetBytes,
          );
          push(
            await encodeImage(img, width, height, 'image/jpeg', best),
            replaceExtension(file.name, 'jpg'),
          );
          if (webp) {
            push(
              await encodeImage(img, width, height, 'image/webp', best),
              replaceExtension(file.name, 'webp'),
            );
          }
        } else {
          push(
            await encodeImage(img, width, height, 'image/jpeg', q),
            replaceExtension(file.name, 'jpg'),
          );
          if (webp) {
            push(
              await encodeImage(img, width, height, 'image/webp', q),
              replaceExtension(file.name, 'webp'),
            );
          }
        }
      }
      for (const previous of results) {
        URL.revokeObjectURL(previous.url);
      }
      setResults(done);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Compression failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    for (const previous of results) {
      URL.revokeObjectURL(previous.url);
    }
    setFiles([]);
    setResults([]);
    setError(null);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  const originalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const compressedBytes = results.reduce((sum, result) => sum + result.toBytes, 0);

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
              dragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-zinc-300 dark:border-zinc-700',
            )}
          >
            <ImagePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop images here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">JPG · PNG · WEBP · up to 20 at once</span>
          </button>
          <input
            aria-label="Upload images"
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
          />
          {files.length > 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {files.length} file{files.length === 1 ? '' : 's'} selected ·{' '}
              {formatBytes(originalBytes)} total
            </p>
          ) : null}
          <div className="flex gap-2" role="tablist" aria-label="Compression mode">
            {(['quality', 'target'] as const).map((value) => (
              <Button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                variant={mode === value ? 'default' : 'outline'}
                onClick={() => setMode(value)}
              >
                {value === 'quality' ? 'Quality' : 'Target size'}
              </Button>
            ))}
          </div>
          {mode === 'quality' ? (
            <div className="space-y-1.5">
              <Label htmlFor="image-compressor-quality">JPEG quality — {quality}%</Label>
              <input
                id="image-compressor-quality"
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Around 70 to 80 is the sweet spot for photographs. Below 50 you will start to see
                blocking in flat areas like skies.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="image-compressor-target">Target size in KB</Label>
              <Input
                id="image-compressor-target"
                inputMode="decimal"
                value={targetKb}
                onChange={(event) => setTargetKb(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {COMMON_TARGETS.map((target) => (
                  <Button
                    key={target.kb}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTargetKb(String(target.kb))}
                  >
                    {target.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                The compressor searches for the highest quality that still fits under this size.
                Very small targets on large images work far better with the 1920px cap on.
              </p>
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={webp}
              onChange={(event) => setWebp(event.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Convert output to WebP as well (usually 25–35% smaller than JPG)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={capWidth}
              onChange={(event) => setCapWidth(event.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Also cap the width at 1920px before compressing
          </label>
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
              disabled={files.length === 0 || busy}
              onClick={() => void handleCompress()}
            >
              {busy ? 'Compressing…' : 'Compress images'}
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
          <CardTitle>Compressed files</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your compressed images will be listed here with a before and after preview.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatBytes(originalBytes)} → {formatBytes(compressedBytes)} · saved{' '}
                {formatBytes(Math.max(0, originalBytes - compressedBytes))}
              </p>
              {results.map((result) => (
                <div
                  key={result.url}
                  className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.url}
                    alt={result.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{result.name}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {formatBytes(result.fromBytes)} → {formatBytes(result.toBytes)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBlob(result.blob, result.name)}
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
