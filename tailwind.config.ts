import type { Config } from "tailwindcss";

/**
 * Design tokens for "Vigil — Liminal Light".
 *
 * The palette is a candlelight vigil at twilight: a deep indigo night, a single
 * warm flame (candle gold) reserved for sacred/primary moments, and an amethyst
 * "aurora" that stands in for the dimensional light of the connection ritual.
 * We intentionally avoid decorative shadows/cards; hierarchy comes from space,
 * light (glows), and hairlines that fade at their ends.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0E1030",
        veil: "#171A44",
        "veil-2": "#221F52",
        candle: "#F0C066",
        "candle-soft": "#F6D89A",
        aurora: "#9E8CE6",
        "aurora-deep": "#6C5CB0",
        pearl: "#ECE7FB",
        mist: "#A9A2CF",
      },
      fontFamily: {
        // Wired up via next/font CSS variables in app/layout.tsx.
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        measure: "62ch", // comfortable reading line-length for grief-facing copy
      },
      boxShadow: {
        // A soft candle glow, not a drop shadow.
        glow: "0 0 40px -8px rgba(240, 192, 102, 0.35)",
        "glow-aurora": "0 0 60px -10px rgba(158, 140, 230, 0.4)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        // Slow, calm — the pace of breath, not of a product.
        breathe: "breathe 6s ease-in-out infinite",
        "fade-in": "fade-in 1.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
