import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CaptureBarProps {
  onTakePhoto: () => void;
  onPickGallery: () => void;
}

export function CaptureBar({ onTakePhoto, onPickGallery }: CaptureBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onTakePhoto}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.primaryText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onPickGallery}>
        <Text style={styles.icon}>🖼️</Text>
        <Text style={styles.secondaryText}>Open Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#e94560",
  },
  secondaryButton: {
    backgroundColor: "#16213e",
    borderWidth: 1,
    borderColor: "#2e3856",
  },
  icon: {
    fontSize: 18,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  secondaryText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
});
