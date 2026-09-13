import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LovedOne, Message } from "@/lib/types";
import { ConnectExperience } from "@/components/chat/ConnectExperience";

/**
 * The connection screen: loads (and verifies ownership of) the conversation and
 * its loved one, then hands off to the client experience — the ritual followed
 * by the chat. The conversation id arrives as ?c=… from startConversation.
 */
export default async function ConnectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { c?: string };
}) {
  const conversationId = searchParams.c;
  if (!conversationId) redirect(`/app/loved-ones/${params.id}`);

  const supabase = createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  // Guard: the conversation must exist and belong to this loved one (RLS
  // already limits it to the current user).
  if (!conversation || conversation.loved_one_id !== params.id) notFound();

  const { data: lovedOne } = await supabase
    .from("loved_ones")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!lovedOne) notFound();
  const lo = lovedOne as LovedOne;

  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (
    <ConnectExperience
      conversationId={conversationId}
      lovedOneName={lo.name}
      initialMessages={(msgs as Message[] | null) ?? []}
    />
  );
}
