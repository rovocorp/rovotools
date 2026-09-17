import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@rovotools/localization";
import { getToolDisplay } from "@rovotools/tools";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { Badge, Screen } from "@/components/ui";
import SponsoredSlot from "@/components/SponsoredSlot";
import ToolCard from "@/components/ToolCard";
import ToolRunner from "@/components/ToolRunner";
import { getCustomMobileToolComponent } from "@/components/customTools";

export default function ToolDetailScreen(): React.ReactElement {
  const params = useLocalSearchParams<{ id?: string }>();
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = getToolRegistry();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const entry = id === undefined ? undefined : registry.get(id);
  const insets = useSafeAreaInsets();

  if (entry === undefined) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Not found" }} />
        <View style={styles.center}>
          <Text style={{ color: palette.muted }}>Tool not found.</Text>
        </View>
      </Screen>
    );
  }

  const tool = entry.definition;
  const display = getToolDisplay("en", tool);
  const related = registry.related(tool.id, 3);
  const matrix = registry.capabilityMatrix(tool.id);
  const privacy = registry.privacyModel(tool.id);
  const CustomTool = getCustomMobileToolComponent(tool.slug);
  const supportedPlatforms = matrix.platforms
    .filter((platform) => platform.supported)
    .map((platform) => platform.platform)
    .join(" · ");

  return (
    <Screen>
      <Stack.Screen options={{ title: display.name }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={88}
      >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.badges}>
          <Badge>{tool.category}</Badge>
          {tool.popular ? <Badge>{t("en", "tool.popular")}</Badge> : null}
          {tool.requiresNetwork ? <Badge>{t("en", "tool.requiresInternet")}</Badge> : null}
        </View>
        <Text style={[styles.title, { color: palette.text }]}>{display.name}</Text>
        <Text style={[styles.description, { color: palette.muted }]}>{display.description}</Text>
        {CustomTool === undefined ? <ToolRunner slug={tool.slug} /> : <CustomTool />}
        <View style={styles.capabilities}>
          <Text style={[styles.capabilitiesTitle, { color: palette.text }]}>{t("en", "privacy.title")}</Text>
          <Text style={[styles.capabilitiesLine, { color: palette.muted }]}>
            {t("en", "privacy.processing")}: {privacy.processing}
          </Text>
          <Text style={[styles.capabilitiesLine, { color: palette.muted }]}>
            {supportedPlatforms}
          </Text>
          <Text style={[styles.capabilitiesLine, { color: palette.muted }]}>
            {t("en", "privacy.dataHandling")}
          </Text>
          <View style={styles.badges}>
            {privacy.permissions.length === 0 ? (
              <Badge>{t("en", "privacy.noPermissions")}</Badge>
            ) : (
              privacy.permissions.map((permission) => (
                <Badge key={permission}>
                  {permission === "camera"
                    ? t("en", "privacy.permissionCamera")
                    : permission === "photos"
                      ? t("en", "privacy.permissionPhotos")
                      : t("en", "privacy.permissionFiles")}
                </Badge>
              ))
            )}
          </View>
        </View>
        {related.length > 0 ? (
          <View style={styles.related}>
            <Text style={[styles.relatedTitle, { color: palette.text }]}>{t("en", "tool.relatedTools")}</Text>
            <View style={styles.relatedList}>
              {related.map((relatedEntry) => (
                <ToolCard key={relatedEntry.definition.id} entry={relatedEntry} />
              ))}
            </View>
          </View>
        ) : null}
        <SponsoredSlot placement="tool-footer" />
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 0 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  badges: { flexDirection: "row", gap: 6, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "700" },
  description: { fontSize: 15, marginTop: 6, marginBottom: 16, lineHeight: 22 },
  related: { marginTop: 24, gap: 12 },
  relatedTitle: { fontSize: 18, fontWeight: "700" },
  relatedList: { gap: 12 },
  capabilities: { marginTop: 20, gap: 8 },
  capabilitiesTitle: { fontSize: 16, fontWeight: "700" },
  capabilitiesLine: { fontSize: 13 },
});
