// Supabase client initialization — credentials loaded from /api/config at runtime
// Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables.

let _client = null;

export async function getSupabase() {
  if (_client) return _client;

  const r = await fetch('/api/config');
  if (!r.ok) throw new Error('Kon configuratie niet laden');
  const cfg = await r.json();

  if (!cfg.supabaseUrl || !cfg.supabaseKey) {
    throw new Error('Supabase niet geconfigureerd. Voeg SUPABASE_URL en SUPABASE_ANON_KEY toe als Vercel environment variabelen.');
  }

  _client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
  return _client;
}

export async function getCurrentUser() {
  try {
    const client = await getSupabase();
    const { data: { session } } = await client.auth.getSession();
    return session?.user || null;
  } catch(e) {
    return null;
  }
}
