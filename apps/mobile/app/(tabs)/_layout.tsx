import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { t } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return (
    <Text style={{ fontSize: 22, color: focused ? palette.primary : palette.muted }}>{glyph}</Text>
  );
}

export default function TabsLayout(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("en", "navigation.home"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="⌂" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: t("en", "navigation.tools"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="🧰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t("en", "navigation.categories"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="🗂" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t("en", "navigation.favorites"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="★" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: t("en", "navigation.recent"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="🕘" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("en", "navigation.settings"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="⚙" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
