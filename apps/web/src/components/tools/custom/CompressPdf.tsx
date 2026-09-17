'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FilePlus, RotateCcw } from 'lucide-react';
import { countPdfPages, formatBytes, imagesToPdf, resavePdf, withSuffix } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { downloadBytes, fileToBytes, isPdfFile, renderPdfPageToJpeg } from './pdfUtils';

interface CompressResult {
  url: string;
  bytes: Uint8Array;
  fromBytes: number;
  name: string;
}

export default function CompressPdf(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'lossless' | 'compact'>('lossless');
  const [quality, setQuality] = useState(70);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  async function choose(incoming: File | null): Promise<void> {
    if (incoming === null || !isPdfFile(incoming)) {
      setError('Choose a single PDF file to compress.');
      return;
    }
    setError(null);
    setResult(null);
    setFile(incoming);
  }

  async function handleCompress(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const bytes = await fileToBytes(file);
      const total = await countPdfPages(bytes);
      let compressed: Uint8Array;
      if (mode === 'lossless') {
        setStatus('Re-saving with object streams…');
        compressed = await resavePdf(bytes);
      } else {
        // Compact mode rasterizes every page to JPEG and rebuilds the PDF.
        // Text stays readable but is no longer selectable — say so plainly.
        const images: Array<{ data: Uint8Array; name?: string }> = [];
        for (let page = 0; page < total; page += 1) {
          setStatus(`Rendering page ${page + 1} of ${total}…`);
          const rendered = await renderPdfPageToJpeg(bytes, page, 1.5, quality / 100);
          images.push({ data: new Uint8Array(await rendered.blob.arrayBuffer()) });
          URL.revokeObjectURL(rendered.url);
        }
        setStatus('Rebuilding PDF…');
        compressed = await imagesToPdf(images, { orientation: 'fit' });
      }
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      const blob = new Blob([compressed.slice().buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      setResult({
        url: URL.createObjectURL(blob),
        bytes: compressed,
        fromBytes: file.size,
        name: withSuffix(file.name.replace(/\.pdf$/i, ''), 'compressed') + '.pdf',
      });
      setStatus(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Compression failed.');
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    if (result !== null) {
      URL.revokeObjectURL(result.url);
    }
    setFile(null);
    setResult(null);
    setError(null);
    setStatus(null);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  const saved = result === null ? 0 : Math.max(0, result.fromBytes - result.bytes.length);

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
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{file.name}</span> ·{' '}
              {formatBytes(file.size)}
            </p>
          ) : null}
          <div className="flex gap-2" role="tablist" aria-label="Compression mode">
            {(['lossless', 'compact'] as const).map((value) => (
              <Button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                variant={mode === value ? 'default' : 'outline'}
                onClick={() => setMode(value)}
              >
                {value === 'lossless' ? 'Lossless' : 'Compact'}
              </Button>
            ))}
          </div>
          {mode === 'lossless' ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Re-saves with object streams and drops dead objects. Quality is untouched; savings
              depend on how the PDF was built.
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="compress-pdf-quality">JPEG quality — {quality}%</Label>
              <input
                id="compress-pdf-quality"
                type="range"
                min={40}
                max={90}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Pages are re-rendered as images, so files shrink dramatically — but text is no
                longer selectable. Best for scans and image-heavy documents.
              </p>
            </div>
          )}
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
              onClick={() => void handleCompress()}
            >
              {busy ? 'Compressing…' : 'Compress PDF'}
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
          <CardTitle>Compressed PDF</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your smaller PDF will appear here with before/after sizes.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatBytes(result.fromBytes)} → {formatBytes(result.bytes.length)} · saved{' '}
                {formatBytes(saved)}
              </p>
              {saved === 0 ? (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Already lean — this PDF did not shrink. Try Compact mode for image-heavy files.
                </p>
              ) : null}
              <iframe
                src={result.url}
                title="Compressed PDF preview"
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
