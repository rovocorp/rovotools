import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { t, tx } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { Card, Heading, Screen, Subtitle } from "@/components/ui";

export default function CategoriesScreen(): React.ReactElement {
  const router = useRouter();
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = getToolRegistry();
  const facets = registry.categories();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Heading>{t("en", "navigation.categories")}</Heading>
        <Subtitle>{t("en", "home.categoriesTitle")}</Subtitle>
        <View style={styles.grid}>
          {facets.map((facet) => (
            <TouchableOpacity
              key={facet.category}
              accessibilityRole="button"
              accessibilityLabel={`${facet.category}, ${facet.count} tools`}
              onPress={() => router.push({ pathname: "/tools", params: { category: facet.category } })}
              activeOpacity={0.7}
              style={styles.item}
            >
              <Card>
                <Text style={[styles.name, { color: palette.text }]}>{facet.category}</Text>
                <Text style={[styles.count, { color: palette.muted }]}>
                  {facet.count === 1 ? t("en", "tool.oneTool") : tx("en", "tool.manyTools", { count: facet.count })}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 },
  item: { flexBasis: "47%", flexGrow: 1, minWidth: 150 },
  name: { fontSize: 16, fontWeight: "700", textTransform: "capitalize" },
  count: { fontSize: 13, marginTop: 4 },
});
