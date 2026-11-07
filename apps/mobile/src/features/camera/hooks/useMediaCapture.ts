import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { MediaItem, SelectedImage, UploadStatus } from "../types";
import { uploadMedia } from "../services/mediaApi";

export function useMediaCapture(onSuccess?: (item: MediaItem) => void) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const capturePhoto = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Camera permission is required to capture photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.fileName ?? `capture_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType ?? "image/jpeg",
        });
        setErrorMessage(null);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to capture photo");
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Media library permission is required to pick photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.fileName ?? `gallery_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType ?? "image/jpeg",
        });
        setErrorMessage(null);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to pick image");
    }
  }, []);

  const confirmUpload = useCallback(async () => {
    if (!selectedImage) return;

    setUploadStatus("uploading");
    setErrorMessage(null);

    try {
      const uploadedItem = await uploadMedia(selectedImage);
      setUploadStatus("success");
      if (onSuccess) {
        onSuccess(uploadedItem);
      }
      setSelectedImage(null);
    } catch (err) {
      setUploadStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to upload image");
    }
  }, [selectedImage, onSuccess]);

  const cancelSelection = useCallback(() => {
    setSelectedImage(null);
    setUploadStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    selectedImage,
    uploadStatus,
    errorMessage,
    capturePhoto,
    pickImage,
    confirmUpload,
    cancelSelection,
  };
}
