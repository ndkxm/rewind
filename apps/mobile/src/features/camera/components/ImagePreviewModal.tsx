import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SelectedImage, UploadStatus, NamingStrategy } from "../types";
import { theme } from "../../../theme";

interface ImagePreviewModalProps {
  image: SelectedImage | null;
  images?: SelectedImage[];
  activeImageIndex?: number;
  onSelectImageIndex?: (index: number) => void;
  namingStrategy?: NamingStrategy;
  onNamingStrategyChange?: (strategy: NamingStrategy) => void;
  uploadStatus: UploadStatus;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DOCUMENT_TYPES = [
  { id: "auto", label: "Auto Detect", icon: "sparkles" },
  { id: "receipt", label: "Receipt", icon: "receipt-outline" },
  { id: "document", label: "Document", icon: "document-text-outline" },
  { id: "note", label: "Note", icon: "create-outline" },
] as const;

export function ImagePreviewModal({
  image,
  images = [],
  activeImageIndex = 0,
  onSelectImageIndex,
  namingStrategy = "AI_GENERATED",
  onNamingStrategyChange,
  uploadStatus,
  errorMessage,
  onConfirm,
  onCancel,
}: ImagePreviewModalProps) {
  const [selectedType, setSelectedType] = useState<string>("auto");

  // Determine active item and total count
  const allImages = images.length > 0 ? images : image ? [image] : [];
  const currentImage = allImages[activeImageIndex] || image;

  if (!currentImage) return null;

  const isUploading = uploadStatus === "uploading";
  const isMultiple = allImages.length > 1;

  const formattedSize = currentImage.fileSize
    ? `${(currentImage.fileSize / (1024 * 1024)).toFixed(2)} MB`
    : null;

  return (
    <Modal visible={allImages.length > 0} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onCancel}
              disabled={isUploading}
              accessibilityLabel="Cancel scan"
            >
              <Feather name="x" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {isMultiple ? `Review Documents (${allImages.length})` : "Review Document"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isMultiple
                  ? "Bulk import ready for AI extraction"
                  : "Ready for OCR & AI extraction"}
              </Text>
            </View>

            <View style={styles.badgeReady}>
              <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
              <Text style={styles.badgeReadyText}>AI Vision</Text>
            </View>
          </View>

          {/* Central Preview with Scanner HUD Corner Brackets */}
          <View style={styles.previewWrapper}>
            <View style={styles.scannerFrame}>
              <View style={[styles.cornerMarker, styles.cornerTL]} />
              <View style={[styles.cornerMarker, styles.cornerTR]} />
              <View style={[styles.cornerMarker, styles.cornerBL]} />
              <View style={[styles.cornerMarker, styles.cornerBR]} />

              <Image
                source={{ uri: currentImage.uri }}
                style={styles.image}
                resizeMode="contain"
              />

              {/* Resolution Tag Overlay */}
              <View style={styles.imageMetaOverlay}>
                <Feather name="file-text" size={13} color="#FFFFFF" />
                <Text style={styles.imageMetaText} numberOfLines={1}>
                  {currentImage.fileName || "capture.jpg"}
                  {currentImage.width && currentImage.height
                    ? ` • ${currentImage.width}×${currentImage.height}`
                    : ""}
                  {formattedSize ? ` • ${formattedSize}` : ""}
                </Text>
              </View>
            </View>

            {/* Thumbnail carousel when multiple images are selected */}
            {isMultiple && (
              <View style={styles.thumbnailStripWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailStrip}
                >
                  {allImages.map((img, idx) => {
                    const isSelected = idx === activeImageIndex;
                    return (
                      <TouchableOpacity
                        key={img.uri + idx}
                        style={[styles.thumbnailButton, isSelected && styles.thumbnailButtonActive]}
                        onPress={() => onSelectImageIndex?.(idx)}
                        disabled={isUploading}
                      >
                        <Image source={{ uri: img.uri }} style={styles.thumbnailImage} />
                        <View style={[styles.thumbnailBadge, isSelected && styles.thumbnailBadgeActive]}>
                          <Text style={styles.thumbnailBadgeText}>{idx + 1}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Options & Actions Drawer */}
          <View style={styles.bottomDrawer}>
            {/* Naming Strategy Selection: AI Auto-Naming vs Keep Original */}
            <View style={styles.namingSection}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="edit-3" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.sectionTitle}>Document Naming</Text>
              </View>

              <View style={styles.namingOptionsContainer}>
                {/* Option 1: AI Auto-naming (Smart, Recommended) */}
                <TouchableOpacity
                  style={[
                    styles.namingOptionCard,
                    namingStrategy === "AI_GENERATED" && styles.namingOptionCardActive,
                  ]}
                  onPress={() => onNamingStrategyChange?.("AI_GENERATED")}
                  disabled={isUploading}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: namingStrategy === "AI_GENERATED" }}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.optionIconBox,
                        namingStrategy === "AI_GENERATED" && styles.optionIconBoxActive,
                      ]}
                    >
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color={namingStrategy === "AI_GENERATED" ? theme.colors.primary : theme.colors.textSecondary}
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <View style={styles.optionTitleRow}>
                        <Text
                          style={[
                            styles.namingOptionTitle,
                            namingStrategy === "AI_GENERATED" && styles.namingOptionTitleActive,
                          ]}
                        >
                          AI Smart Naming
                        </Text>
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedBadgeText}>Auto</Text>
                        </View>
                      </View>
                      <Text style={styles.namingOptionDesc} numberOfLines={1}>
                        AI trích xuất tiêu đề tự động từ nội dung OCR
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={namingStrategy === "AI_GENERATED" ? "radio-button-on" : "radio-button-off"}
                    size={19}
                    color={namingStrategy === "AI_GENERATED" ? theme.colors.primary : theme.colors.textMuted}
                  />
                </TouchableOpacity>

                {/* Option 2: Keep Original physical filename */}
                <TouchableOpacity
                  style={[
                    styles.namingOptionCard,
                    namingStrategy === "KEEP_ORIGINAL" && styles.namingOptionCardActive,
                  ]}
                  onPress={() => onNamingStrategyChange?.("KEEP_ORIGINAL")}
                  disabled={isUploading}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: namingStrategy === "KEEP_ORIGINAL" }}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.optionIconBox,
                        namingStrategy === "KEEP_ORIGINAL" && styles.optionIconBoxActive,
                      ]}
                    >
                      <Feather
                        name="file"
                        size={15}
                        color={namingStrategy === "KEEP_ORIGINAL" ? theme.colors.primary : theme.colors.textSecondary}
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <View style={styles.optionTitleRow}>
                        <Text
                          style={[
                            styles.namingOptionTitle,
                            namingStrategy === "KEEP_ORIGINAL" && styles.namingOptionTitleActive,
                          ]}
                        >
                          Keep Original
                        </Text>
                      </View>
                      <Text style={styles.namingOptionDesc} numberOfLines={1}>
                        Giữ tên file từ máy: {currentImage.fileName || "original_filename"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={namingStrategy === "KEEP_ORIGINAL" ? "radio-button-on" : "radio-button-off"}
                    size={19}
                    color={namingStrategy === "KEEP_ORIGINAL" ? theme.colors.primary : theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Document Type Classification */}
            <View style={styles.selectorSection}>
              <Text style={styles.selectorLabel}>Document Classification</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {DOCUMENT_TYPES.map((type) => {
                  const isActive = selectedType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[styles.typeChip, isActive && styles.typeChipActive]}
                      onPress={() => setSelectedType(type.id)}
                      activeOpacity={0.7}
                      disabled={isUploading}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={15}
                        color={isActive ? "#FFFFFF" : theme.colors.textSecondary}
                      />
                      <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Error Notification */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={16} color={theme.colors.danger} />
                <Text style={styles.errorText} numberOfLines={2}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={onCancel}
                disabled={isUploading}
                activeOpacity={0.75}
              >
                <Feather name="rotate-ccw" size={16} color={theme.colors.text} />
                <Text style={styles.retakeText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                onPress={onConfirm}
                disabled={isUploading}
                activeOpacity={0.85}
              >
                {isUploading ? (
                  <View style={styles.uploadingContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.uploadText}>
                      {isMultiple ? `Uploading ${allImages.length} images...` : "Uploading..."}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.uploadingContent}>
                    <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.uploadText}>
                      {isMultiple ? `Upload ${allImages.length} Documents` : "Upload to Rewind"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  iconButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  badgeReady: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  badgeReadyText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.accent,
  },
  previewWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: "#070A11",
  },
  scannerFrame: {
    flex: 1,
    width: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.md,
  },
  cornerMarker: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: theme.colors.primary,
    zIndex: 10,
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  imageMetaOverlay: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.round,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    maxWidth: "90%",
  },
  imageMetaText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  thumbnailStripWrapper: {
    height: 60,
    width: "100%",
    marginTop: 8,
  },
  thumbnailStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  thumbnailButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    position: "relative",
  },
  thumbnailButtonActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailBadgeActive: {
    backgroundColor: theme.colors.primary,
  },
  thumbnailBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  bottomDrawer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: theme.spacing.md,
  },
  namingSection: {
    gap: 6,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  namingOptionsContainer: {
    gap: 8,
  },
  namingOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
  },
  namingOptionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  optionIconBox: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionIconBoxActive: {
    backgroundColor: theme.colors.primaryMuted,
  },
  optionTextContainer: {
    flex: 1,
    gap: 2,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  namingOptionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  namingOptionTitleActive: {
    color: theme.colors.text,
  },
  recommendedBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  namingOptionDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  selectorSection: {
    gap: 6,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipsContainer: {
    gap: 8,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  typeChipTextActive: {
    color: "#FFFFFF",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    padding: 10,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    flex: 1,
    color: theme.colors.danger,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: 4,
  },
  retakeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  uploadButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
