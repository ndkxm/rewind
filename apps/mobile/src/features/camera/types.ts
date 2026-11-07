export type ProcessingStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

/**
 * NamingStrategy defines how documents are named when uploaded:
 * - "AI_GENERATED": (Default) AI vision/OCR extracts a semantic document title
 * - "KEEP_ORIGINAL": Preserves the exact physical filename from the client device
 */
export type NamingStrategy = "AI_GENERATED" | "KEEP_ORIGINAL";

export interface MediaItem {
  id: string;
  userId: string;
  storagePath: string;
  signedUrl: string;
  originalFilename: string;
  title?: string | null;
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
  title?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  mimeType?: string;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";
