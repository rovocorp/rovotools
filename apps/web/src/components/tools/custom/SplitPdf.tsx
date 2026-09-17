'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FilePlus, RotateCcw } from 'lucide-react';
import { countPdfPages, parsePageRanges, splitPdfDocument, withSuffix } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { downloadBytes, fileToBytes, isPdfFile } from './pdfUtils';

interface SplitResult {
  url: string;
  bytes: Uint8Array;
  pages: number;
  name: string;
}

export default function SplitPdf(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [ranges, setRanges] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SplitResult | null>(null);
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
      setError('Choose a single PDF file to split.');
      return;
    }
    setError(null);
    setResult(null);
    setFile(incoming);
    try {
      setPageCount(await countPdfPages(await fileToBytes(incoming)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not read that PDF.');
      setFile(null);
      setPageCount(null);
    }
  }

  async function handleSplit(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await fileToBytes(file);
      const total = await countPdfPages(bytes);
      const pages = parsePageRanges(ranges, total);
      const extracted = await splitPdfDocument(bytes, pages);
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      const blob = new Blob([extracted.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
      const name = withSuffix(file.name.replace(/\.pdf$/i, ''), 'split') + '.pdf';
      setResult({ url: URL.createObjectURL(blob), bytes: extracted, pages: pages.length, name });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Splitting failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    if (result !== null) {
      URL.revokeObjectURL(result.url);
    }
    setFile(null);
    setPageCount(null);
    setRanges('');
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
            <Label htmlFor="split-pdf-ranges">Pages to keep</Label>
            <Input
              id="split-pdf-ranges"
              placeholder="e.g. 1-3,5"
              value={ranges}
              onChange={(event) => setRanges(event.target.value)}
            />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Singles and ranges separated by commas — 1,4-6,9 keeps pages 1, 4, 5, 6 and 9. The
              original file is never modified.
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
              disabled={file === null || busy}
              onClick={() => void handleSplit()}
            >
              {busy ? 'Splitting…' : 'Split PDF'}
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
          <CardTitle>Extracted pages</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your extracted pages will appear here with a preview and download button.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {result.pages} page{result.pages === 1 ? '' : 's'} extracted
              </p>
              <iframe
                src={result.url}
                title="Split PDF preview"
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
