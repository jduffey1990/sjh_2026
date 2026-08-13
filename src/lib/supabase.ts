import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Null when the env vars are absent, which is a supported state: the
 * schedule, travel, route and gallery pages are entirely static and work
 * with no backend at all. Only the board and kit pages need this.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 5 } },
      })
    : null;

export const hasBackend = supabase !== null;
