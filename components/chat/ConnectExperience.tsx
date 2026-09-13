"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Message } from "@/lib/types";
import { ChatRoom } from "@/components/chat/ChatRoom";

// The ritual pulls in react-three-fiber / three, which are large and browser-
// only. Load it lazily and skip SSR so it never runs on the server.
const ConnectionRitual = dynamic(
  () => import("@/components/ritual/ConnectionRitual"),
  { ssr: false },
);

/**
 * Orchestrates the two phases of a connection: first the ritual (a slow passage
 * of light), then the conversation. If the conversation already has messages
 * (the user is returning to it), we skip straight to the chat.
 */
export function ConnectExperience({
  conversationId,
  lovedOneName,
  initialMessages,
}: {
  conversationId: string;
  lovedOneName: string;
  initialMessages: Message[];
}) {
  const [phase, setPhase] = useState<"ritual" | "chat">(
    initialMessages.length > 0 ? "chat" : "ritual",
  );

  if (phase === "ritual") {
    return (
      <ConnectionRitual
        lovedOneName={lovedOneName}
        onComplete={() => setPhase("chat")}
      />
    );
  }

  return (
    <ChatRoom
      conversationId={conversationId}
      lovedOneName={lovedOneName}
      initialMessages={initialMessages}
    />
  );
}
