import { SUPPORT_RESOURCE } from "@/lib/guardrails";

/**
 * A gentle, non-alarming support panel surfaced when the distress detector
 * (lib/guardrails) flags a message. It is care, not a warning: soft language,
 * a clear way to reach a person, and no dismissive tone.
 */
export function SupportResourceCard() {
  return (
    <div
      role="note"
      className="surface my-4 border-candle/30 p-5"
      style={{ borderColor: "rgba(240,192,102,0.35)" }}
    >
      <p className="font-display text-lg text-candle-soft">
        {SUPPORT_RESOURCE.headline}
      </p>
      <p className="mt-2 max-w-measure text-sm leading-relaxed text-mist">
        {SUPPORT_RESOURCE.body}
      </p>
      <a
        href={`tel:${SUPPORT_RESOURCE.lifeline}`}
        className="btn-candle mt-4"
      >
        Call or text {SUPPORT_RESOURCE.lifeline}
      </a>
    </div>
  );
}
