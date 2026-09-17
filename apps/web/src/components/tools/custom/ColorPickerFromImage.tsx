'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, ImagePlus, RotateCcw } from 'lucide-react';
import {
  computeFitDimensions,
  extractDominantColors,
  rgbToHex,
  samplePixel,
} from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loadImageElement } from './imageUtils';

// Work on at most this many pixels per side: full precision is unnecessary
// for picking and keeps phones responsive on huge photos.
const MAX_WORK_SIDE = 1200;

export default function ColorPickerFromImage(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampled, setSampled] = useState<string | null>(null);
  const [palette, setPalette] = useState<ReadonlyArray<string>>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [workSize, setWorkSize] = useState<{ width: number; height: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pixelsRef = useRef<Uint8ClampedArray | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function analyzeCurrentImage(): void {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (img === null || canvas === null) {
      return;
    }
    try {
      const fit = computeFitDimensions(
        img.naturalWidth,
        img.naturalHeight,
        MAX_WORK_SIDE,
        MAX_WORK_SIDE,
      );
      canvas.width = fit.width;
      canvas.height = fit.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx === null) {
        throw new Error('Your browser would not give this page a canvas to draw on.');
      }
      ctx.drawImage(img, 0, 0, fit.width, fit.height);
      const data = ctx.getImageData(0, 0, fit.width, fit.height).data;
      pixelsRef.current = data;
      setWorkSize({ width: fit.width, height: fit.height });
      setPalette(extractDominantColors(data, 6));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not read that image.');
    }
  }

  // Draw once the canvas is mounted (it renders when `file` is set).
  useEffect(() => {
    if (file === null) {
      return;
    }
    analyzeCurrentImage();
  }, [file]);

  async function choose(next: File | null): Promise<void> {
    if (next === null || !next.type.startsWith('image/')) {
      return;
    }
    setError(null);
    setSampled(null);
    setPalette([]);
    setCopied(null);
    setWorkSize(null);
    pixelsRef.current = null;
    try {
      imageRef.current = await loadImageElement(next);
      setFile(next);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not read that image.');
    }
  }

  function pickAt(clientX: number, clientY: number): void {
    const canvas = canvasRef.current;
    const pixels = pixelsRef.current;
    if (canvas === null || pixels === null || workSize === null) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * workSize.width;
    const y = ((clientY - rect.top) / rect.height) * workSize.height;
    try {
      const pixel = samplePixel(pixels, workSize.width, workSize.height, x, y);
      setSampled(rgbToHex(pixel.r, pixel.g, pixel.b));
      setCopied(null);
    } catch {
      // Clicks outside the image are ignored.
    }
  }

  async function copy(hex: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
    } catch {
      setError('Copying failed — select the code and copy it manually.');
    }
  }

  function handleReset(): void {
    setFile(null);
    setSampled(null);
    setPalette([]);
    setError(null);
    setCopied(null);
    setWorkSize(null);
    imageRef.current = null;
    pixelsRef.current = null;
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
              {file === null ? 'JPG · PNG · WEBP' : file.name}
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
          {error !== null ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={file === null} onClick={analyzeCurrentImage}>
              {palette.length > 0 ? 'Re-sample colors' : 'Sample colors'}
            </Button>
            <Button type="button" variant="outline" disabled={file === null} onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Pick a color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {file === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Load an image, then click any pixel to read its exact HEX code.
            </p>
          ) : (
            <>
              <button
                type="button"
                aria-label="Sample a color from the image"
                className="block w-full cursor-crosshair overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
                onClick={(event) => pickAt(event.clientX, event.clientY)}
              >
                <canvas ref={canvasRef} className="mx-auto max-h-96 w-auto max-w-full" />
              </button>
              {sampled !== null ? (
                <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <span
                    aria-hidden="true"
                    className="h-10 w-10 rounded-md border border-zinc-200 dark:border-zinc-700"
                    style={{ backgroundColor: sampled }}
                  />
                  <p className="flex-1 font-mono text-lg font-bold">{sampled}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copy(sampled)}
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    {copied === sampled ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Click anywhere on the image to sample that pixel.
                </p>
              )}
              {palette.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Dominant colors
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {palette.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        title={hex}
                        aria-label={`Copy ${hex}`}
                        onClick={() => void copy(hex)}
                        className="h-10 w-10 rounded-md border border-zinc-200 dark:border-zinc-700"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  {copied !== null && copied !== sampled ? (
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">Copied {copied} to the clipboard.</p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
