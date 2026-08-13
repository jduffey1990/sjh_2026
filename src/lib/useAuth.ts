import { useEffect, useState } from "react";
import { supabase, hasBackend } from "./supabase";

export type AuthState = "checking" | "in" | "out" | "no-backend";

/**
 * Session state for the shared trip account.
 *
 * Note this is a real gate, not a UI one: the RLS policies require the
 * `authenticated` role, so without a session the key baked into the public
 * bundle returns nothing. A signed-in session is cached and auto-refreshed,
 * which matters because you cannot sign in again from a hut with no signal.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(
    hasBackend ? "checking" : "no-backend",
  );

  useEffect(() => {
    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(({ data }) => setState(data.session ? "in" : "out"))
      .catch(() => setState("out"));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setState(session ? "in" : "out"),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return state;
}
