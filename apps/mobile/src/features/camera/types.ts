export type ProcessingStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface MediaItem {
  id: string;
  userId: string;
  storagePath: string;
  signedUrl: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  capturedAt?: string;
  processingStatus: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedImage {
  uri: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  mimeType?: string;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";
