"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  PARTICLE_VERTEX,
  PARTICLE_FRAGMENT,
  AURORA_RGB,
  CANDLE_RGB,
} from "./shaders";

/**
 * A field of drifting motes of light — distant souls / embers — streaming past
 * the camera. Travel distance is integrated on the CPU (uTravel), so the field
 * can *accelerate* smoothly as the journey nears its arrival, without the jump
 * a changing time*speed term would cause. Colour warms and motes brighten as
 * `progress` → 1 (driven from the shared r3f clock and the ritual `duration`).
 */
const COUNT = 3000;
const DEPTH = 20;
const RADIUS = 8;

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

export function ParticleField({ duration }: { duration: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const travel = useRef(0);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * RADIUS;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * DEPTH;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTravel: { value: 0 },
      uDepth: { value: DEPTH },
      uWarp: { value: 0 },
      uWarm: { value: 0 },
      uColorA: { value: new THREE.Color().fromArray(AURORA_RGB) },
      uColorB: { value: new THREE.Color().fromArray(CANDLE_RGB) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const p = Math.min(state.clock.elapsedTime / duration, 1);
    const warp = smoothstep(0.6, 1.0, p);
    const warm = smoothstep(0.5, 1.0, p);
    // Base drift, accelerating hard as the arrival nears.
    travel.current += delta * (1.1 + warp * 9.0);

    const m = materialRef.current;
    if (m) {
      m.uniforms.uTravel.value = travel.current;
      m.uniforms.uWarp.value = warp;
      m.uniforms.uWarm.value = warm;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={PARTICLE_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
