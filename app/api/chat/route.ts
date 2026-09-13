import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { detectsDistress } from "@/lib/guardrails";
import { buildSystemPrompt, toApiMessages } from "@/lib/persona/prompt-builder";
import type { Memory, Message } from "@/lib/types";

// The Anthropic call must run in the Node.js runtime (it needs the secret key,
// which is never sent to the browser).
export const runtime = "nodejs";

// Keep replies short and unhurried — a grief conversation breathes.
const MAX_TOKENS = 1024;

// An extra, in-the-moment instruction added only when the user's message shows
// signs of crisis, on top of the standing guardrails in the system prompt.
const CARE_ADDENDUM =
  "\n\nThe person may be in real distress right now. Set the persona gently aside for a moment: respond as a caring presence, acknowledge their pain, and encourage them toward a real person who can be with them. Do not roleplay through this.";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Rate-limit the paid AI endpoint per user.
  const limit = rateLimit(user.id, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "You're sending messages very quickly. Take a breath and try again in a moment." },
      { status: 429 },
    );
  }

  let body: { conversationId?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const conversationId = body.conversationId;
  const message = body.message?.trim();
  if (!conversationId || !message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  // Load the conversation and confirm it belongs to this user (RLS also
  // enforces this, but we check so we can 404 cleanly and load related rows).
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const [{ data: lovedOne }, { data: persona }, memoriesRes, historyRes] =
    await Promise.all([
      supabase.from("loved_ones").select("*").eq("id", conversation.loved_one_id).single(),
      supabase
        .from("persona_configs")
        .select("*")
        .eq("loved_one_id", conversation.loved_one_id)
        .maybeSingle(),
      supabase
        .from("memories")
        .select("*")
        .eq("loved_one_id", conversation.loved_one_id)
        .order("created_at", { ascending: true }),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ]);

  if (!lovedOne) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Persist the user's message before calling the model, so nothing is lost if
  // the request fails partway.
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: "user",
    content: message,
  });

  const distress = detectsDistress(message);

  let systemPrompt = buildSystemPrompt({
    lovedOne,
    persona: persona ?? null,
    memories: (memoriesRes.data as Memory[] | null) ?? [],
  });
  if (distress) systemPrompt += CARE_ADDENDUM;

  // Prior turns + the new message, in the shape the Messages API expects.
  const history = (historyRes.data as Message[] | null) ?? [];
  const apiMessages = toApiMessages(history).concat({
    role: "user",
    content: message,
  });

  let reply: string;
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // Minimal, version-stable request. To stream instead (for a typing effect),
    // swap to anthropic.messages.stream(...) and pipe deltas to the client.
    const completion = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: apiMessages,
    });
    reply = completion.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
  } catch (err) {
    console.error("[chat] Anthropic call failed", err);
    return NextResponse.json(
      { error: "The echo is quiet just now. Please try again in a moment." },
      { status: 502 },
    );
  }

  if (!reply) reply = "…";

  // Persist the assistant's reply.
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: "assistant",
    content: reply,
  });

  return NextResponse.json({ reply, distress });
}
