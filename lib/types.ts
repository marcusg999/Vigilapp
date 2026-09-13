/**
 * Shared TypeScript shapes for the Vigil data model.
 *
 * This mirrors the SQL in `supabase/migrations` (0002_tables.sql) exactly.
 * It is hand-written so the whole app has one small, readable source of truth
 * for row shapes. Keep it in sync with the migrations.
 *
 * Admin status is NOT a column here — it lives in a separate `admin_users`
 * registry that clients can't read, and is checked via the `is_admin()` SQL
 * function (see lib/auth.ts). Profiles therefore carry no role.
 */

export type MessageRole = "user" | "assistant";
export type ContentCategory = "ritual" | "nde";

export interface Profile {
  id: string; // = auth.users.id
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface LovedOne {
  id: string;
  user_id: string;
  name: string;
  born_on: string | null; // date
  died_on: string | null; // date
  avatar_path: string | null; // Storage path, never a public URL
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface PersonaConfig {
  id: string;
  loved_one_id: string;
  user_id: string;
  relationship: string; // e.g. "mother", "friend"
  personality: string;
  characteristic_phrases: string[]; // things they used to say
  tone: string;
  topics_to_favor: string;
  topics_to_avoid: string;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  loved_one_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  loved_one_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
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
  category: ContentCategory;
  title: string;
  body: string;
  region: string | null; // ritual origin / region
  youtube_url: string | null;
  published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: number;
  actor: string | null;
  action: string; // e.g. "content.create"
  entity: string | null; // e.g. "content_items"
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Minimal Database type compatible with @supabase/ssr generics. Insert/Update
 * loosen columns that have DB defaults (ids, timestamps, defaulted text).
 */
type WithDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: WithDefaults<Profile, "created_at" | "updated_at" | "display_name">;
        Update: Partial<Profile>;
      };
      loved_ones: {
        Row: LovedOne;
        Insert: WithDefaults<
          LovedOne,
          "id" | "created_at" | "updated_at" | "bio" | "born_on" | "died_on" | "avatar_path"
        >;
        Update: Partial<LovedOne>;
      };
      persona_configs: {
        Row: PersonaConfig;
        Insert: WithDefaults<
          PersonaConfig,
          | "id"
          | "created_at"
          | "updated_at"
          | "relationship"
          | "personality"
          | "characteristic_phrases"
          | "tone"
          | "topics_to_favor"
          | "topics_to_avoid"
        >;
        Update: Partial<PersonaConfig>;
      };
      memories: {
        Row: Memory;
        Insert: WithDefaults<Memory, "id" | "created_at">;
        Update: Partial<Memory>;
      };
      conversations: {
        Row: Conversation;
        Insert: WithDefaults<Conversation, "id" | "created_at" | "updated_at" | "title">;
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
          "id" | "created_at" | "updated_at" | "published" | "created_by" | "body"
        >;
        Update: Partial<ContentItem>;
      };
      audit_log: {
        Row: AuditLogEntry;
        Insert: WithDefaults<AuditLogEntry, "id" | "created_at" | "metadata">;
        Update: never;
      };
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      user_owns_loved_one: { Args: { p_loved_one_id: string }; Returns: boolean };
      user_owns_conversation: { Args: { p_conversation_id: string }; Returns: boolean };
    };
    Enums: {
      message_role: MessageRole;
      content_category: ContentCategory;
    };
  };
}
