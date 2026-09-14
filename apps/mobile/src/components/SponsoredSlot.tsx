import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { t } from "@rovotools/localization";
import type { AdPlacement } from "@rovotools/tools";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { isSponsoredPlacementAllowed, resolveMobileAdsProvider } from "@/lib/monetization";

export default function SponsoredSlot({ placement }: { placement: AdPlacement }): React.ReactElement | null {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const provider = resolveMobileAdsProvider();

  // Advertising is off: render nothing so tool layouts are byte-identical
  // with ads enabled or disabled. A future native SDK mounts its banner in
  // the labeled container below instead of this null.
  if (!provider.isEnabled() || !isSponsoredPlacementAllowed(placement)) {
    return null;
  }

  return (
    <View
      accessibilityLabel={t("en", "ads.label")}
      style={[styles.container, { borderColor: palette.border }]}
    >
      <Text style={[styles.label, { color: palette.muted }]}>{t("en", "ads.label")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
