import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Screen } from '@/components/ui';
import { fileBytes, isPdfFile, pickDocument, saveAndShare } from './mobile-pdf-utils';

export default function CompressPdfScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [file, setFile] = useState<{ uri: string; name: string; bytes: Uint8Array } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(): Promise<void> {
    const picked = await pickDocument();
    if (picked === null) return;
    if (!isPdfFile(picked.name)) {
      setError('Only PDF files can be compressed.');
      return;
    }
    const bytes = await fileBytes(picked.uri);
    setFile({ uri: picked.uri, name: picked.name, bytes });
    setError(null);
  }

  async function handleCompress(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.load(file.bytes);
      const output = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      await saveAndShare(output, `compressed-${file.name}`, 'application/pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>
          {t('en', 'tool.name')}: Compress PDF
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Reduce file size by optimizing internal streams.
        </Text>
        <Button onPress={pick}>Choose PDF</Button>
        {file !== null ? <Text style={styles.info}>{file.name}</Text> : null}
        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={() => void handleCompress()} disabled={file === null || busy}>
          Compress PDF
        </Button>
        {busy ? <Text style={styles.status}>Compressing…</Text> : null}
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
