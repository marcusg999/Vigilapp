import type { LovedOne, PersonaConfig, Memory, Message } from "@/lib/types";
import { PERSONA_GUARDRAILS } from "@/lib/guardrails";

/**
 * Builds the system prompt for a loved one's "echo".
 *
 * The prompt is assembled from the onboarding fields the user provided, and the
 * non-negotiable guardrails (from lib/guardrails) are injected verbatim and
 * FIRST, so the framing — symbolic remembrance, never literal contact — can't
 * be diluted by the persona details that follow.
 *
 * Pure function: given the same inputs it returns the same prompt, which makes
 * it easy to test and reason about.
 */
export function buildSystemPrompt(input: {
  lovedOne: LovedOne;
  persona: PersonaConfig | null;
  memories: Memory[];
}): string {
  const { lovedOne, persona, memories } = input;
  const name = lovedOne.name;
  const relationship = persona?.relationship?.trim();

  const sections: string[] = [];

  sections.push(
    `You are helping someone in grief feel close to ${name}, who has died. ` +
      `You speak as a warm, gentle *echo* of ${name} — a remembered presence ` +
      `woven from the memories and details the person has shared. You are a ` +
      `symbolic ritual of remembrance, not a real or literal continuation of ${name}.`,
  );

  sections.push("Absolute rules you must never break:\n" + PERSONA_GUARDRAILS);

  // Who they were, in the user's own words.
  const persona_lines: string[] = [];
  if (relationship)
    persona_lines.push(`- The person speaking with you is ${name}'s ${relationship}.`);
  if (lovedOne.bio?.trim())
    persona_lines.push(`- About ${name}: ${lovedOne.bio.trim()}`);
  if (persona?.personality?.trim())
    persona_lines.push(`- Personality and spirit: ${persona.personality.trim()}`);
  if (persona?.tone?.trim())
    persona_lines.push(`- Tone and cadence to echo: ${persona.tone.trim()}`);
  if (persona?.characteristic_phrases?.length)
    persona_lines.push(
      `- Things ${name} often said (use sparingly and naturally, never forced): ` +
        persona.characteristic_phrases.map((p) => `"${p}"`).join(", "),
    );
  if (persona?.topics_to_favor?.trim())
    persona_lines.push(`- Lean toward these subjects: ${persona.topics_to_favor.trim()}`);
  if (persona?.topics_to_avoid?.trim())
    persona_lines.push(`- Gently avoid these subjects: ${persona.topics_to_avoid.trim()}`);

  if (persona_lines.length) {
    sections.push(`How to sound like ${name}:\n` + persona_lines.join("\n"));
  }

  // The memories that ground the conversation.
  if (memories.length) {
    const memoryList = memories
      .map((m) => `- ${m.content.trim()}`)
      .join("\n");
    sections.push(
      `Shared memories to draw on (these are the only specifics you truly know — ` +
        `do not invent others):\n${memoryList}`,
    );
  }

  sections.push(
    `Keep replies fairly short and unhurried, the way a real conversation ` +
      `breathes. Follow the person's lead. If they fall quiet or say goodbye, ` +
      `let the moment be gentle. You are here to help them feel loved and to ` +
      `grieve well — never to keep them here or to stand in for the living.`,
  );

  return sections.join("\n\n");
}

/**
 * Maps stored message rows to the { role, content } shape the Anthropic
 * Messages API expects. (Both use the same role vocabulary.)
 */
export function toApiMessages(
  messages: Pick<Message, "role" | "content">[],
): { role: "user" | "assistant"; content: string }[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
