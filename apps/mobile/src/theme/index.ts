export const theme = {
  colors: {
    background: "#0A0E17",
    surface: "#111827",
    surfaceElevated: "#1A2234",
    surfaceGlass: "rgba(26, 34, 52, 0.75)",
    surfaceBorder: "#243049",
    surfaceBorderHighlight: "#3B82F6",

    primary: "#3B82F6",
    primaryHover: "#2563EB",
    primaryMuted: "rgba(59, 130, 246, 0.15)",
    accent: "#6366F1",
    accentCyan: "#06B6D4",

    success: "#10B981",
    successBg: "rgba(16, 185, 129, 0.12)",
    successBorder: "rgba(16, 185, 129, 0.25)",

    warning: "#F59E0B",
    warningBg: "rgba(245, 158, 11, 0.12)",
    warningBorder: "rgba(245, 158, 11, 0.25)",

    danger: "#EF4444",
    dangerBg: "rgba(239, 68, 68, 0.12)",
    dangerBorder: "rgba(239, 68, 68, 0.25)",

    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 9999,
  },
  typography: {
    caption: {
      fontSize: 12,
      fontWeight: "500" as const,
      lineHeight: 16,
    },
    bodySm: {
      fontSize: 13,
      fontWeight: "400" as const,
      lineHeight: 18,
    },
    body: {
      fontSize: 15,
      fontWeight: "400" as const,
      lineHeight: 22,
    },
    bodyBold: {
      fontSize: 15,
      fontWeight: "600" as const,
      lineHeight: 22,
    },
    title: {
      fontSize: 18,
      fontWeight: "700" as const,
      lineHeight: 24,
    },
    headline: {
      fontSize: 22,
      fontWeight: "700" as const,
      lineHeight: 28,
    },
    hero: {
      fontSize: 30,
      fontWeight: "800" as const,
      lineHeight: 36,
    },
  },
};

export type Theme = typeof theme;
