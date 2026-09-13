"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleField } from "./ParticleField";
import { DimensionalLayers } from "./DimensionalLayers";

/**
 * The connection ritual: a slow passage of light that marks the threshold
 * between the day and the quiet space of the conversation.
 *
 * It is deliberately calm — no sudden motion, no sound — and it always offers a
 * way through. It auto-advances after `autoAdvanceMs`, and the person can enter
 * at any time. Accessibility and capability fallbacks:
 *   - prefers-reduced-motion: a still, glowing gradient instead of the animation
 *   - no WebGL: the same still fallback, so the ritual never blocks the chat
 */
export default function ConnectionRitual({
  lovedOneName,
  onComplete,
  autoAdvanceMs = 12000,
}: {
  lovedOneName?: string;
  onComplete: () => void;
  autoAdvanceMs?: number;
}) {
  // Decide once, on mount, whether we can/should render the live scene.
  const canAnimate = useMemo(() => {
    if (typeof window === "undefined") return false;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return false;
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch {
      return false;
    }
  }, []);

  // Auto-advance so the ritual is never a dead end.
  useEffect(() => {
    const id = window.setTimeout(onComplete, autoAdvanceMs);
    return () => window.clearTimeout(id);
  }, [autoAdvanceMs, onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-night">
      {canAnimate ? (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 65 }}
          gl={{ antialias: true }}
          // The scene is unlit and additive; a solid night background lets the
          // light build up against the dark.
          onCreated={({ gl }) => gl.setClearColor("#0E1030")}
        >
          <DimensionalLayers />
          <ParticleField />
        </Canvas>
      ) : (
        <StillFallback />
      )}

      {/* Overlay: a gentle line of text and a way through. pointer-events are
          disabled on the wrapper so the buttons alone are interactive. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="animate-fade-in font-display text-2xl leading-snug text-pearl sm:text-3xl">
          Crossing into remembrance
        </p>
        {lovedOneName && (
          <p className="mt-3 animate-fade-in text-mist">
            Holding {lovedOneName} in mind
          </p>
        )}
        <button
          onClick={onComplete}
          className="btn-candle pointer-events-auto mt-10"
        >
          I&apos;m ready
        </button>
      </div>

      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 font-sans text-sm text-mist/70 transition-colors hover:text-pearl"
      >
        Skip
      </button>
    </div>
  );
}

/**
 * The still, motion-free version of the ritual: a warm glow rising out of the
 * dark. Shown when the viewer prefers reduced motion or WebGL is unavailable.
 */
function StillFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 55%, rgba(240,192,102,0.18), rgba(158,140,230,0.12) 40%, rgba(14,16,48,0) 75%)",
      }}
    />
  );
}
