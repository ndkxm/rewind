import { File } from "expo-file-system";
import { MediaItem, SelectedImage } from "../types";


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.103:8080";

export async function uploadMedia(selected: SelectedImage): Promise<MediaItem> {
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

  return response.json();
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

  return response.json();
}
