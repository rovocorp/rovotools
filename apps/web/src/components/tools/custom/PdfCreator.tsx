'use client';

import { useEffect, useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { countPdfPages, createTextPdf, replaceExtension } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { downloadBytes } from './pdfUtils';

interface CreatedPdf {
  url: string;
  bytes: Uint8Array;
  pages: number;
}

export default function PdfCreator(): React.ReactElement {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedPdf | null>(null);

  useEffect(() => {
    return () => {
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  async function handleCreate(): Promise<void> {
    if (text.trim() === '') {
      setError('Enter some text to put in the PDF.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const pdf = await createTextPdf(text, title.trim() === '' ? {} : { title: title.trim() });
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      const blob = new Blob([pdf.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
      setResult({ url: URL.createObjectURL(blob), bytes: pdf, pages: await countPdfPages(pdf) });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not create the PDF.');
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    if (result !== null) {
      URL.revokeObjectURL(result.url);
    }
    setTitle('');
    setText('');
    setResult(null);
    setError(null);
  }

  const filename =
    title.trim() === '' ? 'document.pdf' : replaceExtension(title.trim().slice(0, 80), 'pdf');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pdf-creator-title">Title (optional)</Label>
            <Input
              id="pdf-creator-title"
              placeholder="e.g. Meeting notes"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdf-creator-text">Text content</Label>
            <textarea
              id="pdf-creator-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={12}
              placeholder="Paste or type the text for your PDF…"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {text.trim() === '' ? 'No text yet.' : `${text.trim().split(/\s+/).length} words`} ·
              pages are added automatically on A4
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
            <Button type="button" disabled={busy} onClick={() => void handleCreate()}>
              {busy ? 'Creating…' : 'Create PDF'}
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
                {result.pages} page{result.pages === 1 ? '' : 's'} ·{' '}
                {(result.bytes.length / 1024).toFixed(1)} KB
              </p>
              <iframe
                src={result.url}
                title="Created PDF preview"
                className="h-96 w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
              />
              <Button
                type="button"
                onClick={() => downloadBytes(result.bytes, filename, 'application/pdf')}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download {filename}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
