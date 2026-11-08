import { File } from "expo-file-system";
import { MediaItem, SelectedImage, NamingStrategy } from "../types";
import { API_BASE_URL } from "../../../api/client";

export function normalizeImageUrl(url?: string): string {
  if (!url) return "";
  if (url.includes(".supabase.co/object/sign/") && !url.includes("/storage/v1/")) {
    return url.replace(".supabase.co/object/sign/", ".supabase.co/storage/v1/object/sign/");
  }
  return url;
}

/**
 * Upload single image with naming strategy preference:
 * - "AI_GENERATED": Backend delegates title generation to OCR/LLM
 * - "KEEP_ORIGINAL": Preserves original device filename in title
 */
export async function uploadMedia(
  selected: SelectedImage,
  namingStrategy: NamingStrategy = "AI_GENERATED"
): Promise<MediaItem> {
  const formData = new FormData();

  const fileName = selected.fileName || `capture_${Date.now()}.jpg`;

  // Use Expo File for WinterCG-compliant fetch FormData
  formData.append("file", new File(selected.uri), fileName);

  if (selected.width) {
    formData.append("width", selected.width.toString());
  }
  if (selected.height) {
    formData.append("height", selected.height.toString());
  }
  if (selected.title) {
    formData.append("title", selected.title);
  }
  formData.append("namingStrategy", namingStrategy);

  const response = await fetch(`${API_BASE_URL}/api/v1/media`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errorBody}`);
  }

  const item: MediaItem = await response.json();
  return {
    ...item,
    signedUrl: normalizeImageUrl(item.signedUrl),
  };
}

/**
 * Upload multiple images at once (Bulk / Batch Upload).
 * Sends multipart files to POST /api/v1/media/batch.
 */
export async function uploadBatchMedia(
  selectedList: SelectedImage[],
  namingStrategy: NamingStrategy = "AI_GENERATED"
): Promise<MediaItem[]> {
  const formData = new FormData();

  for (const item of selectedList) {
    const fileName = item.fileName || `capture_${Date.now()}.jpg`;
    formData.append("files", new File(item.uri), fileName);
  }
  formData.append("namingStrategy", namingStrategy);

  const response = await fetch(`${API_BASE_URL}/api/v1/media/batch`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Batch upload failed (${response.status}): ${errorBody}`);
  }

  const items: MediaItem[] = await response.json();
  return items.map((item) => ({
    ...item,
    signedUrl: normalizeImageUrl(item.signedUrl),
  }));
}

export async function fetchUserMedia(): Promise<MediaItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/media`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch media (${response.status}): ${errorBody}`);
  }

  const items: MediaItem[] = await response.json();
  return items.map((item) => ({
    ...item,
    signedUrl: normalizeImageUrl(item.signedUrl),
  }));
}
