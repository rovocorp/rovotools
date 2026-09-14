import React from "react";
import { StyleSheet, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { t } from "@rovotools/localization";
import { Button, Heading, Screen, Subtitle } from "@/components/ui";

export default function NotFoundScreen(): React.ReactElement {
  const router = useRouter();
  return (
    <Screen>
      <Stack.Screen options={{ title: t("en", "errors.notFound") }} />
      <View style={styles.container}>
        <Heading>{t("en", "errors.notFound")}</Heading>
        <Subtitle>{t("en", "help.privacyNote")}</Subtitle>
        <Button onPress={() => router.replace("/")}>{t("en", "navigation.home")}</Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
});
