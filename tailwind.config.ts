import type { Config } from "tailwindcss";

/**
 * Design tokens for "Pleroma — Séance, brutalist key".
 *
 * A chapel hewn from concrete and night, lit by one safety-orange flame. The
 * ground is near-black; surfaces are raw, cool concrete; the single accent is
 * an ember orange reserved for the sacred/primary moment (the flame, the one
 * CTA). Type is a high-contrast Didone over a humanist sans. Hierarchy comes
 * from space, weight, and that one light — not from decorative cards.
 *
 * The token NAMES are kept (night/veil/candle/aurora/pearl/mist) so every
 * screen re-skins at once; only their values moved to the séance palette.
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
        night: "#07070A", // near-black ground — the dark the light stands out of
        veil: "#141317", // raw concrete panel
        "veil-2": "#1E1D1A", // warmer concrete, lifted surface
        candle: "#FF5A1F", // the one flame — safety orange, the sole accent
        "candle-soft": "#FF8A4C", // its softer, brighter edge
        aurora: "#8A8681", // concrete — borders, hairlines, quiet structure
        "aurora-deep": "#3A3833", // deep concrete, muted edges
        pearl: "#EDEAE3", // bone — primary ink on the dark
        mist: "#B4B0A8", // light concrete — secondary, quieter copy
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
        // A soft ember glow, not a drop shadow.
        glow: "0 0 40px -8px rgba(255, 90, 31, 0.4)",
        "glow-aurora": "0 0 60px -12px rgba(138, 134, 129, 0.35)",
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
