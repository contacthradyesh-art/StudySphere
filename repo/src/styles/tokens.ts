export const colors = {
  navy: { deep: "#0b0f2a", dark: "#161d4e", base: "#222c61", mid: "#36467e", light: "#546291" },
  charcoal: { deep: "#0e0f18", dark: "#1b1c27", base: "#292a37", mid: "#3f4150", light: "#5c5e6a" },
  electric: { base: "#007edc", bright: "#00aeff", light: "#7ad0ff", dim: "#004da9" },
  neon: { base: "#00e805", bright: "#2fee34", light: "#8ef58f", dim: "#007e00" },
  surface: { primary: "#0e0f18", secondary: "#1b1c27", tertiary: "#292a37", elevated: "#3f4150" },
  text: { primary: "#e8e8ea", secondary: "#9fa0a8", tertiary: "#797a85", inverse: "#0e0f18" },
  status: { success: "#00e805", warning: "#ffb800", error: "#ff4757", info: "#007edc" },
} as const;

export const spacing = {
  xs: "0.25rem", sm: "0.5rem", md: "1rem", lg: "1.5rem", xl: "2rem", "2xl": "3rem", "3xl": "4rem",
} as const;

export const borderRadius = {
  sm: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.5rem", full: "9999px",
} as const;

export const shadows = {
  glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
  glow: "0 0 15px rgba(0, 126, 220, 0.3)",
  glowNeon: "0 0 15px rgba(0, 232, 5, 0.3)",
  glowLg: "0 0 30px rgba(0, 126, 220, 0.2)",
  card: "0 4px 16px rgba(0, 0, 0, 0.2)",
  elevated: "0 12px 40px rgba(0, 0, 0, 0.4)",
} as const;

export const glassmorphism = {
  background: "rgba(27, 28, 39, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(12px)",
} as const;

export const transitions = {
  fast: "150ms ease", normal: "300ms ease", slow: "500ms ease",
  spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
