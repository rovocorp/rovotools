import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { t } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { useRecents } from "@/hooks/useRecents";
import { Button, Card, Heading, Screen, Subtitle } from "@/components/ui";

export default function RecentScreen(): React.ReactElement {
  const router = useRouter();
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = getToolRegistry();
  const { recents, clear, refresh } = useRecents();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const entries = registry.recents(recents);

  return (
    <Screen>
      <View style={styles.header}>
        <Heading>{t("en", "navigation.recent")}</Heading>
        <Subtitle>{t("en", "help.privacyNote")}</Subtitle>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.definition.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: palette.muted }]}>{t("en", "mobile.recentEmpty")}</Text>
        }
        ListHeaderComponent={
          entries.length > 0 ? (
            <View style={styles.clearRow}>
              <Button variant="ghost" onPress={() => void clear()}>
                {t("en", "mobile.clearHistory")}
              </Button>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push(`/tools/${item.definition.slug}`)}
            activeOpacity={0.7}
          >
            <Card>
              <Card.Title>{item.definition.name}</Card.Title>
              <Card.Description numberOfLines={1}>{item.definition.description}</Card.Description>
            </Card>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  separator: { height: 12 },
  empty: { textAlign: "center", marginTop: 32, fontSize: 15 },
  clearRow: { alignItems: "flex-end", marginBottom: 8 },
});
