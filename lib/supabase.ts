import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getToken } from "@dome-layer/dome-ui/utils";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client authenticated with the dome_auth_token JWT.
// RLS enforces (select auth.uid()) = user_id — the signed-in user only sees
// their own governance_events rows automatically.
export function getSupabaseClient(): SupabaseClient {
  const token = getToken();
  return createClient(url, anonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: { persistSession: false }, // session owned by dome-auth, not Supabase
  });
}

// Server-side client using the service role key — bypasses RLS.
// Only used in Next.js API routes (never client-exposed).
export function getServiceClient(): SupabaseClient {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
