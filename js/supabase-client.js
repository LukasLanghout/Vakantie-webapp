// Supabase client initialization
// Usage: import { supabase } from './supabase-client.js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || localStorage.getItem('sb_url') || '';
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sb_key') || '';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch(e) {
    console.error('Error getting user:', e);
    return null;
  }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event);
  });
}
