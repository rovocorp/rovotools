import React from "react";
import { Linking, ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { BRAND_NAME, COMPANY_NAME, SUPPORT_EMAIL, VERSION, WEB_URL } from "@rovotools/config";
import { t } from "@rovotools/localization";
import { Button, Card, Heading, Screen, Subtitle } from "@/components/ui";

export default function AboutScreen(): React.ReactElement {
  return (
    <Screen>
      <Stack.Screen options={{ title: t("en", "navigation.about") }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Heading>{BRAND_NAME}</Heading>
        <Subtitle>
          Version {VERSION} · {COMPANY_NAME}
        </Subtitle>
        <Card style={styles.card}>
          <Card.Title>{t("en", "help.privacyNote")}</Card.Title>
          <Card.Description>{t("en", "help.offlineNote")}</Card.Description>
        </Card>
        <Card style={styles.card}>
          <Card.Title>{t("en", "footer.contact")}</Card.Title>
          <Card.Description>{SUPPORT_EMAIL}</Card.Description>
          <Card.Description>{WEB_URL}</Card.Description>
        </Card>
        <Button
          variant="outline"
          onPress={() => {
            void Linking.openURL(WEB_URL).catch(() => undefined);
          }}
        >
          Open rovotools.com
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  card: { marginTop: 12 },
});
