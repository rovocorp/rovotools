'use client';

import { useRef, useState } from 'react';
import { Download, FilePlus, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MAX_SPREADSHEET_ROWS, sanitizeSpreadsheetCell } from '@rovotools/core';
import { countPdfPages, replaceExtension } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { downloadBytes, extractPdfTextPages, fileToBytes, isPdfFile } from './pdfUtils';

interface ConvertedSheet {
  bytes: Uint8Array;
  name: string;
  pages: number;
  rows: number;
}

export default function PdfToExcel(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertedSheet | null>(null);
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
      const rows: string[][] = [['Page', 'Line', 'Text']];
      pages.forEach((lines, pageIndex) => {
        if (lines.length === 0) {
          rows.push([String(pageIndex + 1), '', '(no selectable text on this page)']);
          return;
        }
        lines.forEach((line, lineIndex) => {
          // PDF text is untrusted input: sanitize before it becomes a cell,
          // or `=cmd|…` lines would execute as formulas when opened in Excel.
          rows.push([String(pageIndex + 1), String(lineIndex + 1), sanitizeSpreadsheetCell(line)]);
        });
      });
      if (rows.length - 1 > MAX_SPREADSHEET_ROWS) {
        throw new RangeError(
          `Too many rows for a spreadsheet (${rows.length - 1} found, ${MAX_SPREADSHEET_ROWS} max). Split the PDF and convert it in parts.`,
        );
      }
      if (rows.length <= 1) {
        throw new RangeError(
          'No selectable text found — this PDF looks scanned (image-only). It needs OCR first.',
        );
      }
      setStatus('Building spreadsheet…');
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols'] = [{ wch: 8 }, { wch: 8 }, { wch: 100 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'PDF text');
      const array = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      }) as unknown as ArrayBuffer;
      setResult({
        bytes: new Uint8Array(array),
        name: replaceExtension(file.name, 'xlsx'),
        pages: total,
        rows: rows.length - 1,
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
            Lines become rows in reading order — true table detection needs server-side analysis, so
            tidy columns in your spreadsheet afterwards.
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
              {busy ? 'Converting…' : 'Convert to Excel'}
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
          <CardTitle>Your spreadsheet</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your .xlsx will appear here with a download button.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {result.pages} page{result.pages === 1 ? '' : 's'} processed · {result.rows} rows
                extracted
              </p>
              <Button
                type="button"
                onClick={() =>
                  downloadBytes(
                    result.bytes,
                    result.name,
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
