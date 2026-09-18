'use client';

import { useState } from 'react';
import { Pipette } from 'lucide-react';
import { getOutputLabel, registerCoreTools, toolRegistry } from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// The generic ToolRunner seeds the client registry at module scope, but this
// bespoke UI replaces the runner — seed here so require() works on this page.
registerCoreTools(toolRegistry);

function hexCodesIn(text: string): Array<string> {
  return text.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
}

export default function ColorPicker(): React.ReactElement {
  const entry = toolRegistry.require('color-picker');
  const outputs = entry.definition.outputs;
  const [text, setText] = useState('#4f46e5');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function normalizeHex(value: string): string | null {
    const clean = value.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
      return `#${clean.toLowerCase()}`;
    }
    if (/^[0-9a-fA-F]{3}$/.test(clean)) {
      return `#${clean.toLowerCase().split('').map((c) => c + c).join('')}`;
    }
    return null;
  }

  async function onPick(): Promise<void> {
    setError(null);
    setResult(null);
    setCopied(null);
    try {
      const input = { color: text };
      const validation = entry.definition.validate(input);
      if (!validation.valid) {
        setError(validation.errors[0]?.message ?? 'Check your input and try again.');
        return;
      }
      const out = (await entry.definition.execute(input)) as Record<string, unknown>;
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed.');
    }
  }

  async function copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
    } catch {
      setError('Copying failed — select the code and copy it manually.');
    }
  }

  const preview = normalizeHex(text) ?? '#4f46e5';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div
          aria-hidden="true"
          className="h-24 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 sm:h-full sm:min-h-28 sm:w-40"
          style={{ backgroundColor: preview }}
        />
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="color-picker-text">Color (HEX or rgb())</Label>
          <div className="flex gap-2">
            <input
              id="color-picker-swatch"
              type="color"
              aria-label="Pick a color visually"
              value={preview}
              onChange={(e) => setText(e.target.value)}
              className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <Input
              id="color-picker-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="#4f46e5 or rgb(79, 70, 229)"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      <Button type="button" onClick={() => void onPick()}>
        <Pipette className="h-4 w-4" aria-hidden="true" />
        Pick color
      </Button>

      {error !== null ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {result !== null ? (
        <dl className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {outputs.map((field, index) => {
            const value = String(result[field.id] ?? '—');
            const codes = hexCodesIn(value);
            return (
              <div key={field.id} className={index % 2 === 0 ? 'bg-white px-4 py-3 dark:bg-zinc-950' : 'bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60'}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {getOutputLabel('en', field)}
                </dt>
                <dd className="mt-1 break-words font-mono text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
                {codes.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {codes.map((code) => (
                      <button
                        key={`${field.id}-${code}`}
                        type="button"
                        onClick={() => void copy(code)}
                        title={`Copy ${code}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-2.5 font-mono text-xs hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <span aria-hidden="true" className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: code }} />
                        {copied === code ? 'Copied!' : code}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </dl>
      ) : null}
    </div>
  );
}
