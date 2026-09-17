import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { t } from '@rovotools/localization';
import { useTheme } from '@/providers/ThemeProvider';
import { getPalette } from '@/lib/theme';
import { Button, Card, Screen } from '@/components/ui';

export default function PdfToWordScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [ready, setReady] = useState(false);

  async function openWeb(): Promise<void> {
    const url = 'https://rovo.tools/tools/pdf/pdf-to-word';
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
          {t('en', 'tool.name')}: PDF to Word
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          Extract a PDF's text into an editable .docx document. This tool requires browser rendering
          and runs best on the website.
        </Text>
        <Card>
          <Text style={[styles.feature, { color: palette.text }]}>
            ✓ Text-based PDF to editable .docx
          </Text>
          <Text style={[styles.feature, { color: palette.text }]}>
            ✓ Preserves paragraph structure
          </Text>
          <Text style={[styles.feature, { color: palette.text }]}>✓ Download as .docx</Text>
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
