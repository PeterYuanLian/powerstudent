import { createClient } from "@supabase/supabase-js";

// Server-only client: uses the Service Role Key, which has full read/write access.
// Never expose the Service Role Key in browser-side code.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable. Check your .env.local or Vercel project settings."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
