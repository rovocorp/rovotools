import "react-native-gesture-handler";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/providers/I18nProvider";

function ThemedStatusBar(): React.ReactElement {
  const { resolved } = useTheme();
  return <StatusBar style={resolved === "dark" ? "light" : "dark"} />;
}

function RootStack(): React.ReactElement {
  const { resolved } = useTheme();
  return (
    <>
      <ThemedStatusBar />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: resolved === "dark" ? "#09090b" : "#ffffff",
          },
          headerTintColor: resolved === "dark" ? "#fafafa" : "#171717",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tools/[id]" options={{ title: "Tool" }} />
        <Stack.Screen name="about" options={{ title: "About" }} />
        <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
      </Stack>
    </>
  );
}

export default function RootLayout(): React.ReactElement {
  return (
    <I18nProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootStack />
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
