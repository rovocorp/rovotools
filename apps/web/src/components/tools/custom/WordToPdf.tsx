'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FilePlus, RotateCcw } from 'lucide-react';
import { extractRawText } from 'mammoth';
import { countPdfPages, createTextPdf, replaceExtension } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { downloadBytes, fileToBytes } from './pdfUtils';

interface ConvertedPdf {
  url: string;
  bytes: Uint8Array;
  pages: number;
  name: string;
}

function isDocx(file: File): boolean {
  return (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  );
}

export default function WordToPdf(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertedPdf | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  function choose(incoming: File | null): void {
    if (incoming === null || !isDocx(incoming)) {
      setError('Choose a Word document (.docx). Legacy .doc files need re-saving as .docx first.');
      return;
    }
    setError(null);
    setResult(null);
    setFile(incoming);
  }

  async function handleConvert(): Promise<void> {
    if (file === null) {
      setError('Choose a .docx file first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setStatus('Reading document…');
      const bytes = await fileToBytes(file);
      const extracted = await extractRawText({ arrayBuffer: bytes.slice().buffer as ArrayBuffer });
      const text = extracted.value.replace(/\r\n/g, '\n').trim();
      if (text === '') {
        throw new RangeError(
          'No readable text found in that document (it may be empty or image-only).',
        );
      }
      setStatus('Building PDF…');
      const title = file.name.replace(/\.docx$/i, '');
      const pdf = await createTextPdf(text, { title });
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      const blob = new Blob([pdf.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
      setResult({
        url: URL.createObjectURL(blob),
        bytes: pdf,
        pages: await countPdfPages(pdf),
        name: replaceExtension(file.name, 'pdf'),
      });
      setStatus(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Conversion failed.');
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your Word document</CardTitle>
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
              choose(dropped ?? null);
            }}
            className={cn(
              'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-sm transition-colors',
              dragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-zinc-300 dark:border-zinc-700',
            )}
          >
            <FilePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Drop a .docx here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Word .docx · up to 100 MB</span>
          </button>
          <input
            aria-label="Upload Word document"
            ref={inputRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? [])[0];
              choose(selected ?? null);
            }}
          />
          {file !== null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{file.name}</span>
            </p>
          ) : null}
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Text, headings and lists carry over cleanly. Pixel-perfect layout (floating images,
            intricate tables) may simplify — this is a private on-device conversion.
          </p>
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
                title="Converted PDF preview"
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
