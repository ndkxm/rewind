import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  CaptureBar,
  ImagePreviewModal,
  DocumentDetailModal,
  useMediaCapture,
  fetchUserMedia,
  normalizeImageUrl,
  getStatusMeta,
  MediaItem,
} from "../src/features/camera";
import { theme } from "../src/theme";

const { width } = Dimensions.get("window");
const GRID_ITEM_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

const CATEGORIES = ["All Documents", "Receipts", "Notes", "Invoices", "Cards"];

export default function HomeScreen() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inspectedItem, setInspectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchUserMedia()
      .then((items) => {
        if (isMounted) {
          setMediaList(items);
        }
      })
      .catch(() => {
        // In local development before backend runs
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const items = await fetchUserMedia();
      setMediaList(items);
    } catch {
      // In dev fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUploadSuccess = (item: MediaItem) => {
    setMediaList((prev) => [item, ...prev]);
    setStatusNotice(`Saved: ${item.title || item.originalFilename || "Document"}`);
    setTimeout(() => setStatusNotice(null), 4500);
  };

  const handleBatchUploadSuccess = (items: MediaItem[]) => {
    setMediaList((prev) => [...items, ...prev]);
    setStatusNotice(`Saved ${items.length} documents successfully`);
    setTimeout(() => setStatusNotice(null), 4500);
  };

  const {
    selectedImage,
    selectedImages,
    activeImageIndex,
    setActiveImageIndex,
    namingStrategy,
    setNamingStrategy,
    uploadStatus,
    errorMessage,
    capturePhoto,
    pickImage,
    confirmUpload,
    cancelSelection,
  } = useMediaCapture({
    onSuccess: handleUploadSuccess,
    onBatchSuccess: handleBatchUploadSuccess,
  });

  // Filter memories by search query across title and original filename
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return mediaList;
    const q = searchQuery.toLowerCase().trim();
    return mediaList.filter((item) =>
      ((item.title || "") + " " + (item.originalFilename || "")).toLowerCase().includes(q)
    );
  }, [mediaList, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>REWIND</Text>
            <Text style={styles.brandSubtitle}>AI Visual Memory</Text>
          </View>
        </View>

        <View style={styles.statsBadge}>
          <Feather name="layers" size={13} color={theme.colors.accent} />
          <Text style={styles.statsText}>{mediaList.length} items</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Toast / Notification Banner */}
        {statusNotice ? (
          <View style={styles.toastBanner}>
            <View style={styles.toastIcon}>
              <Feather name="check" size={15} color="#FFFFFF" />
            </View>
            <Text style={styles.toastText} numberOfLines={1}>
              {statusNotice}
            </Text>
            <TouchableOpacity onPress={() => setStatusNotice(null)}>
              <Feather name="x" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Search & Filter Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents or memories..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearchBtn}>
              <Feather name="x" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Horizontal Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Action Capture Section */}
        <View style={styles.captureCard}>
          <Text style={styles.cardHeader}>New Capture</Text>
          <CaptureBar onTakePhoto={capturePhoto} onPickGallery={pickImage} />
        </View>

        {/* Memories Header & View Toggle */}
        <View style={styles.feedHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Library</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredList.length} {filteredList.length === 1 ? "document" : "documents"}
            </Text>
          </View>

          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === "grid" && styles.viewToggleButtonActive]}
              onPress={() => setViewMode("grid")}
              accessibilityLabel="Grid View"
            >
              <Feather
                name="grid"
                size={16}
                color={viewMode === "grid" ? "#FFFFFF" : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === "list" && styles.viewToggleButtonActive]}
              onPress={() => setViewMode("list")}
              accessibilityLabel="List View"
            >
              <Feather
                name="list"
                size={16}
                color={viewMode === "list" ? "#FFFFFF" : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Media Items or Empty State */}
        {filteredList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="document-text-outline" size={36} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? "No matching documents" : "No memories yet"}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery
                ? "Try searching for a different keyword or file name."
                : "Capture your receipts, notes, or paper documents to digitize and make them searchable."}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyStateCta}
                onPress={capturePhoto}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={16} color="#FFFFFF" />
                <Text style={styles.emptyStateCtaText}>Capture First Document</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : viewMode === "grid" ? (
          /* Grid View Layout */
          <View style={styles.gridContainer}>
            {filteredList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                onPress={() => setInspectedItem(item)}
                activeOpacity={0.85}
              >
                <View style={styles.gridImageWrapper}>
                  <Image
                    source={{ uri: normalizeImageUrl(item.signedUrl) }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                  <View style={styles.gridStatusPill}>
                    <Text
                      style={[styles.gridStatusText, { color: getStatusMeta(item.processingStatus).color }]}
                    >
                      {getStatusMeta(item.processingStatus).label}
                    </Text>
                  </View>
                </View>

                <View style={styles.gridDetails}>
                  <Text style={styles.gridTitle} numberOfLines={1}>
                    {item.title || item.originalFilename || "Scan Document"}
                  </Text>
                  <Text style={styles.gridDate}>
                    {item.fileSizeBytes
                      ? `${(item.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                      : "Document"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* List View Layout */
          <View style={styles.listContainer}>
            {filteredList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.listCard}
                onPress={() => setInspectedItem(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: normalizeImageUrl(item.signedUrl) }}
                  style={styles.listThumbnail}
                  resizeMode="cover"
                />

                <View style={styles.listContent}>
                  <Text style={styles.listTitle} numberOfLines={1}>
                    {item.title || item.originalFilename || "Scan Document"}
                  </Text>
                  <Text style={styles.listMeta}>
                    {item.mimeType ? item.mimeType.split("/")[1]?.toUpperCase() : "JPG"} •{" "}
                    {item.fileSizeBytes ? `${(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB` : "File"}
                  </Text>
                </View>

                <View style={styles.listRight}>
                  <View
                    style={[
                      styles.listStatusBadge,
                      { backgroundColor: getStatusMeta(item.processingStatus).background },
                    ]}
                  >
                    <Text
                      style={[styles.listStatusText, { color: getStatusMeta(item.processingStatus).color }]}
                    >
                      {getStatusMeta(item.processingStatus).label}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Capture Confirmation Modal */}
      <ImagePreviewModal
        image={selectedImage}
        images={selectedImages}
        activeImageIndex={activeImageIndex}
        onSelectImageIndex={setActiveImageIndex}
        namingStrategy={namingStrategy}
        onNamingStrategyChange={setNamingStrategy}
        uploadStatus={uploadStatus}
        errorMessage={errorMessage}
        onConfirm={confirmUpload}
        onCancel={cancelSelection}
      />

      {/* Document Detail Inspection Modal */}
      <DocumentDetailModal
        item={inspectedItem}
        visible={!!inspectedItem}
        onClose={() => setInspectedItem(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.background,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: theme.typography.title.fontSize,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: 6,
  },
  statsText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 48,
    gap: theme.spacing.lg,
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  toastIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: theme.spacing.md,
    height: 46,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryHover,
  },
  categoryChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  captureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: theme.spacing.md,
  },
  cardHeader: {
    color: theme.colors.text,
    fontSize: theme.typography.title.fontSize,
    fontWeight: "700",
  },
  feedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.title.fontSize,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  viewToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.xs,
  },
  viewToggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  emptyState: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.title.fontSize,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  emptyStateDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: theme.spacing.xl,
    maxWidth: 280,
  },
  emptyStateCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  emptyStateCtaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  gridCard: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  gridImageWrapper: {
    width: "100%",
    height: 140,
    backgroundColor: theme.colors.surfaceElevated,
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridStatusPill: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(10, 14, 23, 0.8)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  gridStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  gridDetails: {
    padding: theme.spacing.md,
  },
  gridTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  gridDate: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  listContainer: {
    gap: theme.spacing.sm,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: theme.spacing.md,
  },
  listThumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  listMeta: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  listRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  listStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  listStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
