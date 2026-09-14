import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@rovotools/localization";
import { useTheme } from "@/providers/ThemeProvider";
import { getPalette } from "@/lib/theme";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.8;

export default function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}): React.ReactElement | null {
  const { resolved } = useTheme();
  const palette = getPalette(resolved);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [rendered, setRendered] = useState(visible);
  const closing = useRef(false);

  const animateTo = useCallback(
    (value: number, done?: () => void): void => {
      if (reduceMotion) {
        translateY.setValue(value);
        done?.();
        return;
      }
      Animated.spring(translateY, {
        toValue: value,
        useNativeDriver: true,
        damping: 28,
        stiffness: 260,
      }).start(() => done?.());
    },
    [reduceMotion, translateY],
  );

  useEffect(() => {
    if (visible) {
      closing.current = false;
      setRendered(true);
      animateTo(0);
    } else {
      setRendered(false);
    }
  }, [visible, animateTo]);

  function requestClose(): void {
    if (closing.current) {
      return;
    }
    closing.current = true;
    animateTo(SCREEN_HEIGHT, onClose);
  }

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_event, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_event, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          requestClose();
        } else {
          animateTo(0);
        }
      },
    }),
  ).current;

  if (!rendered) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" onRequestClose={requestClose}>
      <TouchableWithoutFeedback accessibilityLabel={t("en", "a11y.dismiss")} onPress={requestClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            paddingBottom: Math.max(24, insets.bottom + 12),
            transform: [{ translateY }],
          },
        ]}
      >
        <View {...pan.panHandlers} style={styles.handleZone} accessible accessibilityRole="adjustable" accessibilityLabel={t("en", "a11y.dragHandle")}>
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
        </View>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("en", "a11y.closeDialog")}
            onPress={requestClose}
            style={[styles.close, { borderColor: palette.border }]}
          >
            <Text style={[styles.closeText, { color: palette.muted }]}>✕</Text>
          </TouchableOpacity>
        </View>
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleZone: { alignItems: "center", paddingVertical: 10, minHeight: 44 },
  handle: { width: 44, height: 5, borderRadius: 3 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 16, fontWeight: "700" },
});
