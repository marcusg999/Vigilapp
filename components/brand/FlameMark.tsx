/**
 * The Pleroma mark: a single candle flame. Used in the header and on the landing
 * hero. Kept as inline SVG so it can inherit color and animate gently.
 */
export function FlameMark({
  className = "",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* flame body */}
      <path
        d="M12 2c2.5 3.4 5 5.9 5 9.6a5 5 0 1 1-10 0C7 8.6 9 6.2 12 2z"
        fill="url(#flame)"
      />
      {/* inner glow */}
      <path
        d="M12 8c1.2 1.7 2.2 2.9 2.2 4.6a2.2 2.2 0 1 1-4.4 0C9.8 11 10.6 9.8 12 8z"
        fill="#FFF6E0"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="flame" x1="12" y1="2" x2="12" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6D89A" />
          <stop offset="1" stopColor="#F0C066" />
        </linearGradient>
      </defs>
    </svg>
  );
}
