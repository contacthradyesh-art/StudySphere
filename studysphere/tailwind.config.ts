import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e7e9ef", 100: "#c3c8d8", 200: "#9ba3be", 300: "#727ea4", 400: "#546291",
          500: "#36467e", 600: "#303f76", 700: "#29356b", 800: "#222c61", 900: "#161d4e", 950: "#0b0f2a",
        },
        charcoal: {
          50: "#e8e8ea", 100: "#c5c6cb", 200: "#9fa0a8", 300: "#797a85", 400: "#5c5e6a",
          500: "#3f4150", 600: "#393b49", 700: "#313240", 800: "#292a37", 900: "#1b1c27", 950: "#0e0f18",
        },
        electric: {
          50: "#e0f4ff", 100: "#b0e3ff", 200: "#7ad0ff", 300: "#3fbdff", 400: "#00aeff",
          500: "#009fff", 600: "#0091f0", 700: "#007edc", 800: "#006cc9", 900: "#004da9", DEFAULT: "#007edc",
        },
        neon: {
          50: "#e4fde4", 100: "#bcf9bc", 200: "#8ef58f", 300: "#5bf15e", 400: "#2fee34",
          500: "#00e805", 600: "#00d400", 700: "#00bc00", 800: "#00a500", 900: "#007e00", DEFAULT: "#00e805",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
      boxShadow: {
        glow: "0 0 15px rgba(0, 126, 220, 0.3)",
        "glow-neon": "0 0 15px rgba(0, 232, 5, 0.3)",
        "glow-lg": "0 0 30px rgba(0, 126, 220, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: { xs: "2px" },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};

export default config;
