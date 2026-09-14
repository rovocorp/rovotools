import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { t } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { useFavorites } from "@/hooks/useFavorites";
import { Button, Heading, Screen, Subtitle } from "@/components/ui";
import ToolCard from "@/components/ToolCard";

export default function FavoritesScreen(): React.ReactElement {
  const router = useRouter();
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = getToolRegistry();
  const { favorites, refresh } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const entries = registry.favorites(favorites);

  return (
    <Screen>
      <View style={styles.header}>
        <Heading>{t("en", "navigation.favorites")}</Heading>
        <Subtitle>{t("en", "help.privacyNote")}</Subtitle>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.definition.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: palette.muted }]}>
              {t("en", "mobile.favoritesEmpty")}
            </Text>
            <Button variant="outline" onPress={() => router.push("/tools")}>
              {t("en", "navigation.tools")}
            </Button>
          </View>
        }
        renderItem={({ item }) => <ToolCard entry={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  separator: { height: 12 },
  empty: { marginTop: 48, alignItems: "center", gap: 16 },
  emptyText: { textAlign: "center", fontSize: 15, lineHeight: 22 },
});
