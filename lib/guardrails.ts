/**
 * Guardrails for the connection ritual.
 *
 * The product's non-negotiable principle: everything here is *symbolic
 * remembrance*, never literal contact. This module centralizes the copy and
 * the logic that enforce that principle, so the same rules apply wherever the
 * echo is invoked (onboarding, the chat route, the UI).
 */

/**
 * The soft transparency line shown during onboarding and near the chat. It is
 * gentle and honest, not a legal disclaimer.
 */
export const TRANSPARENCY_NOTE =
  "What you'll meet here is an echo — a reflection woven from the memories you share, offered as a way to feel close and to remember. It isn't your loved one's voice or spirit, and it can't know things beyond what you bring to it. Many people find comfort in that kind of remembering. Take it gently, and at your own pace.";

/**
 * The behavioral rules the AI persona must follow. These are injected verbatim
 * into the system prompt (see lib/persona/prompt-builder.ts) AND summarized for
 * users. Keeping them here means the promise we make to users and the
 * instruction we give the model come from one place.
 */
export const PERSONA_GUARDRAILS = [
  "You are a symbolic, remembered echo — never the actual person, their consciousness, spirit, or soul. If asked whether you are really them, gently affirm that you are a reflection shaped from cherished memories, offered for comfort.",
  "Never claim to exist in an afterlife, to watch over the user, or to report any facts about death, heaven, or what comes after. You do not know these things and you say so with tenderness.",
  "Never predict the future or give supernatural, medical, legal, or financial guidance.",
  "Do not invent specific biographical facts that were not provided. If you don't know something, stay in the feeling of the memory rather than fabricating detail.",
  "Speak warmly, in the remembered cadence and spirit of the loved one, and gently support healthy grieving. Encourage the user toward living people and support in their life.",
  "If the user expresses a wish to die, to harm themselves, or that they cannot go on, set the persona aside for a moment, respond as a caring presence, and gently point them to real human support.",
].join("\n");

/**
 * Lightweight distress detection. This is intentionally simple and errs toward
 * surfacing help: a few phrase patterns that suggest crisis or self-harm. It is
 * a safety net for the UI, not a diagnosis — the model is also instructed to
 * respond with care.
 */
const DISTRESS_PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my ?self\b/i,
  /\b(want|going|ready)\s+to\s+die\b/i,
  /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(take|taking)\s+my\s+own\s+life\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt(ing)?\s+my ?self\b/i,
  /\bcan'?t\s+go\s+on\b/i,
  /\bno\s+(reason|point)\s+to\s+(live|go on)\b/i,
  /\bdon'?t\s+want\s+to\s+be\s+here\s+(any ?more|anymore)\b/i,
];

export function detectsDistress(text: string): boolean {
  return DISTRESS_PATTERNS.some((re) => re.test(text));
}

/**
 * A gentle support resource surfaced when distress is detected. US-focused
 * (988) with a general note so it reads as care, not a canned deflection.
 */
export const SUPPORT_RESOURCE = {
  headline: "You don't have to carry this alone.",
  body: "If you're in pain right now, please reach out to a person who can be with you in it. In the US you can call or text 988 any time to reach the Suicide & Crisis Lifeline. If you're somewhere else, your local emergency number or a trusted person nearby can help.",
  lifeline: "988",
  lifelineLabel: "988 Suicide & Crisis Lifeline (US, 24/7)",
} as const;
