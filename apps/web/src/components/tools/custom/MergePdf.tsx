'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, FilePlus, RotateCcw, Trash2 } from 'lucide-react';
import { countPdfPages, mergePdfs } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { downloadBytes, fileToBytes, isPdfFile } from './pdfUtils';

interface MergedResult {
  url: string;
  pages: number;
  bytes: Uint8Array;
}

export default function MergePdf(): React.ReactElement {
  const [files, setFiles] = useState<ReadonlyArray<File>>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MergedResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  function addFiles(incoming: Iterable<File>): void {
    const pdfs = Array.from(incoming).filter(isPdfFile);
    if (pdfs.length === 0) {
      setError('Only PDF files can be merged — images and documents need converting first.');
      return;
    }
    const next = [...files, ...pdfs];
    if (next.length > 20) {
      setError('Merging is capped at 20 files — the first 20 were kept.');
    } else {
      setError(null);
    }
    setFiles(next.slice(0, 20));
    setResult(null);
  }

  function move(index: number, direction: -1 | 1): void {
    const next = [...files];
    const other = index + direction;
    if (other < 0 || other >= next.length) {
      return;
    }
    const current = next[index] as File;
    next[index] = next[other] as File;
    next[other] = current;
    setFiles(next);
    setResult(null);
  }

  function remove(index: number): void {
    setFiles(files.filter((_, position) => position !== index));
    setResult(null);
  }

  async function handleMerge(): Promise<void> {
    if (files.length < 2) {
      setError('Choose at least two PDFs to merge.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const documents: Array<Uint8Array> = [];
      for (const file of files) {
        documents.push(await fileToBytes(file));
      }
      const merged = await mergePdfs(documents);
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      const blob = new Blob([merged.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
      setResult({
        url: URL.createObjectURL(blob),
        pages: await countPdfPages(merged),
        bytes: merged,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Merging failed.');
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
          <CardTitle>Your PDFs</CardTitle>
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
            <FilePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop PDFs here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">2–20 PDF files · order matters</span>
          </button>
          <input
            aria-label="Upload PDF files"
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="sr-only"
            onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
          />
          {files.length > 0 ? (
            <ol className="space-y-2">
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
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${file.name} up`}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === files.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${file.name} down`}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ol>
          ) : null}
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
              disabled={files.length < 2 || busy}
              onClick={() => void handleMerge()}
            >
              {busy ? 'Merging…' : `Merge ${files.length} PDFs`}
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
          <CardTitle>Merged PDF</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your merged PDF will appear here with a preview and download button.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {files.length} files combined · {result.pages} pages ·{' '}
                {(result.bytes.length / 1024).toFixed(1)} KB
              </p>
              <iframe
                src={result.url}
                title="Merged PDF preview"
                className="h-96 w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
              />
              <Button
                type="button"
                onClick={() => downloadBytes(result.bytes, 'merged.pdf', 'application/pdf')}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download merged.pdf
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
