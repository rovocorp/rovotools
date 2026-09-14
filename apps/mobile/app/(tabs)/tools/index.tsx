import React, { useCallback, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { t, tx } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { Heading, Screen, Subtitle } from "@/components/ui";
import ToolCard from "@/components/ToolCard";

export default function ToolsScreen(): React.ReactElement {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = getToolRegistry();

  const initialQuery = Array.isArray(params.q) ? (params.q[0] ?? "") : (params.q ?? "");
  const initialCategory = Array.isArray(params.category)
    ? (params.category[0] ?? null)
    : (params.category ?? null);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string | null>(initialCategory);

  useFocusEffect(
    useCallback(() => {
      setQuery(initialQuery);
      setCategory(initialCategory);
    }, [initialQuery, initialCategory]),
  );

  const facets = useMemo(() => registry.categories(), [registry]);
  const results = useMemo(() => {
    const mobile = registry
      .getAll()
      .filter(
        (entry) =>
          entry.definition.supportedPlatforms.includes("ANDROID") ||
          entry.definition.supportedPlatforms.includes("IOS"),
      );
    const scoped = category === null ? mobile : mobile.filter((e) => e.definition.category === category);
    const q = query.trim().toLowerCase();
    const matched =
      q === ""
        ? scoped
        : scoped.filter((entry) => {
            const tool = entry.definition;
            const haystack = [tool.name, tool.description, tool.slug, ...tool.keywords]
              .join("\n")
              .toLowerCase();
            return haystack.includes(q);
          });
    return [...matched].sort((a, b) => a.definition.name.localeCompare(b.definition.name));
  }, [registry, query, category]);

  return (
    <Screen>
      <View style={styles.header}>
        <Heading>{t("en", "navigation.tools")}</Heading>
        <Subtitle>
          {results.length === 1
            ? t("en", "tool.oneTool")
            : tx("en", "tool.manyTools", { count: results.length })}
        </Subtitle>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("en", "home.searchCta")}
          placeholderTextColor={palette.muted}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel={t("en", "a11y.searchTools")}
          style={[
            styles.search,
            { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setCategory(null)}
            style={[
              styles.chip,
              { borderColor: palette.border },
              category === null && { backgroundColor: palette.primary, borderColor: palette.primary },
            ]}
          >
            <Text style={[styles.chipText, category === null && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {facets.map((facet) => (
            <TouchableOpacity
              key={facet.category}
              accessibilityRole="button"
              onPress={() => setCategory(category === facet.category ? null : facet.category)}
              style={[
                styles.chip,
                { borderColor: palette.border },
                category === facet.category && {
                  backgroundColor: palette.primary,
                  borderColor: palette.primary,
                },
              ]}
            >
              <Text
                style={[styles.chipText, category === facet.category && styles.chipTextActive]}
              >
                {`${facet.category} · ${facet.count}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={results}
        keyExtractor={(entry) => entry.definition.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: palette.muted }]}>{t("en", "tool.noResults")}</Text>
        }
        renderItem={({ item }) => <ToolCard entry={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingBottom: 8 },
  search: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
  },
  chips: { gap: 8, paddingVertical: 12, paddingRight: 16 },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  chipText: { fontSize: 13, fontWeight: "600", color: "#71717a", textTransform: "capitalize" },
  chipTextActive: { color: "#ffffff" },
  list: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  separator: { height: 12 },
  empty: { textAlign: "center", marginTop: 32, fontSize: 15 },
});
