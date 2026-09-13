import { FlameMark } from "./FlameMark";

/**
 * The landing hero's focal moment: a single flame at the center of concentric
 * rings of light — a threshold. It echoes the connection ritual's dimensional
 * layers and the meaning of "Pleroma" (a fullness of light), and it carries the
 * one orchestrated page-load motion (rings settle inward, the flame kindles).
 *
 * Pure CSS/SVG — no JS or WebGL on the landing. Motion is disabled for viewers
 * who prefer reduced motion (see globals.css).
 */
export function ThresholdMark({ size = 240 }: { size?: number }) {
  // Each ring: radius and the opacity it settles to. Outer rings are fainter.
  const rings = [
    { r: 42, o: 0.5 },
    { r: 68, o: 0.3 },
    { r: 94, o: 0.18 },
    { r: 118, o: 0.1 },
  ];

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Warm candle bloom behind everything */}
      <div
        className="kindle absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(240,192,102,0.22) 0%, rgba(158,140,230,0.12) 34%, rgba(14,16,48,0) 68%)",
        }}
      />

      {/* Concentric rings — the dimensional layers */}
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
            stroke="#9E8CE6"
            strokeWidth="1"
            style={{
              // final opacity + staggered settle, outermost first
              ["--ring-opacity" as string]: ring.o,
              animationDelay: `${(rings.length - 1 - i) * 0.18}s`,
            }}
          />
        ))}
      </svg>

      {/* The flame at the center */}
      <div className="kindle relative">
        <FlameMark
          size={Math.round(size * 0.2)}
          className="animate-breathe drop-shadow-[0_0_26px_rgba(240,192,102,0.6)]"
        />
      </div>
    </div>
  );
}
