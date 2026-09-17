import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Card, Screen } from '@/components/ui';

export default function PdfToJpgScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [ready, setReady] = useState(false);

  async function openWeb(): Promise<void> {
    const url = 'https://rovo.tools/tools/pdf/pdf-to-jpg';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      setReady(true);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>
          {t('en', 'tool.name')}: PDF to JPG
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Export each PDF page as a high-quality JPEG image. This tool requires browser rendering
          and runs best on the website.
        </Text>
        <Card>
          <Text style={[styles.feature, { color: palette.text }]}>
            ✓ Per-page JPEG export at configurable DPI
          </Text>
          <Text style={[styles.feature, { color: palette.text }]}>
            ✓ Preserves original layout and fonts
          </Text>
          <Text style={[styles.feature, { color: palette.text }]}>
            ✓ Batch export all pages at once
          </Text>
        </Card>
        {ready ? (
          <Text style={[styles.note, { color: palette.muted }]}>
            Open the RovoTools website to use this tool.
          </Text>
        ) : null}
        <Button onPress={() => void openWeb()}>Open on Website</Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  description: { fontSize: 14 },
  feature: { fontSize: 14, marginBottom: 4 },
  note: { fontSize: 13, fontStyle: 'italic' },
});
