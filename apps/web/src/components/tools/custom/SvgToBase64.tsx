'use client';

import { useEffect, useState } from 'react';
import { ClipboardCopy, FileCode2, Upload } from 'lucide-react';
import {
  normalizeSvgSource,
  svgToBase64,
  svgToBase64DataUri,
  svgToCssBackground,
  svgToEncodedDataUri,
} from '@/shared/tools/svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatBytes } from './imageUtils';

interface EncodedOutput {
  readonly label: string;
  readonly value: string;
  readonly note: string;
}

export default function SvgToBase64(): React.ReactElement {
  const [source, setSource] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl !== null) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function applySource(text: string, name: string | null, bytes: number | null): void {
    const normalized = normalizeSvgSource(text);
    if (normalized === '' || !/<svg[\s>]/i.test(normalized)) {
      setError('That does not look like valid SVG markup — it needs an <svg> root element.');
      return;
    }
    setSource(normalized);
    setFileName(name);
    setFileBytes(bytes);
    setError(null);
    if (previewUrl !== null) {
      URL.revokeObjectURL(previewUrl);
    }
    const blob = new Blob([normalized], { type: 'image/svg+xml;charset=utf-8' });
    setPreviewUrl(URL.createObjectURL(blob));
  }

  function handleFile(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      setError('Keep SVG files under 5 MB for encoding.');
      return;
    }
    file.text().then(
      (text) => applySource(text, file.name, file.size),
      () => setError('Could not read that file.'),
    );
  }

  const trimmed = source.trim();
  const valid = trimmed !== '' && /<svg[\s>]/i.test(trimmed);
  const outputs: ReadonlyArray<EncodedOutput> = valid
    ? [
        { label: 'Raw Base64', value: svgToBase64(trimmed), note: 'No data: prefix — paste into APIs or JSON payloads.' },
        {
          label: 'Base64 data URI',
          value: svgToBase64DataUri(trimmed),
          note: 'Works in <img src>, CSS url() and most embed contexts.',
        },
        {
          label: 'URL-encoded data URI',
          value: svgToEncodedDataUri(trimmed),
          note: 'Often smaller than Base64 for text-heavy SVGs.',
        },
        { label: 'CSS background-image', value: svgToCssBackground(trimmed), note: 'Ready-to-paste declaration for stylesheets.' },
      ]
    : [];

  async function copyOutput(index: number): Promise<void> {
    const output = outputs[index];
    if (output === undefined) {
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      setError('Clipboard access was blocked — select the output and copy manually.');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>SVG source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            htmlFor="svg-to-base64-file"
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-8 text-sm transition-colors hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-700 dark:hover:bg-indigo-950/20"
          >
            <Upload className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <span className="font-semibold">Upload an SVG file</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Or paste source below · nothing is uploaded</span>
          </label>
          <input
            id="svg-to-base64-file"
            type="file"
            accept=".svg,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) {
                handleFile(file);
              }
            }}
          />
          <div className="space-y-1.5">
            <Label htmlFor="svg-to-base64-source">Or paste SVG source</Label>
            <textarea
              id="svg-to-base64-source"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setFileName(null);
                setFileBytes(null);
              }}
              rows={10}
              placeholder="<svg xmlns=…>…</svg>"
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          {fileName !== null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loaded {fileName}
              {fileBytes !== null ? ` · ${formatBytes(fileBytes)}` : ''}
            </p>
          ) : null}
          {error !== null ? (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          ) : null}
          {previewUrl !== null ? (
            <div className="rounded-lg border border-zinc-200 bg-[conic-gradient(#e4e4e7_25%,transparent_0%,transparent_75%,#e4e4e7_0)_0_0/16px_16px] p-4 dark:border-zinc-700 dark:bg-[conic-gradient(#27272a_25%,transparent_0%,transparent_75%,#27272a_0)_0_0/16px_16px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="SVG preview" className="mx-auto max-h-40 object-contain" />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Encoded output</CardTitle>
        </CardHeader>
        <CardContent>
          {!valid ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Upload or paste an SVG to get Base64, data URIs and a CSS background snippet.
            </p>
          ) : (
            <div className="space-y-4">
              {outputs.map((output, index) => (
                <div key={output.label} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{output.label}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => void copyOutput(index)}>
                      <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                      {copiedIndex === index ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{output.note}</p>
                  <pre className="max-h-32 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs break-all dark:bg-zinc-900">
                    {output.value}
                  </pre>
                </div>
              ))}
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                <FileCode2 className="mr-1 inline h-3 w-3" aria-hidden="true" />
                Base64 adds ~33% size versus URL-encoding for most SVGs — pick the URL-encoded URI when size matters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
