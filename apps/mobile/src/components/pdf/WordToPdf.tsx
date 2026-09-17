import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import mammoth from 'mammoth';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Screen } from '@/components/ui';
import { fileBytes, isDocxFile, saveAndShare } from './mobile-pdf-utils';

export default function WordToPdfScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [file, setFile] = useState<{ uri: string; name: string; bytes: Uint8Array } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(): Promise<void> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets === undefined || result.assets.length === 0) {
      return;
    }
    const asset = result.assets[0];
    if (!isDocxFile(asset.name)) {
      setError('Choose a .docx file.');
      return;
    }
    const bytes = await fileBytes(asset.uri);
    setFile({ uri: asset.uri, name: asset.name, bytes });
    setError(null);
  }

  async function handleConvert(): Promise<void> {
    if (file === null) {
      setError('Choose a .docx file first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const text = await mammoth.extractRawText({
        arrayBuffer: file.bytes.slice().buffer as ArrayBuffer,
      });
      const lines = text.value.split('\n').filter((line: string) => line.trim() !== '');
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      for (const line of lines) {
        const page = doc.addPage();
        const { height } = page.getSize();
        page.drawText(line.trim(), { x: 50, y: height - 50, size: 12, font, color: rgb(0, 0, 0) });
      }
      const output = await doc.save({ useObjectStreams: true });
      await saveAndShare(
        output,
        `converted-${file.name.replace(/\.docx$/i, '.pdf')}`,
        'application/pdf',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>
          {t('en', 'tool.name')}: Word to PDF
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Convert a .docx document to PDF on your device.
        </Text>
        <Button onPress={pick}>Choose .docx</Button>
        {file !== null ? <Text style={styles.info}>{file.name}</Text> : null}
        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={() => void handleConvert()} disabled={file === null || busy}>
          Convert to PDF
        </Button>
        {busy ? <Text style={styles.status}>Converting…</Text> : null}
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
