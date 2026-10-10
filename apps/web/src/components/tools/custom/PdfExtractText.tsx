'use client';

import { useRef, useState } from 'react';
import { Download, FileText, RotateCcw } from 'lucide-react';
import { countPdfPages, replaceExtension } from '@/shared/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadBytes, extractPdfTextPages, fileToBytes, isPdfFile } from './pdfUtils';

export default function PdfExtractText(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<ReadonlyArray<string> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function choose(incoming: File | null): void {
    if (incoming === null || !isPdfFile(incoming)) {
      setError('Choose a single PDF file to extract.');
      return;
    }
    setError(null);
    setPages(null);
    setFile(incoming);
  }

  async function handleExtract(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setStatus('Reading pagesâ€¦');
      const bytes = await fileToBytes(file);
      const total = await countPdfPages(bytes);
      setStatus(`Extracting text from ${total} page${total === 1 ? '' : 's'}â€¦`);
      const extracted = await extractPdfTextPages(bytes);
      const joined = extracted.map((lines) => lines.join('\n'));
      if (joined.every((page) => page.trim() === '')) {
        throw new RangeError(
          'No selectable text found â€” this PDF looks scanned (image-only). It needs OCR first.',
        );
      }
      setPages(joined);
      setStatus(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not extract text from that PDF.');
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  function handleDownload(): void {
    if (pages === null || file === null) {
      return;
    }
    const body = pages.map((page, index) => `----- Page ${index + 1} -----\n${page}`).join('\n\n');
    downloadBytes(new TextEncoder().encode(body), replaceExtension(file.name, 'txt'), 'text/plain');
  }

  function reset(): void {
    setFile(null);
    setPages(null);
    setError(null);
    setStatus(null);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  const totalLines = pages === null ? 0 : pages.reduce((sum, page) => sum + page.split('\n').filter((l) => l.trim() !== '').length, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extract text from a PDF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Choose a PDF file"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            choose(event.dataTransfer.files[0] ?? null);
          }}
          className={
            dragging
              ? 'rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50 p-6 text-center text-sm dark:bg-indigo-950/30'
              : 'rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
          }
        >
          <FileText className="mx-auto h-8 w-8" aria-hidden="true" />
          <p className="mt-2 font-semibold">{file === null ? 'Drop a PDF here or click to choose' : file.name}</p>
          <p className="mt-1 text-xs">Up to 100 MB Â· processed on your device</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(event) => choose(event.target.files?.[0] ?? null)}
          />
        </div>
        {status !== null ? (
          <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p>
        ) : null}
        {error !== null ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleExtract} disabled={file === null || busy}>
            {busy ? 'Extractingâ€¦' : 'Extract text'}
          </Button>
          {pages !== null ? (
            <Button type="button" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" aria-hidden="true" /> Download .txt
            </Button>
          ) : null}
          {(file !== null || pages !== null) && !busy ? (
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </Button>
          ) : null}
        </div>
        {pages !== null ? (
          <div className="space-y-3">
            <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
              {pages.length} page{pages.length === 1 ? '' : 's'} Â· {totalLines} lines of text
            </p>
            <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              {pages.map((page, index) => (
                <div key={`page-${index}`}>
                  <p className="font-semibold text-zinc-500">Page {index + 1}</p>
                  <p className="mt-1 whitespace-pre-wrap">{page === '' ? '(no text on this page)' : page}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
