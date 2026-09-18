'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  TAX_TABLE_REVIEWED,
  getOutputLabel,
  getTaxRegionStandard,
  registerCoreTools,
  toolRegistry,
} from '@rovotools/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// The generic ToolRunner seeds the client registry at module scope, but this
// bespoke UI replaces the runner — seed here so require() works on this page.
registerCoreTools(toolRegistry);

interface ExtraRow {
  readonly key: number;
  name: string;
  rate: string;
}

let nextRowKey = 1;

export default function TaxCalculator(): React.ReactElement {
  const entry = toolRegistry.require('tax-calculator');
  const outputs = entry.definition.outputs;
  const regionField = entry.definition.inputs.find((field) => field.id === 'region');
  const regionOptions = regionField?.options ?? [];

  const [amount, setAmount] = useState('1000');
  const [region, setRegion] = useState('');
  const [rate, setRate] = useState('');
  const [customRate, setCustomRate] = useState('');
  const [mode, setMode] = useState('add');
  const [rows, setRows] = useState<ReadonlyArray<ExtraRow>>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autoStandard = region === '' ? null : getTaxRegionStandard(region);

  function onRegionChange(value: string): void {
    setRegion(value);
    // The regional standard fills the Rate box automatically and stays
    // editable — clearing it falls back to the same standard.
    const standard = value === '' ? null : getTaxRegionStandard(value);
    setRate(standard === null ? '' : String(standard));
  }

  function addRow(): void {
    setRows((prev) => [...prev, { key: nextRowKey++, name: '', rate: '' }]);
  }

  function updateRow(key: number, patch: Partial<ExtraRow>): void {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRow(key: number): void {
    setRows((prev) => prev.filter((row) => row.key !== key));
  }

  async function onCalculate(): Promise<void> {
    setError(null);
    setResult(null);
    try {
      const extraTaxes = rows
        .filter((row) => row.rate.trim() !== "")
        .map((row) => `${row.name.trim() === '' ? 'Extra' : row.name.trim()} = ${row.rate.trim()}`)
        .join('\n');
      const input = { amount, region, rate, customRate, mode, extraTaxes };
      const validation = entry.definition.validate(input);
      if (!validation.valid) {
        setError(validation.errors[0]?.message ?? 'Check your inputs and try again.');
        return;
      }
      const out = (await entry.definition.execute(input)) as Record<string, unknown>;
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="region">Country / region</Label>
          <select
            id="region"
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select a country…</option>
            {regionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {getOutputLabel('en', { id: option.value, type: 'string', labelKey: option.labelKey })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rate">Rate %</Label>
          <Input
            id="rate"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 18"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {autoStandard !== null
              ? `Regional standard ${autoStandard}% — auto-filled and editable.`
              : 'Select a region to auto-fill the standard, or type any rate.'}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customRate">Custom rate % (overrides everything)</Label>
          <Input
            id="customRate"
            inputMode="decimal"
            value={customRate}
            onChange={(e) => setCustomRate(e.target.value)}
            placeholder="e.g. 12"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mode">Mode</Label>
        <select
          id="mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="add">Add tax to net</option>
          <option value="remove">Remove tax from gross</option>
        </select>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Extra taxes (stacked)</p>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add tax
          </Button>
        </div>
        {rows.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            None — add state, county, city or special levies to stack them on top of the base rate.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows.map((row, index) => (
              <li key={row.key} className="flex items-center gap-2">
                <Input
                  id={`extra-name-${index}`}
                  aria-label={`Extra tax ${index + 1} name`}
                  value={row.name}
                  onChange={(e) => updateRow(row.key, { name: e.target.value })}
                  placeholder="City"
                />
                <Input
                  id={`extra-rate-${index}`}
                  aria-label={`Extra tax ${index + 1} rate percent`}
                  inputMode="decimal"
                  value={row.rate}
                  onChange={(e) => updateRow(row.key, { rate: e.target.value })}
                  placeholder="1.5"
                  className="w-24 shrink-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Remove extra tax ${index + 1}`}
                  onClick={() => removeRow(row.key)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="button" onClick={() => void onCalculate()}>
        Calculate tax
      </Button>

      {error !== null ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {result !== null ? (
        <dl className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {outputs.map((field, index) => (
            <div key={field.id} className={index % 2 === 0 ? 'bg-white px-4 py-3 dark:bg-zinc-950' : 'bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60'}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {getOutputLabel('en', field)}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-900 dark:text-zinc-100">
                {String(result[field.id] ?? '—')}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Standard rates reviewed {TAX_TABLE_REVIEWED}. Estimates for planning — verify critical figures with official sources.
      </p>
    </div>
  );
}
