import "react-native-gesture-handler";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/providers/I18nProvider";

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Slot />
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
