'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, RotateCcw } from 'lucide-react';
import {
  IMAGE_FORMATS,
  assertImageBatchSize,
  conversionOutputName,
  imageQualityToRatio,
  normalizeImageFormat,
  normalizeImageQuality,
  type WebImageFormat,
} from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { canvasToBlob, downloadBlob, formatBytes, loadImageElement } from './imageUtils';

interface ConvertedFile {
  name: string;
  fromBytes: number;
  toBytes: number;
  url: string;
  blob: Blob;
}

const FORMAT_ORDER: ReadonlyArray<WebImageFormat> = ['webp', 'jpeg', 'png'];

export default function ImageConverter(): React.ReactElement {
  const [files, setFiles] = useState<ReadonlyArray<File>>([]);
  const [format, setFormat] = useState<WebImageFormat>('webp');
  const [quality, setQuality] = useState(85);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReadonlyArray<ConvertedFile>>([]);
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
      setError('Convert up to 20 images at once — the first 20 were kept.');
    } else {
      setError(null);
    }
    setFiles(next.slice(0, 20));
  }

  async function handleConvert(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const target = normalizeImageFormat(format);
      const q = normalizeImageQuality(String(quality));
      const info = IMAGE_FORMATS[target];
      const done: Array<ConvertedFile> = [];
      for (const file of files) {
        const img = await loadImageElement(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
          throw new Error('Your browser would not give this page a canvas to draw on.');
        }
        if (target === 'jpeg') {
          // JPEG has no alpha channel: flatten onto white instead of black.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(
          canvas,
          info.mime,
          info.supportsQuality ? imageQualityToRatio(q) : undefined,
        );
        done.push({
          name: conversionOutputName(file.name, target),
          fromBytes: file.size,
          toBytes: blob.size,
          url: URL.createObjectURL(blob),
          blob,
        });
      }
      for (const previous of results) {
        URL.revokeObjectURL(previous.url);
      }
      setResults(done);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Conversion failed.');
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

  const qualityApplies = IMAGE_FORMATS[format]?.supportsQuality === true;

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
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
            }}
          />
          {files.length > 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {files.length} file{files.length === 1 ? '' : 's'} selected ·{' '}
              {formatBytes(files.reduce((sum, file) => sum + file.size, 0))} total
            </p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="image-converter-format">Convert to</Label>
            <select
              id="image-converter-format"
              value={format}
              onChange={(event) => setFormat(normalizeImageFormat(event.target.value))}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {FORMAT_ORDER.map((key) => (
                <option key={key} value={key}>
                  {IMAGE_FORMATS[key]?.label ?? key}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image-converter-quality">
              Quality{qualityApplies ? ` — ${quality}%` : ' (PNG is lossless: setting ignored)'}
            </Label>
            <input
              id="image-converter-quality"
              type="range"
              min={1}
              max={100}
              value={quality}
              disabled={!qualityApplies}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
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
              onClick={() => void handleConvert()}
            >
              {busy ? 'Converting…' : 'Convert images'}
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
          <CardTitle>Converted files</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Converted images appear here with their old and new file sizes.
            </p>
          ) : (
            <div className="space-y-3">
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
