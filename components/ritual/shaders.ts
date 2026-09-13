/**
 * GLSL shaders for the connection ritual, kept in one small file so the visual
 * math lives apart from the React components that mount it.
 *
 * The scene is additive and dark: points and planes only ever *add* light to
 * the night. The ritual is a journey — it starts cool (amethyst) and, as the
 * camera accelerates inward through the dimensional layers, warms toward candle
 * gold and brightens, arriving in a flood of warm light. Two uniforms carry
 * that journey to every shader:
 *   uWarm  0..1  — colour lerp from amethyst toward candle
 *   uWarp  0..1  — acceleration/brightness as the arrival nears
 */

/* ------------------------------------------------------------------ */
/* Particle field — motes of light streaming past, faster near arrival */
/* ------------------------------------------------------------------ */

export const PARTICLE_VERTEX = /* glsl */ `
  uniform float uTravel;  // integrated distance travelled (CPU-accumulated)
  uniform float uDepth;   // how deep the field extends in front of the camera
  uniform float uWarp;    // 0..1 acceleration/brightness near arrival
  attribute float aSeed;  // per-point 0..1 randomness

  varying float vSeed;
  varying float vFade;

  void main() {
    vSeed = aSeed;

    // Wrap each point through the depth as we travel inward.
    float z = mod(position.z + uTravel, uDepth) - uDepth; // [-uDepth, 0)
    vec4 mv = modelViewMatrix * vec4(position.x, position.y, z, 1.0);
    gl_Position = projectionMatrix * mv;

    float dist = -mv.z;
    float base = clamp(180.0 / dist, 1.0, 42.0) * (0.6 + 0.8 * aSeed);
    // Motes swell and brighten as the journey accelerates.
    gl_PointSize = base * (1.0 + uWarp * 2.4);

    vFade = smoothstep(uDepth, uDepth * 0.35, dist) * smoothstep(0.12, 1.7, dist);
  }
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
  precision highp float; // match the vertex stage so shared uniforms agree

  uniform vec3 uColorA; // aurora (amethyst) — the many
  uniform vec3 uColorB; // candle (gold) — the rare warm few, and the arrival
  uniform float uWarm;  // 0..1 amethyst -> candle
  uniform float uWarp;  // 0..1 extra brightness near arrival

  varying float vSeed;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float alpha = smoothstep(0.5, 0.0, length(uv)); // soft round sprite

    // A minority start candle-gold; on arrival everything warms to candle.
    vec3 cool = mix(uColorA, uColorB, smoothstep(0.82, 1.0, vSeed));
    vec3 color = mix(cool, uColorB, uWarm);

    gl_FragColor = vec4(color * (1.0 + uWarp * 0.9), alpha * vFade);
  }
`;

/* ------------------------------------------------------------------ */
/* Dimensional layers — translucent gates the journey passes through    */
/* ------------------------------------------------------------------ */

export const LAYER_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const LAYER_FRAGMENT = /* glsl */ `
  precision highp float; // match the vertex stage so shared uniforms agree

  uniform float uTime;
  uniform vec3  uColor;
  uniform float uWarm;   // 0..1 shell colour warms toward candle
  uniform float uWarp;   // 0..1 gates flare brighter near arrival
  varying vec2  vUv;

  void main() {
    // Concentric shimmer radiating from the centre of each gate.
    vec2 c = vUv - 0.5;
    float r = length(c);
    float ring = 0.5 + 0.5 * sin(r * 16.0 - uTime * 1.1);
    float glow = smoothstep(0.5, 0.0, r); // bright core, transparent rim
    float alpha = glow * (0.10 + 0.12 * ring) * (1.0 + uWarp * 1.6);

    vec3 candle = vec3(0.94, 0.75, 0.40);
    vec3 color = mix(uColor, candle, uWarm);

    gl_FragColor = vec4(color, alpha);
  }
`;

/* Palette pulled from the app's design tokens, in 0..1 linear-ish RGB. */
export const AURORA_RGB: [number, number, number] = [0.62, 0.55, 0.9]; // #9E8CE6
export const CANDLE_RGB: [number, number, number] = [0.94, 0.75, 0.4]; // #F0C066
