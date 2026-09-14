import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { BRAND_NAME, SUPPORT_EMAIL } from "@rovotools/config";
import { t, tx } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { Heading, Screen, Subtitle } from "@/components/ui";

const SECTIONS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Local-first",
    body: `${BRAND_NAME} calculators run entirely on your device. The values you type into local tools are never sent to any server.`,
  },
  {
    title: "What stays on your phone",
    body: "Favorites, recent history, theme, and preferences are stored only in this device's local storage.",
  },
  {
    title: "What we collect",
    body: "Nothing, unless you contact support. There are no accounts, no advertising trackers, and no analytics SDKs in this app.",
  },
  {
    title: "Your control",
    body: `Clear favorites and history anytime from Settings. Questions: ${SUPPORT_EMAIL}.`,
  },
];

export default function PrivacyScreen(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = getToolRegistry();
  const models = registry.privacyModels();
  const offlineCount = models.filter((model) => model.offlineCapable).length;
  return (
    <Screen>
      <Stack.Screen options={{ title: t("en", "navigation.privacy") }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Heading>{t("en", "seo.privacyTitle")}</Heading>
        <Subtitle>{t("en", "common.lastUpdated")}</Subtitle>
        <Text style={[styles.body, { color: palette.text }]}>
          {tx("en", "privacy.offlineSummary", { count: offlineCount, total: models.length })}
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.title, { color: palette.text }]}>{section.title}</Text>
            <Text style={[styles.body, { color: palette.muted }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  section: { marginTop: 16 },
  title: { fontSize: 16, fontWeight: "700" },
  body: { fontSize: 14, marginTop: 4, lineHeight: 21 },
});
