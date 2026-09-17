import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Screen } from '@/components/ui';
import { fileBytes, isPdfFile, pickDocument, saveAndShare } from './mobile-pdf-utils';

export default function SignPdfScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [file, setFile] = useState<{ uri: string; name: string; bytes: Uint8Array } | null>(null);
  const [pageNum, setPageNum] = useState('1');
  const [xPct, setXPct] = useState('60');
  const [yPct, setYPct] = useState('12');
  const [widthPct, setWidthPct] = useState('30');
  const [signatureText, setSignatureText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(): Promise<void> {
    const picked = await pickDocument();
    if (picked === null) return;
    if (!isPdfFile(picked.name)) {
      setError('Only PDF files can be signed.');
      return;
    }
    const bytes = await fileBytes(picked.uri);
    setFile({ uri: picked.uri, name: picked.name, bytes });
    setError(null);
  }

  async function handleSign(): Promise<void> {
    if (file === null) {
      setError('Choose a PDF first.');
      return;
    }
    if (signatureText.trim() === '') {
      setError('Enter a signature name or draw one.');
      return;
    }
    const page = parseInt(pageNum, 10);
    if (!Number.isInteger(page) || page < 1) {
      setError('Enter a valid page number.');
      return;
    }
    const x = parseInt(xPct, 10);
    const y = parseInt(yPct, 10);
    const w = parseInt(widthPct, 10);
    if ([x, y, w].some((v) => Number.isNaN(v) || v < 0 || v > 100)) {
      setError('Position and size must be between 0 and 100.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.load(file.bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const targetPage = pages[page - 1];
      if (targetPage === undefined) {
        throw new Error(`Page ${page} not found (this PDF has ${pages.length} pages).`);
      }
      const { width, height } = targetPage.getSize();
      targetPage.drawText(signatureText.trim(), {
        x: width * (x / 100),
        y: height * (y / 100),
        size: Math.max(8, (width * w) / 100),
        font,
        color: rgb(0.12, 0.22, 0.55),
      });
      const output = await doc.save({ useObjectStreams: true });
      await saveAndShare(output, `signed-${file.name}`, 'application/pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signing failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>
          {t('en', 'tool.name')}: Sign PDF
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Stamp typed text as a signature on any page.
        </Text>
        <Button onPress={pick}>Choose PDF</Button>
        {file !== null ? <Text style={styles.info}>{file.name}</Text> : null}
        <TextInput
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          placeholder="Signature text"
          placeholderTextColor="#9ca3af"
          value={signatureText}
          onChangeText={setSignatureText}
        />
        <Text style={[styles.label, { color: palette.muted }]}>Page</Text>
        <TextInput
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          inputMode="numeric"
          value={pageNum}
          onChangeText={setPageNum}
        />
        <Text style={[styles.label, { color: palette.muted }]}>Position — X {xPct}%</Text>
        <TextInput
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          inputMode="numeric"
          value={xPct}
          onChangeText={setXPct}
        />
        <Text style={[styles.label, { color: palette.muted }]}>From bottom — Y {yPct}%</Text>
        <TextInput
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          inputMode="numeric"
          value={yPct}
          onChangeText={setYPct}
        />
        <Text style={[styles.label, { color: palette.muted }]}>Size — {widthPct}%</Text>
        <TextInput
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          inputMode="numeric"
          value={widthPct}
          onChangeText={setWidthPct}
        />
        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={() => void handleSign()} disabled={file === null || busy}>
          Sign PDF
        </Button>
        {busy ? <Text style={styles.status}>Signing…</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  description: { fontSize: 14 },
  info: { fontSize: 14, color: '#6b7280' },
  label: { fontSize: 12, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16 },
  error: { color: '#dc2626', fontSize: 14 },
  status: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
