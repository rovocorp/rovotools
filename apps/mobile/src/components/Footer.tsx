import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";

const footerLinks = [
  { label: "Privacy Policy", url: "https://rovotools.com/privacy" },
  { label: "Terms of Service", url: "https://rovotools.com/terms" },
];

export default function Footer() {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);

  return (
    <View style={[styles.container, { backgroundColor: palette.surface, borderTopColor: palette.border }]}>
      <View style={styles.logoPill}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="RovoTools — Free Online Tools for Everyday Work"
        />
      </View>
      <Text style={[styles.copyright, { color: palette.muted }]}>© 2026 RovoCorp LTD. All rights reserved.</Text>
      <View style={styles.links}>
        {footerLinks.map((link) => (
          <TouchableOpacity key={link.label} onPress={() => Linking.openURL(link.url)}>
            <Text style={[styles.link, { color: palette.primary }]}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.contact}>
        <Text style={[styles.contactItem, { color: palette.muted }]}>support@rovotools.com</Text>
        <Text style={[styles.contactItem, { color: palette.muted }]}>https://rovotools.com</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
  },
  logoPill: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoImage: {
    width: 150,
    height: 35,
  },
  copyright: {
    fontSize: 12,
    marginTop: 4,
  },
  links: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  link: {
    fontSize: 12,
  },
  contact: {
    marginTop: 12,
    gap: 4,
  },
  contactItem: {
    fontSize: 12,
  },
});
