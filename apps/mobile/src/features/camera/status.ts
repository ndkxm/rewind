import { ProcessingStatus } from "./types";
import { theme } from "../../theme";

/**
 * Single source of truth for how a media processing status is displayed
 * across the app (grid pill, list badge, and document detail modal).
 * Keeps label + color mapping consistent and avoids hardcoded status styling.
 */
export interface StatusMeta {
  label: string;
  color: string;
  background: string;
  border: string;
}

export const STATUS_META: Record<ProcessingStatus, StatusMeta> = {
  UPLOADED: {
    label: "Saved",
    color: theme.colors.success,
    background: theme.colors.successBg,
    border: theme.colors.successBorder,
  },
  PROCESSING: {
    label: "Processing",
    color: theme.colors.warning,
    background: theme.colors.warningBg,
    border: theme.colors.warningBorder,
  },
  OCR_COMPLETED: {
    label: "OCR Complete",
    color: theme.colors.accentCyan,
    background: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.25)",
  },
  COMPLETED: {
    label: "Completed",
    color: theme.colors.success,
    background: theme.colors.successBg,
    border: theme.colors.successBorder,
  },
  FAILED: {
    label: "Failed",
    color: theme.colors.danger,
    background: theme.colors.dangerBg,
    border: theme.colors.dangerBorder,
  },
};

export function getStatusMeta(status: ProcessingStatus): StatusMeta {
  return STATUS_META[status] ?? STATUS_META.UPLOADED;
}
