'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FilePlus, RotateCcw } from 'lucide-react';
import { countPdfPages, parsePageRanges, replaceExtension } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { downloadBytes, fileToBytes, isPdfFile, renderPdfPageToJpeg } from './pdfUtils';

interface RenderedImage {
  url: string;
  bytes: Uint8Array;
  name: string;
  width: number;
  height: number;
}

export default function PdfToJpg(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pages, setPages] = useState('');
  const [scale, setScale] = useState('2');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReadonlyArray<RenderedImage>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const result of results) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [results]);

  async function choose(incoming: File | null): Promise<void> {
    if (incoming === null || !isPdfFile(incoming)) {
      setError('Choose a single PDF file to convert.');
      return;
    }
    setError(null);
    setResults([]);
    setFile(incoming);
    try {
      setPageCount(await countPdfPages(await fileToBytes(incoming)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not read that PDF.');
      setFile(null);
      setPageCount(null);
    }
  }

  async function handleConvert(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    const parsedScale = Number(scale);
    if (![1, 2, 3].includes(parsedScale)) {
      setError('Render scale must be 1, 2 or 3.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await fileToBytes(file);
      const total = await countPdfPages(bytes);
      const wanted =
        pages.trim() === ''
          ? Array.from({ length: total }, (_, index) => index)
          : parsePageRanges(pages, total);
      const done: Array<RenderedImage> = [];
      for (const pageIndex of wanted) {
        setStatus(`Rendering page ${pageIndex + 1} of ${total}…`);
        const rendered = await renderPdfPageToJpeg(bytes, pageIndex, parsedScale);
        done.push({
          url: rendered.url,
          bytes: new Uint8Array(await rendered.blob.arrayBuffer()),
          name: replaceExtension(file.name.replace(/\.pdf$/i, `-p${pageIndex + 1}`), 'jpg'),
          width: rendered.width,
          height: rendered.height,
        });
      }
      for (const previous of results) {
        URL.revokeObjectURL(previous.url);
      }
      setResults(done);
      setStatus(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Conversion failed.');
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    for (const previous of results) {
      URL.revokeObjectURL(previous.url);
    }
    setFile(null);
    setPageCount(null);
    setPages('');
    setResults([]);
    setError(null);
    setStatus(null);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your PDF</CardTitle>
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
              const dropped = Array.from(event.dataTransfer.files)[0];
              void choose(dropped ?? null);
            }}
            className={cn(
              'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-sm transition-colors',
              dragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-zinc-300 dark:border-zinc-700',
            )}
          >
            <FilePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop a PDF here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Single PDF · up to 100 MB</span>
          </button>
          <input
            aria-label="Upload PDF files"
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? [])[0];
              void choose(selected ?? null);
            }}
          />
          {file !== null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{file.name}</span>
              {pageCount !== null ? ` · ${pageCount} pages` : ''}
            </p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="pdf-to-jpg-pages">Pages to render (optional)</Label>
            <Input
              id="pdf-to-jpg-pages"
              placeholder="All pages"
              value={pages}
              onChange={(event) => setPages(event.target.value)}
            />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Leave empty for every page, or use ranges like 1-3,5.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdf-to-jpg-scale">Render scale</Label>
            <select
              id="pdf-to-jpg-scale"
              value={scale}
              onChange={(event) => setScale(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="1">1x — smallest files</option>
              <option value="2">2x — crisp on screens</option>
              <option value="3">3x — best for print</option>
            </select>
          </div>
          {status !== null ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p> : null}
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
              onClick={() => void handleConvert()}
            >
              {busy ? 'Rendering…' : 'Convert to JPG'}
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
          <CardTitle>Rendered images</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Each rendered page will appear here with its own download button.
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
                      {result.width} × {result.height}px
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBytes(result.bytes, result.name, 'image/jpeg')}
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
                    downloadBytes(result.bytes, result.name, 'image/jpeg');
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
