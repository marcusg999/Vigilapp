/**
 * Shared TypeScript shapes for the Vigil data model.
 *
 * This mirrors the SQL schema in `supabase/migrations`. It is hand-written
 * (rather than generated) so the whole app has one small, readable source of
 * truth for row shapes. Keep it in sync with the migrations.
 *
 * Tables (all small and single-purpose):
 *  - profiles         one row per auth user (display name, role, flags)
 *  - loved_ones       a person the user is remembering
 *  - persona_configs  the onboarding fields that shape a loved one's "echo"
 *  - memories         individual shared memories tied to a loved one
 *  - conversations    a chat session with a loved one's echo
 *  - messages         individual chat turns within a conversation
 *  - offerings        short written offerings left for a loved one
 *  - content_items    admin-managed education content (rituals / NDE)
 *  - audit_log        append-only record of admin actions
 */

export type UserRole = "user" | "admin";
export type MessageRole = "user" | "assistant";

export interface Profile {
  id: string; // = auth.users.id
  display_name: string | null;
  role: UserRole;
  onboarding_ack: boolean; // acknowledged the "symbolic, not literal" transparency note
  created_at: string;
}

export interface LovedOne {
  id: string;
  user_id: string;
  name: string;
  relationship: string | null; // e.g. "my grandmother"
  birth_year: number | null;
  passing_year: number | null;
  avatar_url: string | null;
  created_at: string;
}

export interface PersonaConfig {
  id: string;
  loved_one_id: string;
  user_id: string;
  personality: string | null; // warmth, humor, temperament in the user's words
  characteristic_phrases: string | null; // things they used to say
  voice_notes: string | null; // cadence / how they spoke
  updated_at: string;
}

export interface Memory {
  id: string;
  loved_one_id: string;
  user_id: string;
  title: string | null;
  body: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  loved_one_id: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface Offering {
  id: string;
  loved_one_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  ritual_origin: string | null; // tradition / culture of origin
  region: string | null;
  youtube_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string; // admin user id
  action: string; // e.g. "content_item.create"
  target_table: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Minimal Database type compatible with @supabase/ssr generics. Each table
 * lists its Row / Insert / Update shapes. Insert/Update loosen server-managed
 * columns (ids, timestamps) which have DB defaults.
 */
type WithDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: WithDefaults<Profile, "created_at" | "role" | "onboarding_ack">;
        Update: Partial<Profile>;
      };
      loved_ones: {
        Row: LovedOne;
        Insert: WithDefaults<LovedOne, "id" | "created_at">;
        Update: Partial<LovedOne>;
      };
      persona_configs: {
        Row: PersonaConfig;
        Insert: WithDefaults<PersonaConfig, "id" | "updated_at">;
        Update: Partial<PersonaConfig>;
      };
      memories: {
        Row: Memory;
        Insert: WithDefaults<Memory, "id" | "created_at">;
        Update: Partial<Memory>;
      };
      conversations: {
        Row: Conversation;
        Insert: WithDefaults<Conversation, "id" | "created_at">;
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: WithDefaults<Message, "id" | "created_at">;
        Update: Partial<Message>;
      };
      offerings: {
        Row: Offering;
        Insert: WithDefaults<Offering, "id" | "created_at">;
        Update: Partial<Offering>;
      };
      content_items: {
        Row: ContentItem;
        Insert: WithDefaults<
          ContentItem,
          "id" | "created_at" | "updated_at" | "published"
        >;
        Update: Partial<ContentItem>;
      };
      audit_log: {
        Row: AuditLogEntry;
        Insert: WithDefaults<AuditLogEntry, "id" | "created_at">;
        Update: Partial<AuditLogEntry>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      message_role: MessageRole;
    };
  };
}
