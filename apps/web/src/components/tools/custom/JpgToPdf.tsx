'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { countPdfPages, detectImageType, imagesToPdf, replaceExtension } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { downloadBytes, fileToBytes, imageBlobToPngBytes, isImageFile } from './pdfUtils';

type Orientation = 'portrait' | 'landscape' | 'fit';

interface BuiltPdf {
  url: string;
  bytes: Uint8Array;
  pages: number;
  name: string;
}

export default function JpgToPdf(): React.ReactElement {
  const [files, setFiles] = useState<ReadonlyArray<File>>([]);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuiltPdf | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  function addFiles(incoming: Iterable<File>): void {
    const images = Array.from(incoming).filter(isImageFile);
    if (images.length === 0) {
      setError('Only image files can go into the PDF — JPG, PNG, WebP and other common photos.');
      return;
    }
    const next = [...files, ...images];
    if (next.length > 20) {
      setError('One PDF holds up to 20 images — the first 20 were kept.');
    } else {
      setError(null);
    }
    setFiles(next.slice(0, 20));
    setResult(null);
  }

  async function handleConvert(): Promise<void> {
    if (files.length === 0) {
      setError('Choose at least one image.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const images: Array<{ data: Uint8Array; name?: string }> = [];
      for (const file of files) {
        const raw = await fileToBytes(file);
        // pdf-lib embeds JPG/PNG losslessly; anything else the browser
        // accepted (WebP, GIF, BMP, …) is transcoded to PNG first so no
        // supported input is ever rejected at conversion time.
        const data = detectImageType(raw) === null ? await imageBlobToPngBytes(file) : raw;
        images.push({ data, name: file.name });
      }
      const pdf = await imagesToPdf(images, { orientation });
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      const blob = new Blob([pdf.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
      const first = files[0] as File;
      setResult({
        url: URL.createObjectURL(blob),
        bytes: pdf,
        pages: await countPdfPages(pdf),
        name: replaceExtension(first.name, 'pdf'),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Conversion failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    if (result !== null) {
      URL.revokeObjectURL(result.url);
    }
    setFiles([]);
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
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              JPG · PNG · WEBP · up to 20 · one page each
            </span>
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
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2 text-sm dark:bg-zinc-900"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold dark:bg-zinc-700">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFiles(files.filter((_, position) => position !== index));
                      setResult(null);
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="jpg-to-pdf-orientation">Page orientation</Label>
            <select
              id="jpg-to-pdf-orientation"
              value={orientation}
              onChange={(event) => setOrientation(event.target.value as Orientation)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="portrait">Portrait A4</option>
              <option value="landscape">Landscape A4</option>
              <option value="fit">Exact fit (page matches each photo)</option>
            </select>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Photos are embedded losslessly — the PDF keeps the original pixels.
            </p>
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
              {busy ? 'Converting…' : 'Convert to PDF'}
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
          <CardTitle>Your PDF</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your PDF will appear here with a preview and download button.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {result.pages} page{result.pages === 1 ? '' : 's'} created
              </p>
              <iframe
                src={result.url}
                title="Generated PDF preview"
                className="h-96 w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
              />
              <Button
                type="button"
                onClick={() => downloadBytes(result.bytes, result.name, 'application/pdf')}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download {result.name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
