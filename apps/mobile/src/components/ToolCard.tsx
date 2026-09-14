import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { ToolRegistryEntry } from "@rovotools/types";
import { t } from "@rovotools/localization";
import { getToolDisplay } from "@rovotools/tools";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { Badge, Card } from "@/components/ui";

export default function ToolCard({ entry }: { entry: ToolRegistryEntry }): React.ReactElement {
  const router = useRouter();
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const tool = entry.definition;
  const display = getToolDisplay("en", tool);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${display.name}: ${display.description}`}
      onPress={() => router.push(`/tools/${tool.slug}`)}
      activeOpacity={0.7}
    >
      <Card>
        <View style={styles.row}>
          <Badge>{tool.category}</Badge>
          {tool.popular ? <Badge>{t("en", "tool.popular")}</Badge> : null}
        </View>
        <Card.Title style={styles.title}>{display.name}</Card.Title>
        <Card.Description numberOfLines={2}>{display.description}</Card.Description>
        <Text style={[styles.link, { color: palette.primary }]}>{t("en", "tool.openTool")} →</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginBottom: 8 },
  title: { marginTop: 2 },
  link: { marginTop: 10, fontSize: 14, fontWeight: "600" },
});
