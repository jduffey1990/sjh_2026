import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * The single shared trip account. Everyone signs in as this; who you *are*
 * is still just the name you pick, stored on the device.
 *
 * The address is a local-only placeholder -- no mail is ever sent to it.
 */
export const TRIP_EMAIL = 'trip@sjh2026.local'

/**
 * Null when the env vars are absent, which is a supported state: the
 * schedule, travel, route and gallery pages are entirely static and work
 * with no backend at all.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          // The session must survive closing the app and a week off-grid,
          // so it is persisted and refreshed rather than held in memory.
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'sjh2026.auth',
        },
        realtime: { params: { eventsPerSecond: 5 } },
      })
    : null

export const hasBackend = supabase !== null

export async function signIn(password: string) {
  if (!supabase) throw new Error('No backend configured')
  const { error } = await supabase.auth.signInWithPassword({
    email: TRIP_EMAIL,
    password,
  })
  if (error) throw error
}

export async function signOut() {
  await supabase?.auth.signOut()
}
