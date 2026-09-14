import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getTheme, nativeElevation } from "@rovotools/theme";

type ViewChildren = { children: React.ReactNode; style?: StyleProp<ViewStyle> };

export function Screen({ children, style }: ViewChildren): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return <View style={[{ flex: 1, backgroundColor: palette.background }, style]}>{children}</View>;
}

export function Heading({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return <Text style={[{ fontSize: 24, fontWeight: "700", color: palette.text }, style]}>{children}</Text>;
}

export function Subtitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return <Text style={[{ fontSize: 14, color: palette.muted, marginTop: 4 }, style]}>{children}</Text>;
}

export function Card({ children, style }: ViewChildren): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
        nativeElevation(1),
        style,
      ]}
    >
      {children}
    </View>
  );
}

Card.Title = function CardTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return <Text style={[styles.title, { color: palette.text }, style]}>{children}</Text>;
};

Card.Description = function CardDescription({ children, style, numberOfLines }: { children: React.ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return <Text numberOfLines={numberOfLines} style={[styles.description, { color: palette.muted }, style]}>{children}</Text>;
};

export function Badge({ children }: { children: React.ReactNode }): React.ReactElement {
  const { resolved } = useTheme();
  const theme = getTheme(resolved);
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.secondary }]}>
      <Text style={[styles.badgeText, { color: theme.colors.secondaryForeground }]}>{children}</Text>
    </View>
  );
}

export function Button({
  children,
  onPress,
  variant = "default",
  style,
  disabled = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "default" | "outline" | "ghost";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const backgroundColor = variant === "default" ? palette.primary : "transparent";
  const borderColor = variant === "outline" ? palette.border : "transparent";
  const color = variant === "default" ? palette.onPrimary : palette.text;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[styles.button, { backgroundColor, borderColor, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Text style={[styles.buttonText, { color }]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
  secure = false,
  multiline = false,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad" | "numeric" | "email-address" | "url";
  placeholder?: string;
  secure?: boolean;
  multiline?: boolean;
  inputRef?: React.Ref<TextInput>;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        secureTextEntry={secure}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing === undefined ? undefined : () => onSubmitEditing()}
        blurOnSubmit={blurOnSubmit}
        style={[
          styles.input,
          {
            color: palette.text,
            borderColor: palette.border,
            backgroundColor: palette.surface,
            minHeight: multiline ? 96 : 48,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
      />
    </View>
  );
}

export function Spinner(): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  return <ActivityIndicator color={palette.primary} />;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  title: { fontSize: 16, fontWeight: "600" },
  description: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  button: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: { fontSize: 15, fontWeight: "600" },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
});
