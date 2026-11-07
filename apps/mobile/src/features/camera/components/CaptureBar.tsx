import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { theme } from "../../../theme";

interface CaptureBarProps {
  onTakePhoto: () => void;
  onPickGallery: () => void;
  isCapturing?: boolean;
}

export function CaptureBar({ onTakePhoto, onPickGallery, isCapturing = false }: CaptureBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.primaryButton, isCapturing && styles.disabledButton]}
        onPress={onTakePhoto}
        disabled={isCapturing}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Scan document using camera"
      >
        <View style={styles.primaryIconWrapper}>
          <Feather name="camera" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.buttonTextWrapper}>
          <Text style={styles.primaryTitle}>Scan Document</Text>
          <Text style={styles.primarySubtitle}>AI Auto-frame & capture</Text>
        </View>
        <Feather name="arrow-right" size={18} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, isCapturing && styles.disabledButton]}
        onPress={onPickGallery}
        disabled={isCapturing}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Import image from photo gallery"
      >
        <View style={styles.secondaryIconWrapper}>
          <Ionicons name="images-outline" size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.secondaryText}>Import Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  buttonTextWrapper: {
    flex: 1,
  },
  primaryTitle: {
    color: "#FFFFFF",
    fontSize: theme.typography.bodyBold.fontSize,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  primarySubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: theme.typography.caption.fontSize,
    marginTop: 2,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceElevated,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: theme.spacing.sm,
  },
  secondaryIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.bodyBold.fontSize,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
