'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FileCode2, RotateCcw } from 'lucide-react';
import {
  IMAGE_FORMATS,
  assertImageBatchSize,
  imageQualityToRatio,
  normalizeImageFormat,
  normalizeImageQuality,
  type WebImageFormat,
} from '@/shared/tools/images';
import {
  computeRasterTarget,
  intrinsicSvgSize,
  normalizeRasterScale,
  normalizeRasterWidth,
  parseSvgDimensions,
} from '@/shared/tools/svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { assertImageFileSize } from '@/shared/tools/images';
import { canvasToBlob, downloadBlob, formatBytes } from './imageUtils';

interface ConvertedFile {
  name: string;
  fromBytes: number;
  toBytes: number;
  width: number;
  height: number;
  url: string;
  blob: Blob;
}

const FORMAT_ORDER: ReadonlyArray<WebImageFormat> = ['png', 'jpeg', 'webp'];
const MAX_SVG_BATCH = 20;

function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
}

async function rasterizeSvg(file: File, format: WebImageFormat, quality: number, scale: number, targetWidth: number | undefined, background: string): Promise<ConvertedFile> {
  assertImageFileSize(file.size);
  const text = await file.text();
  const dims = parseSvgDimensions(text);
  const intrinsic = intrinsicSvgSize(dims);
  const target = computeRasterTarget(intrinsic, targetWidth !== undefined ? { targetWidth } : { scale });

  const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`Could not render ${file.name}. The SVG may reference external files or use unsupported features.`));
      element.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('Your browser would not give this page a canvas to draw on.');
    }
    const bg = background.trim();
    if (bg !== '') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const info = IMAGE_FORMATS[format];
    const outBlob = await canvasToBlob(canvas, info.mime, info.supportsQuality ? imageQualityToRatio(quality) : undefined);
    const base = file.name.replace(/\.svg$/i, '') || 'image';
    return {
      name: `${base}.${info.extension}`,
      fromBytes: file.size,
      toBytes: outBlob.size,
      width: target.width,
      height: target.height,
      url: URL.createObjectURL(outBlob),
      blob: outBlob,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function SvgToImage(): React.ReactElement {
  const [files, setFiles] = useState<ReadonlyArray<File>>([]);
  const [format, setFormat] = useState<WebImageFormat>('png');
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState('');
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState('');
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
    const next = [...files, ...incoming].filter(isSvgFile);
    try {
      assertImageBatchSize(next.length === 0 ? 1 : next.length);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Too many files.');
      return;
    }
    if (next.length > MAX_SVG_BATCH) {
      setError(`Convert up to ${MAX_SVG_BATCH} SVGs at once — the first ${MAX_SVG_BATCH} were kept.`);
    } else {
      setError(null);
    }
    setFiles(next.slice(0, MAX_SVG_BATCH));
  }

  async function handleConvert(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const targetFormat = normalizeImageFormat(format);
      const q = normalizeImageQuality(String(quality));
      const scaleValue = normalizeRasterScale(String(scale));
      const targetWidth = normalizeRasterWidth(width);
      const done: Array<ConvertedFile> = [];
      for (const file of files) {
        done.push(await rasterizeSvg(file, targetFormat, q, scaleValue, targetWidth, background));
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
          <CardTitle>Your SVG files</CardTitle>
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
            <FileCode2 className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop SVG files here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">SVG only · up to 20 at once</span>
          </button>
          <input
            aria-label="Upload SVG files"
            ref={inputRef}
            type="file"
            accept=".svg,image/svg+xml"
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
            <Label htmlFor="svg-to-image-format">Convert to</Label>
            <select
              id="svg-to-image-format"
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
            <Label htmlFor="svg-to-image-scale">Scale (×) — leave width empty to use this</Label>
            <select
              id="svg-to-image-scale"
              value={String(scale)}
              onChange={(event) => setScale(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {[1, 2, 3, 4, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}×
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svg-to-image-width">Exact width in px (optional — overrides scale)</Label>
            <input
              id="svg-to-image-width"
              type="number"
              min={1}
              max={8192}
              value={width}
              placeholder="e.g. 1024"
              onChange={(event) => setWidth(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svg-to-image-quality">
              Quality{qualityApplies ? ` — ${quality}%` : ' (PNG is lossless: setting ignored)'}
            </Label>
            <input
              id="svg-to-image-quality"
              type="range"
              min={1}
              max={100}
              value={quality}
              disabled={!qualityApplies}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svg-to-image-bg">Background colour (optional — e.g. #ffffff for JPEG)</Label>
            <input
              id="svg-to-image-bg"
              type="text"
              value={background}
              placeholder="Leave empty to keep transparency (PNG/WebP)"
              onChange={(event) => setBackground(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          {error !== null ? (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={files.length === 0 || busy} onClick={() => void handleConvert()}>
              {busy ? 'Converting…' : 'Convert SVGs'}
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
          <CardTitle>Converted images</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Rasterized images appear here with their dimensions and file sizes.
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.url} className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.url} alt={result.name} width={64} height={64} className="h-16 w-16 rounded-md object-contain" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{result.name}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {result.width}×{result.height} · {formatBytes(result.fromBytes)} → {formatBytes(result.toBytes)}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => downloadBlob(result.blob, result.name)}>
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
