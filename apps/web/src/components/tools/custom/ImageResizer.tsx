'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, Lock, LockOpen, RotateCcw } from 'lucide-react';
import {
  IMAGE_FORMATS,
  IMAGE_RESIZE_PRESETS,
  imageQualityToRatio,
  scaleDimensions,
  type WebImageFormat,
} from '@rovotools/tools';
import {
  canvasToBlob,
  downloadBlob,
  formatBytes,
  loadImageElement,
  replaceExtension,
} from './imageUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type OutputFormat = WebImageFormat | 'same';

interface ResizedImage {
  name: string;
  dimensions: string;
  bytes: number;
  url: string;
  blob: Blob;
}

function sourceFormat(file: File): WebImageFormat {
  if (file.type === 'image/png') {
    return 'png';
  }
  if (file.type === 'image/webp') {
    return 'webp';
  }
  return 'jpeg';
}

export default function ImageResizer(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [locked, setLocked] = useState(true);
  const [scale, setScale] = useState(50);
  const [format, setFormat] = useState<OutputFormat>('same');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResizedImage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  async function choose(next: File | null): Promise<void> {
    if (next === null || !next.type.startsWith('image/')) {
      return;
    }
    setError(null);
    setResult(null);
    setFile(next);
    try {
      const img = await loadImageElement(next);
      setNatural({ width: img.naturalWidth, height: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not read that image.');
      setFile(null);
      setNatural(null);
    }
  }

  function changeWidth(raw: string): void {
    setWidth(raw);
    if (locked && natural !== null) {
      const w = Number(raw);
      if (Number.isFinite(w) && w > 0) {
        setHeight(String(Math.max(1, Math.round((w * natural.height) / natural.width))));
      }
    }
  }

  function changeHeight(raw: string): void {
    setHeight(raw);
    if (locked && natural !== null) {
      const h = Number(raw);
      if (Number.isFinite(h) && h > 0) {
        setWidth(String(Math.max(1, Math.round((h * natural.width) / natural.height))));
      }
    }
  }

  function targetSize(): { width: number; height: number } {
    if (natural === null) {
      throw new RangeError('Load an image first.');
    }
    if (mode === 'percent') {
      return scaleDimensions(natural.width, natural.height, scale);
    }
    const w = Math.floor(Number(width));
    const h = Math.floor(Number(height));
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1 || w > 12000 || h > 12000) {
      throw new RangeError('Enter a width and height between 1 and 12000 pixels.');
    }
    return { width: w, height: h };
  }

  async function handleResize(): Promise<void> {
    if (file === null) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const size = targetSize();
      const img = await loadImageElement(file);
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d');
      if (ctx === null) {
        throw new Error('Your browser would not give this page a canvas to draw on.');
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const outFormat: WebImageFormat = format === 'same' ? sourceFormat(file) : format;
      const info = IMAGE_FORMATS[outFormat];
      if (!info.supportsAlpha) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, size.width, size.height);
      const blob = await canvasToBlob(canvas, info.mime, imageQualityToRatio(92));
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      setResult({
        name: replaceExtension(file.name, info.extension),
        dimensions: `${size.width} × ${size.height}`,
        bytes: blob.size,
        url: URL.createObjectURL(blob),
        blob,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Resizing failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    if (result !== null) {
      URL.revokeObjectURL(result.url);
    }
    setFile(null);
    setNatural(null);
    setResult(null);
    setError(null);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={(event) => {
              event.preventDefault();
              void choose(event.dataTransfer.files[0] ?? null);
            }}
            onDragOver={(event) => event.preventDefault()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-8 text-sm dark:border-zinc-700"
          >
            <ImagePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop an image here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {file === null
                ? 'JPG · PNG · WEBP'
                : `${file.name} · ${natural === null ? '' : `${natural.width} × ${natural.height}`}`}
            </span>
          </button>
          <input
            aria-label="Upload images"
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void choose(event.target.files?.[0] ?? null);
            }}
          />
          <div className="flex gap-2" role="tablist" aria-label="Resize mode">
            {(['pixels', 'percent'] as const).map((value) => (
              <Button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                variant={mode === value ? 'default' : 'outline'}
                onClick={() => setMode(value)}
              >
                {value === 'pixels' ? 'Pixels' : 'Percentage'}
              </Button>
            ))}
          </div>
          {mode === 'pixels' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="image-resizer-width">Width in pixels</Label>
                  <Input
                    id="image-resizer-width"
                    inputMode="numeric"
                    value={width}
                    onChange={(event) => changeWidth(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="image-resizer-height">Height in pixels</Label>
                  <Input
                    id="image-resizer-height"
                    inputMode="numeric"
                    value={height}
                    onChange={(event) => changeHeight(event.target.value)}
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={locked}
                  onChange={(event) => setLocked(event.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                {locked ? (
                  <Lock className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <LockOpen className="h-4 w-4" aria-hidden="true" />
                )}
                Lock the aspect ratio
              </label>
              <div className="flex flex-wrap gap-2">
                {IMAGE_RESIZE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={natural === null}
                    onClick={() => {
                      if (natural === null) {
                        return;
                      }
                      if (preset.height === null) {
                        changeWidth(String(preset.width));
                      } else {
                        setLocked(false);
                        setWidth(String(preset.width));
                        setHeight(String(preset.height));
                      }
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="image-resizer-scale">Scale — {scale}%</Label>
              <input
                id="image-resizer-scale"
                type="range"
                min={1}
                max={400}
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
                className="w-full accent-indigo-600"
              />
              {scale > 100 ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Scaling above 100% enlarges the image and will look soft. Browsers cannot invent
                  detail that is not there.
                </p>
              ) : null}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="image-resizer-format">Save as</Label>
            <select
              id="image-resizer-format"
              value={format}
              onChange={(event) => setFormat(event.target.value as OutputFormat)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="same">Same as source</option>
              <option value="webp">{IMAGE_FORMATS.webp?.label}</option>
              <option value="jpeg">{IMAGE_FORMATS.jpeg?.label}</option>
              <option value="png">{IMAGE_FORMATS.png?.label}</option>
            </select>
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
              disabled={file === null || busy}
              onClick={() => void handleResize()}
            >
              {busy ? 'Resizing…' : 'Resize image'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </Button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Need an exact file size in KB instead? Resize here first, then run the result through
            the image compressor in target-size mode.
          </p>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Resized image</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">The resized image appears here.</p>
          ) : (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.url}
                alt={result.name}
                className="mx-auto max-h-80 rounded-lg"
                loading="lazy"
              />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {result.dimensions} · {formatBytes(result.bytes)}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadBlob(result.blob, result.name)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
