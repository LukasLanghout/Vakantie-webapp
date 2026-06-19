import { getSupabase } from './supabase-client.js';

export const authService = {
  async signUp(email, password, username) {
    const sb = await getSupabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) throw error;

    await sb.from('triply_users')
      .upsert([{ id: data.user.id, email, username }], { onConflict: 'id' });

    return data.user;
  },

  async signIn(email, password) {
    const sb = await getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const sb = await getSupabase();
    const { error } = await sb.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session?.user || null;
  },

  async resetPassword(email) {
    const sb = await getSupabase();
    const { error } = await sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};
