import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { nativeElevation } from "@rovotools/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/tools" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { resolved, theme, setTheme } = useTheme();
  const palette = getPalette(resolved);

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: palette.surface, borderBottomColor: palette.border },
        nativeElevation(2),
      ]}
    >
      <View style={styles.brand}>
        <View style={styles.logoPill}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="RovoTools — Free Online Tools for Everyday Work"
          />
        </View>
      </View>

      <View style={styles.nav}>
        {navLinks.map((link) => (
          <TouchableOpacity
            key={link.label}
            onPress={() => router.push(link.href)}
            style={[
              styles.navItem,
              pathname === link.href && { borderBottomWidth: 2, borderBottomColor: palette.primary },
            ]}
          >
            <Text
              style={[
                styles.navText,
                { color: palette.muted },
                pathname === link.href && { color: palette.primary, fontWeight: "600" },
              ]}
            >
              {link.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setTheme(theme === "dark" ? "light" : "dark")} style={styles.themeToggle}>
          <Text>{theme === "dark" ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  logoPill: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  logoImage: {
    width: 128,
    height: 30,
  },
  nav: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  navText: {
    fontSize: 14,
  },
  themeToggle: {
    padding: 4,
    marginLeft: 8,
  },
});
