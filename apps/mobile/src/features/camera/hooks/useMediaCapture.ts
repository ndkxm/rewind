import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { MediaItem, SelectedImage, UploadStatus, NamingStrategy } from "../types";
import { uploadMedia, uploadBatchMedia } from "../services/mediaApi";

interface UseMediaCaptureOptions {
  onSuccess?: (item: MediaItem) => void;
  onBatchSuccess?: (items: MediaItem[]) => void;
}

export function useMediaCapture(
  onSuccessOrOptions?: ((item: MediaItem) => void) | UseMediaCaptureOptions
) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [namingStrategy, setNamingStrategy] = useState<NamingStrategy>("AI_GENERATED");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSuccess = typeof onSuccessOrOptions === "function"
    ? onSuccessOrOptions
    : onSuccessOrOptions?.onSuccess;
  const onBatchSuccess = typeof onSuccessOrOptions === "object"
    ? onSuccessOrOptions.onBatchSuccess
    : undefined;

  /**
   * Capture a single document photo with camera.
   */
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
        const newImage: SelectedImage = {
          uri: asset.uri,
          fileName: asset.fileName ?? `capture_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType ?? "image/jpeg",
        };
        setSelectedImages([newImage]);
        setActiveImageIndex(0);
        setErrorMessage(null);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to capture photo");
    }
  }, []);

  /**
   * Import one or multiple images from device gallery.
   * Enables allowsMultipleSelection to support bulk import.
   */
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
        allowsMultipleSelection: true,
        selectionLimit: 15,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const items: SelectedImage[] = result.assets.map((asset, index) => ({
          uri: asset.uri,
          fileName: asset.fileName ?? `gallery_${Date.now()}_${index + 1}.jpg`,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType ?? "image/jpeg",
        }));
        setSelectedImages(items);
        setActiveImageIndex(0);
        setErrorMessage(null);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to pick image");
    }
  }, []);

  /**
   * Upload all selected images (single or batch) using the selected naming strategy.
   */
  const confirmUpload = useCallback(async () => {
    if (selectedImages.length === 0) return;

    setUploadStatus("uploading");
    setErrorMessage(null);

    try {
      if (selectedImages.length === 1) {
        const uploadedItem = await uploadMedia(selectedImages[0], namingStrategy);
        setUploadStatus("success");
        if (onSuccess) {
          onSuccess(uploadedItem);
        }
        if (onBatchSuccess) {
          onBatchSuccess([uploadedItem]);
        }
      } else {
        const uploadedItems = await uploadBatchMedia(selectedImages, namingStrategy);
        setUploadStatus("success");
        if (onBatchSuccess) {
          onBatchSuccess(uploadedItems);
        } else if (onSuccess) {
          uploadedItems.forEach((item) => onSuccess(item));
        }
      }
      setSelectedImages([]);
      setActiveImageIndex(0);
    } catch (err) {
      setUploadStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to upload image");
    }
  }, [selectedImages, namingStrategy, onSuccess, onBatchSuccess]);

  const cancelSelection = useCallback(() => {
    setSelectedImages([]);
    setActiveImageIndex(0);
    setUploadStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    selectedImages,
    selectedImage: selectedImages[activeImageIndex] ?? null,
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
  };
}
