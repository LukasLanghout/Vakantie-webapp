import { getSupabase } from './supabase-client.js';

export const activitiesService = {
  async createActivity(tripId, activityData) {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const { data, error } = await sb
      .from('triply_activities')
      .insert([{
        trip_id: tripId,
        added_by: session.user.id,
        name: activityData.name,
        category: activityData.category || activityData.cat,
        area: activityData.area,
        price_label: activityData.price_label || activityData.priceLabel,
        price_value: activityData.price_value || activityData.priceVal || 0,
        is_free: activityData.is_free ?? activityData.free,
        needs_reservation: activityData.needs_reservation ?? activityData.reserve,
        opening_hours: activityData.opening_hours || activityData.hours,
        duration: activityData.duration || activityData.dur,
        travel_time: activityData.travel_time || activityData.travel,
        description: activityData.description || activityData.blurb,
        lat: activityData.lat,
        lng: activityData.lng,
        tiktok_url: activityData.tiktok_url || activityData.url,
        tiktok_creator: activityData.tiktok_creator || activityData.tk,
        day_number: activityData.day_number ?? activityData.day ?? null,
        scheduled_time: activityData.scheduled_time || activityData.time || '10:00',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getActivitiesByTrip(tripId, filters = {}) {
    const sb = await getSupabase();
    let query = sb
      .from('triply_activities')
      .select('*')
      .eq('trip_id', tripId);

    if (filters.day !== undefined && filters.day !== null) {
      query = query.eq('day_number', filters.day);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateActivity(activityId, updates) {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from('triply_activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteActivity(activityId) {
    const sb = await getSupabase();
    const { error } = await sb
      .from('triply_activities')
      .delete()
      .eq('id', activityId);
    if (error) throw error;
  },

  async addToWishlist(activityId, userId) {
    const sb = await getSupabase();
    const { error } = await sb
      .from('triply_activity_wishlist')
      .insert([{ activity_id: activityId, user_id: userId }]);
    if (error && error.code !== '23505') throw error;
  },

  async removeFromWishlist(activityId, userId) {
    const sb = await getSupabase();
    const { error } = await sb
      .from('triply_activity_wishlist')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', userId);
    if (error) throw error;
  }
};
