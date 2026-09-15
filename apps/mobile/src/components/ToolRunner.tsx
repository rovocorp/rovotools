import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ToolInputField, ValidationError } from "@rovotools/types";
import { t } from "@rovotools/localization";
import { copyText, exportTextFile, mobileShare } from "@/lib/adapters";
import { formatResultsText, resultsToCsv } from "@/lib/results";
import { getFieldLabel, getOutputLabel } from "@rovotools/tools";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { getToolRegistry } from "@/lib/registry";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecents } from "@/hooks/useRecents";
import { Badge, Button, Card, Field, Spinner } from "@/components/ui";
import BottomSheet from "@/components/BottomSheet";
import FileField from "@/components/FileField";

function labelFor(field: ToolInputField): string {
  return getFieldLabel("en", field);
}

function FieldControl({
  field,
  value,
  onChange,
  inputRef,
  returnKeyType,
  onSubmitEditing,
}: {
  field: ToolInputField;
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.Ref<TextInput>;
  returnKeyType?: "done" | "next";
  onSubmitEditing?: () => void;
}): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);

  if (field.type === "file") {
    return <FileField field={field} value={value} onChange={onChange} />;
  }
  if (field.type === "boolean") {
    return (
      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: palette.text }]}>{labelFor(field)}</Text>
        <Switch value={value === "true"} onValueChange={(next) => onChange(next ? "true" : "false")} />
      </View>
    );
  }
  if (field.type === "select") {
    return (
      <View style={styles.fieldGap}>
        <Text style={[styles.switchLabel, { color: palette.text }]}>{labelFor(field)}</Text>
        <View style={styles.options}>
          {(field.options ?? []).map((option) => (
            <TouchableOpacity
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: value === option.value }}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                { borderColor: palette.border },
                value === option.value && { backgroundColor: palette.primary, borderColor: palette.primary },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: value === option.value ? palette.onPrimary : palette.text },
                ]}
              >
                {getOutputLabel("en", { id: option.value, type: "string", labelKey: option.labelKey })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
  const keyboardType =
    field.type === "number"
      ? "decimal-pad"
      : field.type === "email"
        ? "email-address"
        : field.type === "url"
          ? "url"
          : "default";
  return (
    <Field
      label={labelFor(field)}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      multiline={field.type === "textarea"}
      placeholder={field.type === "date" ? "YYYY-MM-DD" : undefined}
      inputRef={inputRef}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      blurOnSubmit={returnKeyType === "done"}
    />
  );
}

export default function ToolRunner({ slug }: { slug: string }): React.ReactElement {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const registry = useMemo(() => getToolRegistry(), []);
  const entry = registry.getBySlug(slug);
  const { favorites, toggle } = useFavorites();
  const { track } = useRecents();
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<ReadonlyArray<ValidationError>>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (entry === undefined) {
    return <Text style={{ color: palette.danger }}>Tool not found.</Text>;
  }
  const tool = entry.definition;
  const isFavorite = favorites.includes(tool.id);
  const textFields = tool.inputs.filter(
    (field) => field.type !== "boolean" && field.type !== "select" && field.type !== "file",
  );

  function focusField(index: number): void {
    const target = inputRefs.current[index];
    if (target !== null && target !== undefined) {
      target.focus();
    }
  }

  async function handleRun(): Promise<void> {
    setRunning(true);
    setResult(null);
    try {
      const validation = tool.validate(values);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
      setErrors([]);
      const output = (await tool.execute(values)) as Record<string, unknown>;
      setResult(output);
      setSheetOpen(true);
      await track(tool.id);
    } catch (error) {
      setErrors([
        {
          fieldId: "general",
          code: "EXECUTION_ERROR",
          message: error instanceof Error ? error.message : t("en", "errors.calculationFailed"),
        },
      ]);
    } finally {
      setRunning(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (result === null) {
      return;
    }
    const copied = await copyText(formatResultsText(tool.name, tool.outputs, result));
    Alert.alert(
      copied ? t("en", "common.success") : t("en", "common.error"),
      copied ? t("en", "tool.copiedToClipboard") : t("en", "errors.storageUnavailable"),
    );
  }

  async function handleShare(): Promise<void> {
    if (result === null) {
      return;
    }
    const outcome = await mobileShare.shareText(formatResultsText(tool.name, tool.outputs, result), tool.name);
    if (!outcome.completed && outcome.method === "clipboard") {
      Alert.alert(t("en", "common.success"), t("en", "tool.copiedToClipboard"));
    } else if (!outcome.completed) {
      Alert.alert(t("en", "common.error"), t("en", "errors.shareFailed"));
    }
  }

  async function handleExport(): Promise<void> {
    if (result === null) {
      return;
    }
    const exported = await exportTextFile(tool.slug, resultsToCsv(tool.outputs, result));
    if (!exported) {
      Alert.alert(t("en", "common.error"), t("en", "errors.exportFailed"));
    }
  }

  return (
    <View style={styles.container}>
      <Card>
        <Text style={[styles.cardTitle, { color: palette.text }]}>{t("en", "tool.inputs")}</Text>
        <View style={styles.form}>
          {tool.inputs.map((field) => {
            const textIndex = textFields.findIndex((item) => item.id === field.id);
            const isLastText = textIndex === textFields.length - 1;
            return (
              <FieldControl
                key={field.id}
                field={field}
                value={values[field.id] ?? ""}
                onChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
                inputRef={
                  textIndex < 0
                    ? undefined
                    : (element) => {
                        inputRefs.current[textIndex] = element;
                      }
                }
                returnKeyType={textIndex < 0 ? undefined : isLastText ? "done" : "next"}
                onSubmitEditing={
                  textIndex < 0
                    ? undefined
                    : () => {
                        if (isLastText) {
                          void handleRun();
                        } else {
                          focusField(textIndex + 1);
                        }
                      }
                }
              />
            );
          })}
        </View>
        {errors.length > 0 ? (
          <View style={[styles.errorBox, { backgroundColor: palette.surfaceAlt }]}>
            {errors.map((error, index) => (
              <Text key={`${error.fieldId}-${index}`} style={[styles.errorText, { color: palette.danger }]}>
                {error.fieldId}: {error.message ?? error.code}
              </Text>
            ))}
          </View>
        ) : null}
        <View style={styles.actions}>
          <View style={styles.primary}>
            <Button onPress={() => void handleRun()} disabled={running}>
              {running
                ? (tool.actionRunningLabel ?? t("en", "tool.calculating"))
                : (tool.actionLabel ?? t("en", "tool.execute"))}
            </Button>
          </View>
          <Button variant="outline" onPress={() => void toggle(tool.id)}>
            {isFavorite ? `★ ${t("en", "tool.saved")}` : `☆ ${t("en", "common.save")}`}
          </Button>
        </View>
        {running ? (
          <View style={styles.spinner}>
            <Spinner />
          </View>
        ) : null}
      </Card>

      <BottomSheet visible={sheetOpen && result !== null} title={t("en", "tool.result")} onClose={() => setSheetOpen(false)}>
        {result === null ? null : (
          <View style={styles.sheetBody}>
            {tool.outputs.map((output) => (
              <View
                key={output.id}
                style={[styles.resultRow, { backgroundColor: palette.surfaceAlt }]}
              >
                <Text style={[styles.resultLabel, { color: palette.muted }]}>
                  {getOutputLabel("en", output).toUpperCase()}
                </Text>
                <Text style={[styles.resultValue, { color: palette.text }]} allowFontScaling>
                  {String(result[output.id] ?? "—")}
                </Text>
              </View>
            ))}
            <View style={styles.resultActions}>
              <View style={styles.actionFlex}>
                <Button variant="outline" onPress={() => void handleCopy()}>
                  {t("en", "common.copy")}
                </Button>
              </View>
              <View style={styles.actionFlex}>
                <Button variant="outline" onPress={() => void handleShare()}>
                  {t("en", "common.share")}
                </Button>
              </View>
              <View style={styles.actionFlex}>
                <Button variant="outline" onPress={() => void handleExport()}>
                  {t("en", "common.export")}
                </Button>
              </View>
            </View>
            {tool.requiresNetwork ? <Badge>{t("en", "tool.requiresInternet")}</Badge> : null}
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  form: { gap: 14 },
  actions: { flexDirection: "row", gap: 8, marginTop: 16 },
  primary: { flex: 1 },
  spinner: { marginTop: 12, alignItems: "center" },
  errorBox: { borderRadius: 10, padding: 10, marginTop: 12, gap: 4 },
  errorText: { fontSize: 13 },
  sheetBody: { gap: 12 },
  resultRow: { borderRadius: 12, padding: 14 },
  resultLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  resultValue: { fontSize: 28, fontWeight: "700", marginTop: 4 },
  resultActions: { flexDirection: "row", gap: 8 },
  actionFlex: { flex: 1 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48 },
  switchLabel: { fontSize: 15, fontWeight: "600", flex: 1 },
  fieldGap: { gap: 8 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minHeight: 48,
    justifyContent: "center",
  },
  optionText: { fontSize: 15, fontWeight: "600" },
});
