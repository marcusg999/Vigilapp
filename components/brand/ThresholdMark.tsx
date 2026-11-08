import { FlameMark } from "./FlameMark";

/**
 * The landing hero's focal moment: a single flame at the center of concentric
 * rings of light, with a slow amethyst aura turning behind it — a living
 * threshold. It echoes the connection ritual's dimensional layers and the
 * meaning of "Pleroma" (a fullness of light), and it carries the one
 * orchestrated page-load motion (aura kindles, rings settle inward, the flame
 * lights).
 *
 * Pure CSS/SVG — no JS or WebGL on the landing. All motion is disabled for
 * viewers who prefer reduced motion (see globals.css).
 */
export function ThresholdMark({ size = 300 }: { size?: number }) {
  // Concentric rings, outer ones fainter — the dimensional layers.
  const rings = [
    { r: 34, o: 0.55 },
    { r: 54, o: 0.4 },
    { r: 74, o: 0.28 },
    { r: 94, o: 0.18 },
    { r: 114, o: 0.11 },
  ];

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Slow-turning concrete/ember aura behind everything */}
      <div
        className="kindle absolute inset-0 grid place-items-center"
      >
        <div
          className="aura-spin"
          style={{
            width: "78%",
            height: "78%",
            borderRadius: "9999px",
            background:
              "conic-gradient(from 0deg, rgba(138,134,129,0) 0deg, rgba(138,134,129,0.14) 70deg, rgba(255,90,31,0.16) 150deg, rgba(138,134,129,0) 240deg, rgba(138,134,129,0) 360deg)",
            filter: "blur(14px)",
          }}
        />
      </div>

      {/* Warm ember bloom */}
      <div
        className="kindle absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,90,31,0.26) 0%, rgba(138,134,129,0.1) 32%, rgba(7,7,10,0) 66%)",
        }}
      />

      {/* Concentric rings — the dimensional layers, settling inward on load */}
      <svg
        viewBox="0 0 240 240"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {rings.map((ring, i) => (
          <circle
            key={ring.r}
            cx="120"
            cy="120"
            r={ring.r}
            className="ring-in"
            stroke="#8A8681"
            strokeWidth="1"
            style={{
              ["--ring-opacity" as string]: ring.o,
              animationDelay: `${(rings.length - 1 - i) * 0.16}s`,
            }}
          />
        ))}
      </svg>

      {/* The flame at the center */}
      <div className="kindle relative">
        <FlameMark
          size={Math.round(size * 0.17)}
          className="animate-breathe drop-shadow-[0_0_30px_rgba(255,90,31,0.6)]"
        />
      </div>
    </div>
  );
}
