"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYER_VERTEX, LAYER_FRAGMENT, AURORA_RGB, CANDLE_RGB } from "./shaders";

/**
 * The dimensional layers: translucent, additive shells the journey passes
 * through — read as luminous gates. They drift toward the camera and wrap back;
 * as the ritual nears arrival they accelerate and flare brighter (uWarp) and
 * warm toward candle gold (uWarm), so crossing the final gates feels like
 * breaking into light. Driven from the shared r3f clock and the ritual
 * `duration`.
 */
const LAYERS = 7;
const DEPTH = 22;

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

export function DimensionalLayers({ duration }: { duration: number }) {
  const group = useRef<THREE.Group>(null);
  const travel = useRef(0);

  const shells = useMemo(
    () =>
      Array.from({ length: LAYERS }, (_, i) => ({
        baseZ: -(i / LAYERS) * DEPTH,
        scale: 8 + i * 1.4,
        color: new THREE.Color().fromArray(i % 3 === 0 ? CANDLE_RGB : AURORA_RGB),
      })),
    [],
  );

  const materials = useMemo(
    () =>
      shells.map(
        (s) =>
          new THREE.ShaderMaterial({
            vertexShader: LAYER_VERTEX,
            fragmentShader: LAYER_FRAGMENT,
            uniforms: {
              uTime: { value: Math.random() * 10 },
              uColor: { value: s.color },
              uWarm: { value: 0 },
              uWarp: { value: 0 },
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
    const p = Math.min(state.clock.elapsedTime / duration, 1);
    const warp = smoothstep(0.6, 1.0, p);
    const warm = smoothstep(0.5, 1.0, p);
    travel.current += delta * (1.4 + warp * 9.0);

    group.current.children.forEach((child, i) => {
      const mat = materials[i];
      mat.uniforms.uTime.value += delta;
      mat.uniforms.uWarm.value = warm;
      mat.uniforms.uWarp.value = warp;
      const z = ((shells[i].baseZ + travel.current) % DEPTH) - DEPTH;
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
