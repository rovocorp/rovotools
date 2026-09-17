import React from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { BRAND_NAME, COMPANY_NAME, SUPPORT_EMAIL, VERSION, WEB_URL } from "@rovotools/config";
import { t } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { clearAllLocalData } from "@/lib/store";
import { Card, Heading, Screen, Subtitle } from "@/components/ui";

const THEMES = [
  { value: "light", labelKey: "theme.light" },
  { value: "dark", labelKey: "theme.dark" },
] as const;

function Row({
  label,
  detail,
  onPress,
}: {
  label: string;
  detail?: string;
  onPress: () => void;
}): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, { borderTopColor: palette.border }]}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: palette.text }]}>{label}</Text>
        {detail !== undefined ? (
          <Text style={[styles.rowDetail, { color: palette.muted }]}>{detail}</Text>
        ) : null}
      </View>
      <Text style={[styles.chevron, { color: palette.muted }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { resolved, theme, setTheme } = useTheme();
  const palette = getPalette(resolved);

  function confirmClear(): void {
    Alert.alert(t("en", "mobile.clearHistory"), t("en", "mobile.clearConfirm"), [
      { text: t("en", "common.cancel"), style: "cancel" },
      {
        text: t("en", "common.clear"),
        style: "destructive",
        onPress: () => {
          void clearAllLocalData().then(() => {
            Alert.alert(t("en", "common.done"), t("en", "mobile.dataCleared"));
          });
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Heading>{t("en", "navigation.settings")}</Heading>
        <Subtitle>
          {BRAND_NAME} {VERSION} · {COMPANY_NAME}
        </Subtitle>

        <Text style={[styles.section, { color: palette.text }]}>{t("en", "theme.appearance")}</Text>
        <Card>
          <View style={styles.themeRow}>
            {THEMES.map((option) => (
              <TouchableOpacity
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: theme === option.value }}
                onPress={() => setTheme(option.value)}
                style={[
                  styles.themeOption,
                  { borderColor: palette.border },
                  theme === option.value && {
                    backgroundColor: palette.primary,
                    borderColor: palette.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.themeLabel,
                    { color: theme === option.value ? palette.onPrimary : palette.text },
                  ]}
                >
                  {t("en", option.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Text style={[styles.section, { color: palette.text }]}>{t("en", "settings.about")}</Text>
        <Card>
          <Row label={t("en", "navigation.about")} onPress={() => router.push("/about")} />
          <Row label={t("en", "navigation.privacy")} detail={t("en", "help.privacyNote")} onPress={() => router.push("/privacy")} />
          <Row
            label={t("en", "settings.website")}
            detail={WEB_URL}
            onPress={() => {
              void Linking.openURL(WEB_URL).catch(() => undefined);
            }}
          />
        </Card>

        <Text style={[styles.section, { color: palette.text }]}>{t("en", "settings.data")}</Text>
        <Card>
          <Row label={t("en", "settings.support")} detail={SUPPORT_EMAIL} onPress={() => router.push("/about")} />
          <Row label={t("en", "settings.clearData")} detail={t("en", "settings.favoritesHistory")} onPress={confirmClear} />
        </Card>

        <Text style={[styles.note, { color: palette.muted }]}>
          {t("en", "mobile.localDataNote")}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  section: { fontSize: 16, fontWeight: "700", marginTop: 24, marginBottom: 8 },
  themeRow: { flexDirection: "row", gap: 8 },
  themeOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  themeLabel: { fontSize: 14, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowDetail: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: "700" },
  note: { fontSize: 12, marginTop: 24, textAlign: "center", lineHeight: 18 },
});
