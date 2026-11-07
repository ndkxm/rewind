import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SelectedImage, UploadStatus } from "../types";

interface ImagePreviewModalProps {
  image: SelectedImage | null;
  uploadStatus: UploadStatus;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImagePreviewModal({
  image,
  uploadStatus,
  errorMessage,
  onConfirm,
  onCancel,
}: ImagePreviewModalProps) {
  if (!image) return null;

  const isUploading = uploadStatus === "uploading";

  return (
    <Modal visible={!!image} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Preview Capture</Text>
          <Text style={styles.subtitle}>Review before uploading to Rewind</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoContainer}>
          {image.width && image.height ? (
            <Text style={styles.infoText}>
              Resolution: {image.width} × {image.height} px
            </Text>
          ) : null}
          {image.fileSize ? (
            <Text style={styles.infoText}>
              Size: {(image.fileSize / 1024 / 1024).toFixed(2)} MB
            </Text>
          ) : null}
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isUploading}
          >
            <Text style={styles.cancelText}>Retake / Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.uploadButton]}
            onPress={onConfirm}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.uploadText}>Upload to Rewind</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#a0a0b0",
    marginTop: 4,
  },
  imageContainer: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#16213e",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  infoText: {
    color: "#a0a0b0",
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: "rgba(233, 69, 96, 0.2)",
    borderWidth: 1,
    borderColor: "#e94560",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#e94560",
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#16213e",
    borderWidth: 1,
    borderColor: "#2e3856",
  },
  cancelText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#e94560",
  },
  uploadText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
