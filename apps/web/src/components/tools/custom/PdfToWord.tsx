'use client';

import { useRef, useState } from 'react';
import { Download, FilePlus, RotateCcw } from 'lucide-react';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { countPdfPages, replaceExtension } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { downloadBytes, extractPdfTextPages, fileToBytes, isPdfFile } from './pdfUtils';

interface ConvertedDoc {
  bytes: Uint8Array;
  name: string;
  pages: number;
  lines: number;
}

export default function PdfToWord(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertedDoc | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function choose(incoming: File | null): void {
    if (incoming === null || !isPdfFile(incoming)) {
      setError('Choose a single PDF file to convert.');
      return;
    }
    setError(null);
    setResult(null);
    setFile(incoming);
  }

  async function handleConvert(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setStatus('Extracting text…');
      const bytes = await fileToBytes(file);
      const total = await countPdfPages(bytes);
      const pages = await extractPdfTextPages(bytes);
      const lineCount = pages.reduce((sum, lines) => sum + lines.length, 0);
      if (lineCount === 0) {
        throw new RangeError(
          'No selectable text found — this PDF looks scanned (image-only). It needs OCR first.',
        );
      }
      setStatus('Building Word document…');
      const children: Paragraph[] = [];
      pages.forEach((lines, index) => {
        if (pages.length > 1) {
          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun(`Page ${index + 1}`)],
            }),
          );
        }
        for (const line of lines) {
          children.push(new Paragraph({ children: [new TextRun(line)] }));
        }
      });
      const document = new Document({
        sections: [{ children }],
        title: file.name.replace(/\.pdf$/i, ''),
      });
      const blob = await Packer.toBlob(document);
      setResult({
        bytes: new Uint8Array(await blob.arrayBuffer()),
        name: replaceExtension(file.name, 'docx'),
        pages: total,
        lines: lineCount,
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
            <span className="font-semibold">Drop a PDF here, or click to browse</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Text-based PDF · up to 100 MB</span>
          </button>
          <input
            aria-label="Upload PDF files"
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
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
            Text content carries over into an editable document; original layout does not. Scanned
            image-only PDFs contain no text to extract.
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
              {busy ? 'Converting…' : 'Convert to Word'}
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
          <CardTitle>Your Word document</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your .docx will appear here with a download button.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {result.pages} page{result.pages === 1 ? '' : 's'} processed · {result.lines} lines
                extracted
              </p>
              <Button
                type="button"
                onClick={() =>
                  downloadBytes(
                    result.bytes,
                    result.name,
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  )
                }
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
