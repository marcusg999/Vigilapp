/**
 * GLSL shaders for the connection ritual, kept in one small file so the visual
 * math lives apart from the React components that mount it.
 *
 * The whole scene is additive and dark: points and planes only ever *add* light
 * to the night background, which is what gives the ritual its luminous, candle-
 * and-aurora feel. Nothing here casts shadow or occludes; brightness is the
 * only channel.
 */

/* ------------------------------------------------------------------ */
/* Particle field — drifting motes of light travelling past the camera */
/* ------------------------------------------------------------------ */

export const PARTICLE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uDepth;   // how deep the field extends in front of the camera
  uniform float uSpeed;   // how fast motes travel toward the viewer
  attribute float aSeed;  // per-point 0..1 randomness (size, colour, twinkle)

  varying float vSeed;
  varying float vFade;

  void main() {
    vSeed = aSeed;

    // Continuously move each point toward the camera along -Z and wrap it back
    // to the far plane, so the field feels like an endless slow passage inward.
    float z = mod(position.z + uTime * uSpeed, uDepth) - uDepth; // [-uDepth, 0)
    vec4 mv = modelViewMatrix * vec4(position.x, position.y, z, 1.0);
    gl_Position = projectionMatrix * mv;

    // Distance in front of the camera. Nearer motes look larger.
    float dist = -mv.z;
    gl_PointSize = clamp(180.0 / dist, 1.0, 42.0) * (0.6 + 0.8 * aSeed);

    // Fade in from the far distance and out as they slip past very close, so
    // nothing pops in or out abruptly.
    vFade = smoothstep(uDepth, uDepth * 0.35, dist) * smoothstep(0.15, 1.6, dist);
  }
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uColorA; // aurora (amethyst) — the many
  uniform vec3 uColorB; // candle (gold) — the rare warm few

  varying float vSeed;
  varying float vFade;

  void main() {
    // Soft round sprite: bright centre fading to nothing at the edge.
    vec2 uv = gl_PointCoord - 0.5;
    float alpha = smoothstep(0.5, 0.0, length(uv));

    // A small minority of motes glow candle-gold; the rest are amethyst.
    vec3 color = mix(uColorA, uColorB, smoothstep(0.82, 1.0, vSeed));

    gl_FragColor = vec4(color, alpha * vFade);
  }
`;

/* ------------------------------------------------------------------ */
/* Dimensional layers — translucent shells the journey passes through   */
/* ------------------------------------------------------------------ */

export const LAYER_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const LAYER_FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec3  uColor;
  varying vec2  vUv;

  void main() {
    // Concentric shimmer radiating from the centre of each shell, so passing
    // through one reads as crossing a soft threshold of light.
    vec2 c = vUv - 0.5;
    float r = length(c);
    float ring = 0.5 + 0.5 * sin(r * 16.0 - uTime * 1.1);
    float glow = smoothstep(0.5, 0.0, r); // bright core, transparent rim
    float alpha = glow * (0.10 + 0.12 * ring);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

/* Palette pulled from the app's design tokens, in 0..1 linear-ish RGB. */
export const AURORA_RGB: [number, number, number] = [0.62, 0.55, 0.9]; // #9E8CE6
export const CANDLE_RGB: [number, number, number] = [0.94, 0.75, 0.4]; // #F0C066
