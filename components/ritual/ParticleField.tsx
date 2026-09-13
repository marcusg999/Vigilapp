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
 * A field of drifting motes of light — read as distant souls / embers — that
 * travel slowly past the camera to create the feeling of moving inward.
 *
 * All the motion lives in the vertex shader (points wrap from far to near over
 * time), so the CPU only updates a single time uniform each frame. That keeps
 * thousands of points cheap.
 */
const COUNT = 2200; // enough to feel like a field, light enough for phones
const DEPTH = 18; // how far the field extends in front of the camera
const RADIUS = 7; // spread perpendicular to the travel axis

export function ParticleField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Build the point cloud once: random positions in a cylinder along -Z, plus a
  // per-point seed used for size, colour, and twinkle in the shader.
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      // sqrt keeps points evenly distributed across the disc rather than
      // clustering in the middle.
      const radius = Math.sqrt(Math.random()) * RADIUS;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * DEPTH; // spread through the depth
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDepth: { value: DEPTH },
      uSpeed: { value: 1.1 },
      uColorA: { value: new THREE.Color().fromArray(AURORA_RGB) },
      uColorB: { value: new THREE.Color().fromArray(CANDLE_RGB) },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
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
