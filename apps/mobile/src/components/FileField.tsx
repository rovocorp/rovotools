import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PickedFile, ToolInputField } from "@rovotools/types";
import { t } from "@rovotools/localization";
import { getFieldLabel } from "@rovotools/tools";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { mobileCamera, mobileFilePicker } from "@/lib/adapters";
import { Button } from "@/components/ui";

function allowsCamera(field: ToolInputField): boolean {
  const haystack = `${field.id} ${field.labelKey}`.toLowerCase();
  return haystack.includes("camera") || haystack.includes("photo") || haystack.includes("image");
}

function allowsPhotos(field: ToolInputField): boolean {
  const haystack = `${field.id} ${field.labelKey}`.toLowerCase();
  return (
    allowsCamera(field) ||
    haystack.includes("picture") ||
    haystack.includes("avatar") ||
    haystack.includes("scan")
  );
}

function formatSize(size?: number): string {
  if (size === undefined) {
    return "";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileField({
  field,
  value,
  onChange,
}: {
  field: ToolInputField;
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [busy, setBusy] = useState(false);

  async function select(kind: "document" | "image" | "camera"): Promise<void> {
    setBusy(true);
    try {
      const picked =
        kind === "document"
          ? await mobileFilePicker.pickDocument()
          : kind === "image"
            ? await mobileFilePicker.pickImage()
            : await mobileCamera.captureImage();
      if (picked === null) {
        return;
      }
      setFile(picked);
      onChange(picked.uri);
    } catch {
      Alert.alert(t("en", "common.error"), t("en", "errors.selectionFailed"));
    } finally {
      setBusy(false);
    }
  }

  function clear(): void {
    setFile(null);
    onChange("");
  }

  const label = getFieldLabel("en", field);
  const isImage = file !== null && (file.mimeType?.startsWith("image/") ?? false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      {file === null || value === "" ? (
        <View style={styles.buttons}>
          <Button variant="outline" disabled={busy} onPress={() => void select("document")}>
            📁 {t("en", "file.files")}
          </Button>
          {allowsPhotos(field) ? (
            <Button variant="outline" disabled={busy} onPress={() => void select("image")}>
              🖼 {t("en", "file.photos")}
            </Button>
          ) : null}
          {allowsCamera(field) ? (
            <Button variant="outline" disabled={busy} onPress={() => void select("camera")}>
              📷 {t("en", "file.camera")}
            </Button>
          ) : null}
        </View>
      ) : (
        <View style={[styles.preview, { borderColor: palette.border }]}>
          {isImage ? (
            <Image
              source={{ uri: file.uri }}
              style={styles.thumbnail}
              accessibilityLabel={`Preview of ${file.name}`}
            />
          ) : null}
          <View style={styles.meta}>
            <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={[styles.size, { color: palette.muted }]}>
              {[file.mimeType, formatSize(file.size)].filter(Boolean).join(" · ")}
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("en", "a11y.removeFile")}
            onPress={clear}
            style={styles.remove}
          >
            <Text style={[styles.removeText, { color: palette.muted }]}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  thumbnail: { width: 64, height: 64, borderRadius: 8 },
  meta: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: "600" },
  size: { fontSize: 12 },
  remove: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { fontSize: 16, fontWeight: "700" },
});
