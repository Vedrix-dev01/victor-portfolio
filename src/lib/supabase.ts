import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service-role key, so this module must never be
// imported into client components.
export function getSupabaseAdmin() {
  // Accept both naming styles: the ones in .env.example and the ones the
  // Supabase dashboard and Vercel integration use (SUPABASE_URL, SUPABASE_SECRET_KEY).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SECRET_KEY (or NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type Submission = {
  id: string;
  name: string;
  email: string;
  project: string | null;
  stack: string | null;
  message: string;
  created_at: string;
};
