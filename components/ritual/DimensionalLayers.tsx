"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYER_VERTEX, LAYER_FRAGMENT, AURORA_RGB, CANDLE_RGB } from "./shaders";

/**
 * A handful of large, translucent shells the journey passes through — the
 * "dimensional layers." Each is a big plane facing the camera with a shimmering
 * radial glow; as they drift toward the viewer and wrap back, crossing one
 * reads as passing a soft threshold of light.
 *
 * Kept few (LAYERS) and additive so they layer into a glow rather than a wall.
 */
const LAYERS = 5;
const DEPTH = 20;
const SPEED = 1.4;

export function DimensionalLayers() {
  const group = useRef<THREE.Group>(null);

  // One config per shell: its starting depth, size, and colour. Alternating
  // colours give the layers a little variety without becoming busy.
  const shells = useMemo(
    () =>
      Array.from({ length: LAYERS }, (_, i) => ({
        baseZ: -(i / LAYERS) * DEPTH,
        scale: 9 + i * 1.5,
        color: new THREE.Color().fromArray(i % 3 === 0 ? CANDLE_RGB : AURORA_RGB),
      })),
    [],
  );

  // Each shell needs its own material instance so uTime can advance per-mesh.
  const materials = useMemo(
    () =>
      shells.map(
        (s) =>
          new THREE.ShaderMaterial({
            vertexShader: LAYER_VERTEX,
            fragmentShader: LAYER_FRAGMENT,
            uniforms: {
              uTime: { value: Math.random() * 10 }, // desync the shimmer
              uColor: { value: s.color },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [shells],
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      // Advance the shimmer.
      materials[i].uniforms.uTime.value += delta;
      // Drift toward the camera and wrap back to the far plane.
      const z = ((shells[i].baseZ + t * SPEED) % DEPTH) - DEPTH;
      child.position.z = z;
    });
  });

  return (
    <group ref={group}>
      {shells.map((s, i) => (
        <mesh
          key={i}
          position={[0, 0, s.baseZ]}
          scale={s.scale}
          material={materials[i]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
