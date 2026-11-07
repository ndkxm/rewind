import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import {
  CaptureBar,
  ImagePreviewModal,
  useMediaCapture,
  fetchUserMedia,
  MediaItem,
} from "../src/features/camera";

export default function HomeScreen() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchUserMedia()
      .then((items) => {
        if (isMounted) {
          setMediaList(items);
        }
      })
      .catch(() => {
        // In dev without backend running yet, silently keep list or show placeholder
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
      // In dev
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUploadSuccess = (item: MediaItem) => {
    setMediaList((prev) => [item, ...prev]);
    setStatusNotice(`Successfully uploaded ${item.originalFilename || "image"}!`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const {
    selectedImage,
    uploadStatus,
    errorMessage,
    capturePhoto,
    pickImage,
    confirmUpload,
    cancelSelection,
  } = useMediaCapture(handleUploadSuccess);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#e94560"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Rewind</Text>
          <Text style={styles.brandSubtitle}>AI-powered visual memory</Text>
        </View>

        {statusNotice ? (
          <View style={styles.noticeBanner}>
            <Text style={styles.noticeText}>✨ {statusNotice}</Text>
          </View>
        ) : null}

        <View style={styles.captureSection}>
          <Text style={styles.sectionHeader}>Capture or Import</Text>
          <CaptureBar onTakePhoto={capturePhoto} onPickGallery={pickImage} />
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionHeader}>Uploaded Memories ({mediaList.length})</Text>

          {mediaList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📸</Text>
              <Text style={styles.emptyTitle}>No memories uploaded yet</Text>
              <Text style={styles.emptyText}>
                Snap a photo of a receipt, document, or note to test the Phase 1 upload flow.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {mediaList.map((item) => (
                <View key={item.id} style={styles.mediaCard}>
                  <Image
                    source={{ uri: item.signedUrl }}
                    style={styles.cardThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardFilename} numberOfLines={1}>
                      {item.originalFilename || "Document"}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.processingStatus}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <ImagePreviewModal
          image={selectedImage}
          uploadStatus={uploadStatus}
          errorMessage={errorMessage}
          onConfirm={confirmUpload}
          onCancel={cancelSelection}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#e94560",
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 15,
    color: "#a0a0b0",
    marginTop: 4,
  },
  noticeBanner: {
    backgroundColor: "rgba(46, 213, 115, 0.15)",
    borderWidth: 1,
    borderColor: "#2ed573",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  noticeText: {
    color: "#2ed573",
    fontWeight: "600",
    fontSize: 14,
  },
  captureSection: {
    backgroundColor: "#16213e",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  sectionHeader: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },
  historySection: {
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#16213e",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#a0a0b0",
    textAlign: "center",
    lineHeight: 18,
  },
  grid: {
    gap: 12,
  },
  mediaCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2e3856",
  },
  cardThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: "#0f172a",
  },
  cardDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cardFilename: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(233, 69, 96, 0.2)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: "#e94560",
    fontSize: 11,
    fontWeight: "bold",
  },
});
