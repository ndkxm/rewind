import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { MediaItem } from "../types";
import { getStatusMeta } from "../status";
import { normalizeImageUrl } from "../services/mediaApi";
import { theme } from "../../../theme";

interface DocumentDetailModalProps {
  item: MediaItem | null;
  visible: boolean;
  onClose: () => void;
}

export function DocumentDetailModal({
  item,
  visible,
  onClose,
}: DocumentDetailModalProps) {
  if (!item) return null;

  const statusMeta = getStatusMeta(item.processingStatus);

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown date";

  const formattedSize = item.fileSizeBytes
    ? `${(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
    : "N/A";

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onClose}
              accessibilityLabel="Close document detail"
            >
              <Feather name="arrow-left" size={22} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title || item.originalFilename || "Document Detail"}
              </Text>
              <Text style={styles.subtitle}>{formattedDate}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusMeta.background, borderColor: statusMeta.border },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
              <Text style={[styles.statusText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody}>
            {/* Main Image Frame */}
            <View style={styles.imageCard}>
              <Image
                source={{ uri: normalizeImageUrl(item.signedUrl) }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            {/* Document Metadata Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>File Specifications</Text>
              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Format</Text>
                  <Text style={styles.metaValue}>
                    {item.mimeType ? item.mimeType.split("/")[1]?.toUpperCase() : "JPG"}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Size</Text>
                  <Text style={styles.metaValue}>{formattedSize}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Dimensions</Text>
                  <Text style={styles.metaValue}>
                    {item.width && item.height ? `${item.width} × ${item.height}` : "Auto"}
                  </Text>
                </View>
              </View>
            </View>

            {/* OCR & AI Extraction Teaser (Phase 2 Preview) */}
            <View style={styles.ocrCard}>
              <View style={styles.ocrHeader}>
                <View style={styles.ocrIconWrapper}>
                  <Ionicons name="scan-outline" size={18} color={theme.colors.accentCyan} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ocrTitle}>Text Recognition (OCR)</Text>
                  <Text style={styles.ocrStatus}>Phase 2 - Ready for on-device scan</Text>
                </View>
              </View>
              <Text style={styles.ocrDescription}>
                On-device OCR integration will extract and index all legible text from this
                document for instant search and structured data parsing.
              </Text>
            </View>
          </ScrollView>
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
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
    gap: theme.spacing.md,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title.fontSize,
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  scrollBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  imageCard: {
    width: "100%",
    height: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "94%",
    height: "94%",
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaGrid: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  metaItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  ocrCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: theme.spacing.sm,
  },
  ocrHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  ocrIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  ocrTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.bodyBold.fontSize,
    fontWeight: "600",
  },
  ocrStatus: {
    color: theme.colors.accentCyan,
    fontSize: 12,
  },
  ocrDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
