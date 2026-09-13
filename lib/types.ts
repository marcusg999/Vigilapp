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

export type Profile = {
  id: string; // = auth.users.id
  display_name: string;
  created_at: string;
  updated_at: string;
}

export type LovedOne = {
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

export type PersonaConfig = {
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

export type Memory = {
  id: string;
  loved_one_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export type Conversation = {
  id: string;
  loved_one_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export type Message = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export type Offering = {
  id: string;
  loved_one_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export type ContentItem = {
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

export type AuditLogEntry = {
  id: number;
  actor: string | null;
  action: string; // e.g. "content.create"
  entity: string | null; // e.g. "content_items"
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Database type compatible with @supabase/ssr generics. Insert loosens columns
 * that have DB defaults (ids, timestamps, defaulted text). The `Table` helper
 * supplies the `Relationships` member supabase-js requires so queries stay
 * typed rather than degrading to `never`.
 */
type WithDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Profile,
        WithDefaults<Profile, "created_at" | "updated_at" | "display_name">
      >;
      loved_ones: Table<
        LovedOne,
        WithDefaults<
          LovedOne,
          "id" | "created_at" | "updated_at" | "bio" | "born_on" | "died_on" | "avatar_path"
        >
      >;
      persona_configs: Table<
        PersonaConfig,
        WithDefaults<
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
        >
      >;
      memories: Table<Memory, WithDefaults<Memory, "id" | "created_at">>;
      conversations: Table<
        Conversation,
        WithDefaults<Conversation, "id" | "created_at" | "updated_at" | "title">
      >;
      messages: Table<Message, WithDefaults<Message, "id" | "created_at">>;
      offerings: Table<Offering, WithDefaults<Offering, "id" | "created_at">>;
      content_items: Table<
        ContentItem,
        WithDefaults<
          ContentItem,
          "id" | "created_at" | "updated_at" | "published" | "created_by" | "body"
        >
      >;
      audit_log: Table<
        AuditLogEntry,
        WithDefaults<AuditLogEntry, "id" | "created_at" | "metadata">
      >;
      admin_users: Table<
        { user_id: string; created_at: string },
        { user_id: string; created_at?: string }
      >;
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
    CompositeTypes: Record<string, never>;
  };
}
