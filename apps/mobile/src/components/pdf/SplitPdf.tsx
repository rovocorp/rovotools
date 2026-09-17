import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Screen } from '@/components/ui';
import { fileBytes, isPdfFile, pickDocument, saveAndShare } from './mobile-pdf-utils';

interface PageInfo {
  index: number;
  width: number;
  height: number;
}

export default function SplitPdfScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [file, setFile] = useState<{ uri: string; name: string; bytes: Uint8Array } | null>(null);
  const [pages, setPages] = useState<ReadonlyArray<PageInfo>>([]);
  const [selected, setSelected] = useState<ReadonlyArray<number>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(): Promise<void> {
    const picked = await pickDocument();
    if (picked === null) return;
    if (!isPdfFile(picked.name)) {
      setError('Only PDF files can be split.');
      return;
    }
    const bytes = await fileBytes(picked.uri);
    setFile({ uri: picked.uri, name: picked.name, bytes });
    try {
      const doc = await PDFDocument.load(bytes);
      const info = doc.getPageIndices().map((index) => {
        const page = doc.getPage(index);
        return { index, width: page.getWidth(), height: page.getHeight() };
      });
      setPages(info);
      setSelected(info.map((p) => p.index));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that PDF.');
      setPages([]);
      setSelected([]);
    }
  }

  function togglePage(index: number): void {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }

  async function handleSplit(): Promise<void> {
    if (file === null || selected.length === 0) {
      setError('Choose a PDF and select pages to extract.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      for (const pageIndex of selected) {
        const doc = await PDFDocument.create();
        const source = await PDFDocument.load(file.bytes);
        const [copied] = await doc.copyPages(source, [pageIndex]);
        doc.addPage(copied);
        const output = await doc.save({ useObjectStreams: true });
        await saveAndShare(output, `page-${pageIndex + 1}.pdf`, 'application/pdf');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Splitting failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>
          {t('en', 'tool.name')}: Split PDF
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Extract specific pages into individual PDFs.
        </Text>
        <Button onPress={pick}>Choose PDF</Button>
        {file !== null ? (
          <Text style={styles.info}>
            {file.name} · {pages.length} pages
          </Text>
        ) : null}
        {pages.length > 0 ? (
          <View style={styles.grid}>
            {pages.map((page) => (
              <TouchableOpacity
                key={page.index}
                onPress={() => togglePage(page.index)}
                style={[styles.pageChip, selected.includes(page.index) && styles.pageChipSelected]}
              >
                <Text
                  style={
                    selected.includes(page.index) ? styles.pageChipTextSel : styles.pageChipText
                  }
                >
                  {page.index + 1} ({Math.round(page.width)}×{Math.round(page.height)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={() => void handleSplit()} disabled={selected.length === 0 || busy}>
          Extract Selected Pages
        </Button>
        {busy ? <Text style={styles.status}>Splitting…</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  description: { fontSize: 14 },
  info: { fontSize: 14, color: '#6b7280' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  pageChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  pageChipSelected: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  pageChipText: { fontSize: 14, color: '#1f2937' },
  pageChipTextSel: { fontSize: 14, color: '#ffffff', fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 14 },
  status: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
