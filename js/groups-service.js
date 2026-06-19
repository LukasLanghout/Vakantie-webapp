import { supabase } from './supabase-client.js';

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
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) throw new Error('Not authenticated');

    const shareCode = generateShareCode();

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        trip_id: tripId,
        name: groupName,
        share_code: shareCode,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    // Add creator to group members
    await supabase
      .from('group_members')
      .insert([{ group_id: data.id, user_id: user.id }]);

    return data;
  },

  async getGroupsByTrip(tripId) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getGroupById(groupId) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  },

  async joinGroupByCode(shareCode) {
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) throw new Error('Not authenticated');

    // Find group by share code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (groupError) throw new Error('Share code not found');

    // Check if already member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single();

    if (existing) throw new Error('Already member of this group');

    // Add to group
    const { error: joinError } = await supabase
      .from('group_members')
      .insert([{ group_id: group.id, user_id: user.id }]);

    if (joinError) throw joinError;

    return group;
  },

  async getGroupMembers(groupId) {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, joined_at, users(id, email, username)')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async deleteGroup(groupId) {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  },

  async updateGroup(groupId, updates) {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
