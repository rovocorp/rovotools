import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Screen } from '@/components/ui';
import { fileBytes, saveAndShare } from './mobile-pdf-utils';

interface ImageEntry {
  uri: string;
  name: string;
  bytes: Uint8Array;
}

export default function JpgToPdfScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [images, setImages] = useState<ReadonlyArray<ImageEntry>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addImage(): Promise<void> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
    });
    if (result.canceled || result.assets === undefined || result.assets.length === 0) {
      return;
    }
    const next: ImageEntry[] = [];
    for (const asset of result.assets.slice(0, 10)) {
      try {
        const bytes = await fileBytes(asset.uri);
        next.push({
          uri: asset.uri,
          name: asset.fileName ?? `image-${next.length + 1}.jpg`,
          bytes,
        });
      } catch {
        // skip unreadable assets
      }
    }
    setImages((prev) => [...prev, ...next].slice(0, 10));
    setError(null);
  }

  async function handleConvert(): Promise<void> {
    if (images.length === 0) {
      setError('Add at least one image.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.create();
      for (const { bytes } of images) {
        const page = doc.addPage();
        const embed = await doc.embedPng(bytes);
        const dims = embed.scaleToFit(page.getWidth(), page.getHeight());
        page.drawImage(embed, {
          x: (page.getWidth() - dims.width) / 2,
          y: (page.getHeight() - dims.height) / 2,
          width: dims.width,
          height: dims.height,
        });
      }
      const output = await doc.save({ useObjectStreams: true });
      await saveAndShare(output, 'images.pdf', 'application/pdf');
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
          {t('en', 'tool.name')}: JPG to PDF
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Convert up to 10 images into a single PDF.
        </Text>
        <Button onPress={addImage}>Add Images</Button>
        {images.length > 0 ? <Text style={styles.info}>{images.length} images</Text> : null}
        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={() => void handleConvert()} disabled={images.length === 0 || busy}>
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
