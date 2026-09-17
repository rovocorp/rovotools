'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FilePlus, RotateCcw } from 'lucide-react';
import { countPdfPages, stampSignatureOnPdf, withSuffix } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { downloadBytes, fileToBytes, isPdfFile } from './pdfUtils';

interface SignedPdf {
  url: string;
  bytes: Uint8Array;
  name: string;
}

export default function SignPdf(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [page, setPage] = useState('1');
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [xPct, setXPct] = useState(60);
  const [yPct, setYPct] = useState(12);
  const [widthPct, setWidthPct] = useState(30);
  const [hasInk, setHasInk] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SignedPdf | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  async function choose(incoming: File | null): Promise<void> {
    if (incoming === null || !isPdfFile(incoming)) {
      setError('Choose a single PDF file to sign.');
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

  function canvasPosition(event: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>): void {
    event.preventDefault();
    drawingRef.current = true;
    lastRef.current = canvasPosition(event);
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>): void {
    if (!drawingRef.current) {
      return;
    }
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const last = lastRef.current;
    if (canvas === null || context == null || last === null) {
      return;
    }
    const next = canvasPosition(event);
    context.strokeStyle = '#1e3a8a';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    lastRef.current = next;
    setHasInk(true);
  }

  function stopDrawing(): void {
    drawingRef.current = false;
    lastRef.current = null;
  }

  function clearPad(): void {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  function signaturePng(): Promise<Uint8Array> {
    if (mode === 'type') {
      if (typedName.trim() === '') {
        return Promise.reject(new RangeError('Type your name to use it as a signature.'));
      }
      const canvas = globalThis.document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 200;
      const context = canvas.getContext('2d');
      if (context === null) {
        return Promise.reject(
          new Error('Your browser would not give this page a canvas to draw on.'),
        );
      }
      context.fillStyle = '#1e3a8a';
      context.font = "italic 96px Georgia, 'Times New Roman', serif";
      context.textBaseline = 'middle';
      context.fillText(typedName.trim().slice(0, 40), 20, 110);
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob === null) {
            reject(new Error('Could not render the signature.'));
          } else {
            void blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)));
          }
        }, 'image/png');
      });
    }
    const canvas = canvasRef.current;
    if (canvas === null || !hasInk) {
      return Promise.reject(new RangeError('Draw your signature on the pad first.'));
    }
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob === null) {
          reject(new Error('Could not render the signature.'));
        } else {
          void blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)));
        }
      }, 'image/png');
    });
  }

  async function handleSign(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    const pageNumber = Number(page);
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      setError('Enter the page number for the signature, starting at 1.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await fileToBytes(file);
      const signature = await signaturePng();
      const signed = await stampSignatureOnPdf(bytes, signature, {
        pageIndex: pageNumber - 1,
        xPct,
        yPct,
        widthPct,
      });
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      const blob = new Blob([signed.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
      setResult({
        url: URL.createObjectURL(blob),
        bytes: signed,
        name: withSuffix(file.name.replace(/\.pdf$/i, ''), 'signed') + '.pdf',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signing failed.');
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
    setResult(null);
    setError(null);
    clearPad();
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Document + signature</CardTitle>
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
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {file === null
                ? 'Single PDF · up to 100 MB'
                : `${file.name}${pageCount !== null ? ` · ${pageCount} pages` : ''}`}
            </span>
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
          <div className="flex gap-2" role="tablist" aria-label="Signature style">
            {(['draw', 'type'] as const).map((value) => (
              <Button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                variant={mode === value ? 'default' : 'outline'}
                onClick={() => setMode(value)}
              >
                {value === 'draw' ? 'Draw' : 'Type'}
              </Button>
            ))}
          </div>
          {mode === 'draw' ? (
            <div className="space-y-1.5">
              <Label htmlFor="sign-pdf-pad">Draw your signature</Label>
              <canvas
                id="sign-pdf-pad"
                ref={canvasRef}
                width={600}
                height={200}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                className="h-32 w-full cursor-crosshair touch-none rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
              />
              <Button type="button" variant="outline" size="sm" onClick={clearPad}>
                Clear pad
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="sign-pdf-name">Type your name</Label>
              <Input
                id="sign-pdf-name"
                placeholder="e.g. Ada Lovelace"
                value={typedName}
                onChange={(event) => setTypedName(event.target.value)}
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: 'italic',
                  fontSize: '1.25rem',
                }}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sign-pdf-page">Page</Label>
              <Input
                id="sign-pdf-page"
                inputMode="numeric"
                value={page}
                onChange={(event) => setPage(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sign-pdf-width">Size — {widthPct}%</Label>
              <input
                id="sign-pdf-width"
                type="range"
                min={10}
                max={60}
                value={widthPct}
                onChange={(event) => setWidthPct(Number(event.target.value))}
                className="h-10 w-full accent-indigo-600"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sign-pdf-x">From left — {xPct}%</Label>
              <input
                id="sign-pdf-x"
                type="range"
                min={0}
                max={80}
                value={xPct}
                onChange={(event) => setXPct(Number(event.target.value))}
                className="h-10 w-full accent-indigo-600"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sign-pdf-y">From bottom — {yPct}%</Label>
              <input
                id="sign-pdf-y"
                type="range"
                min={0}
                max={80}
                value={yPct}
                onChange={(event) => setYPct(Number(event.target.value))}
                className="h-10 w-full accent-indigo-600"
              />
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            A visible signature for everyday agreements — for regulated contracts use a qualified
            e-signature provider.
          </p>
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
              onClick={() => void handleSign()}
            >
              {busy ? 'Signing…' : 'Sign PDF'}
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
          <CardTitle>Signed PDF</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your signed PDF will appear here with a preview and download button.
            </p>
          ) : (
            <div className="space-y-3">
              <iframe
                src={result.url}
                title="Signed PDF preview"
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
