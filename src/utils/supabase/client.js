import { createBrowserClient } from "@supabase/ssr";

let client = null;

export default function createClient() {
  if (client) return client;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local",
    );
  }

  client = createBrowserClient(url, key);
  return client;
}
