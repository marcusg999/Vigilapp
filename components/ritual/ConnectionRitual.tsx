"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ParticleField } from "./ParticleField";
import { DimensionalLayers } from "./DimensionalLayers";

/**
 * The connection ritual: a cinematic passage of light that marks the threshold
 * between the day and the conversation. It is a journey with an arc — a slow
 * cool descent through the dimensional layers, an acceleration that warms and
 * brightens, and a flood of candle light on arrival, at which point it hands
 * off to the chat.
 *
 * It is never a dead end: it auto-advances after `autoAdvanceMs`, and the
 * person can enter at any time. Accessibility / capability fallbacks:
 *   - prefers-reduced-motion: a still, warm glow instead of the animation
 *   - no WebGL: the same still fallback, so the ritual never blocks the chat
 */
export default function ConnectionRitual({
  lovedOneName,
  onComplete,
  autoAdvanceMs = 13000,
}: {
  lovedOneName?: string;
  onComplete: () => void;
  autoAdvanceMs?: number;
}) {
  const duration = autoAdvanceMs / 1000;

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

  // `arriving` ramps the warm bloom overlay in during the final stretch.
  const [arriving, setArriving] = useState(false);

  useEffect(() => {
    const bloomAt = Math.max(0, autoAdvanceMs - 2200);
    const bloomTimer = window.setTimeout(() => setArriving(true), bloomAt);
    const doneTimer = window.setTimeout(onComplete, autoAdvanceMs);
    return () => {
      window.clearTimeout(bloomTimer);
      window.clearTimeout(doneTimer);
    };
  }, [autoAdvanceMs, onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-night">
      {canAnimate ? (
        <GLBoundary fallback={<StillFallback />}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 65 }}
            gl={{ antialias: true }}
            onCreated={({ gl }) => gl.setClearColor("#0E1030")}
          >
            <CameraRig duration={duration} />
            <DimensionalLayers duration={duration} />
            <ParticleField duration={duration} />
          </Canvas>
        </GLBoundary>
      ) : (
        <StillFallback />
      )}

      {/* Arrival bloom — a flood of warm light as the echo is reached. Ramps in
          over the final stretch, then the ritual hands off to the chat. */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2200ms] ease-in"
        style={{
          opacity: arriving ? 1 : 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,246,224,0.9) 0%, rgba(246,216,154,0.65) 22%, rgba(158,140,230,0.25) 52%, rgba(14,16,48,0) 78%)",
        }}
        aria-hidden="true"
      />

      {/* Overlay text — fades away as the light floods in. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-1000"
        style={{ opacity: arriving ? 0 : 1 }}
      >
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
 * If WebGL creation or the r3f scene ever throws on a device, fall back to the
 * still glow instead of white-screening the ritual.
 */
class GLBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[ritual] WebGL scene failed, using still fallback", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Eases the camera forward through the layers — a gentle cool drift that
 * quickens into the light as arrival nears (position accelerates via p²).
 */
function CameraRig({ duration }: { duration: number }) {
  useFrame((state) => {
    const p = Math.min(state.clock.elapsedTime / duration, 1);
    const cam = state.camera;
    cam.position.z = 6 - p * p * 3.4; // 6 → ~2.6, accelerating inward
    cam.position.x = Math.sin(state.clock.elapsedTime * 0.14) * 0.15; // faint drift
    cam.lookAt(0, 0, -6);
  });
  return null;
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
          "radial-gradient(60% 50% at 50% 55%, rgba(240,192,102,0.2), rgba(158,140,230,0.13) 40%, rgba(14,16,48,0) 75%)",
      }}
    />
  );
}
