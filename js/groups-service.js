import { getSupabase } from './supabase-client.js';

function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const groupsService = {
  async createGroup(tripId, groupName) {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const shareCode = generateShareCode();

    const { data, error } = await sb
      .from('triply_groups')
      .insert([{
        trip_id: tripId,
        name: groupName,
        share_code: shareCode,
        created_by: session.user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    await sb.from('triply_group_members')
      .insert([{ group_id: data.id, user_id: session.user.id }]);

    return data;
  },

  async getGroupsByTrip(tripId) {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from('triply_groups')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async joinGroupByCode(shareCode) {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const { data: group, error: groupError } = await sb
      .from('triply_groups')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (groupError) throw new Error('Share code niet gevonden');

    const { data: existing } = await sb
      .from('triply_group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existing) throw new Error('Je bent al lid van deze groep');

    const { error: joinError } = await sb
      .from('triply_group_members')
      .insert([{ group_id: group.id, user_id: session.user.id }]);

    if (joinError) throw joinError;
    return group;
  },

  async getGroupMembers(groupId) {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from('triply_group_members')
      .select('user_id, joined_at, triply_users(id, email, username)')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async deleteGroup(groupId) {
    const sb = await getSupabase();
    const { error } = await sb
      .from('triply_groups')
      .delete()
      .eq('id', groupId);
    if (error) throw error;
  }
};
