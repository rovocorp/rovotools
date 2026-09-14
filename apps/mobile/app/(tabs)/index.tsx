import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { BRAND_NAME } from "@rovotools/config";
import { t } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { useRecents } from "@/hooks/useRecents";
import { Badge, Button, Card, Heading, Screen, Subtitle } from "@/components/ui";
import ToolCard from "@/components/ToolCard";

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = getToolRegistry();
  const { recents, refresh } = useRecents();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const featured = registry.featured(5);
  const popular = registry.popular(4);
  const recentEntries = registry.recents(recents).slice(0, 5);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Badge>{`${t("en", "navigation.tools")} · Android · iOS`}</Badge>
        <Heading style={styles.hero}>{BRAND_NAME}</Heading>
        <Subtitle>{t("en", "home.mobileSubtitle")}</Subtitle>

        <Button style={styles.searchButton} variant="outline" onPress={() => router.push("/tools")}>
          {`🔍  ${t("en", "home.searchCta")}`}
        </Button>

        <Text style={[styles.section, { color: palette.text }]}>{t("en", "home.featuredTitle")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {featured.map((entry) => (
            <View key={entry.definition.id} style={styles.featuredCard}>
              <ToolCard entry={entry} />
            </View>
          ))}
        </ScrollView>

        <Text style={[styles.section, { color: palette.text }]}>{t("en", "home.popularTitle")}</Text>
        <View style={styles.grid}>
          {popular.map((entry) => (
            <View key={entry.definition.id} style={styles.gridItem}>
              <ToolCard entry={entry} />
            </View>
          ))}
        </View>

        {recentEntries.length > 0 ? (
          <>
            <Text style={[styles.section, { color: palette.text }]}>{t("en", "home.recentTitle")}</Text>
            <Card>
              {recentEntries.map((entry, index) => (
                <TouchableOpacity
                  key={entry.definition.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/tools/${entry.definition.slug}`)}
                  style={[
                    styles.recentRow,
                    index > 0 && { borderTopWidth: 1, borderTopColor: palette.border },
                  ]}
                >
                  <Text style={[styles.recentName, { color: palette.text }]}>
                    {entry.definition.name}
                  </Text>
                  <Text style={[styles.recentGo, { color: palette.primary }]}>›</Text>
                </TouchableOpacity>
              ))}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 0 },
  hero: { fontSize: 32, marginTop: 8 },
  searchButton: { marginTop: 16 },
  section: { fontSize: 18, fontWeight: "700", marginTop: 24, marginBottom: 12 },
  row: { gap: 12, paddingRight: 16 },
  featuredCard: { width: 260 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { flexBasis: "48%", flexGrow: 1, minWidth: 160 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  recentName: { fontSize: 15, fontWeight: "600" },
  recentGo: { fontSize: 20, fontWeight: "700" },
});
