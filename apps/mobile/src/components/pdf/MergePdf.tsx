import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Screen } from '@/components/ui';
import { fileBytes, isPdfFile, pickDocument, saveAndShare } from './mobile-pdf-utils';

export default function MergePdfScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [files, setFiles] = useState<
    ReadonlyArray<{ uri: string; name: string; bytes: Uint8Array }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addFile(): Promise<void> {
    const picked = await pickDocument();
    if (picked === null) return;
    if (!isPdfFile(picked.name)) {
      setError('Only PDF files can be merged.');
      return;
    }
    const bytes = await fileBytes(picked.uri);
    setFiles((prev) => {
      const next = [...prev, { uri: picked.uri, name: picked.name, bytes }];
      if (next.length > 20) {
        setError('Merging is capped at 20 files.');
        return next.slice(0, 20);
      }
      setError(null);
      return next;
    });
  }

  async function handleMerge(): Promise<void> {
    if (files.length < 2) {
      setError('Choose at least two PDFs to merge.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const merged = await PDFDocument.create();
      for (const { bytes } of files) {
        const source = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(source, source.getPageIndices());
        for (const page of pages) {
          merged.addPage(page);
        }
      }
      const output = await merged.save({ useObjectStreams: true });
      await saveAndShare(output, 'merged.pdf', 'application/pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merging failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>
          {t('en', 'tool.name')}: Merge PDF
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Combine 2–20 PDF files into one document.
        </Text>
        <Button onPress={addFile}>Add PDF</Button>
        {files.length > 0 ? <Text style={styles.info}>{files.length} files selected</Text> : null}
        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={() => void handleMerge()} disabled={files.length < 2 || busy}>
          Merge PDFs
        </Button>
        {busy ? <Text style={styles.status}>Merging…</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  description: { fontSize: 14 },
  info: { fontSize: 14, color: '#6b7280' },
  error: { color: '#dc2626', fontSize: 14 },
  status: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
