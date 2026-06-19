import { supabase } from './supabase-client.js';

export const activitiesService = {
  async createActivity(tripId, activityData) {
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activities')
      .insert([{
        trip_id: tripId,
        added_by: user.id,
        name: activityData.name,
        category: activityData.cat,
        area: activityData.area,
        price_label: activityData.priceLabel,
        price_value: activityData.priceVal || 0,
        is_free: activityData.free,
        needs_reservation: activityData.reserve,
        opening_hours: activityData.hours,
        duration: activityData.dur,
        travel_time: activityData.travel,
        description: activityData.blurb,
        lat: activityData.lat,
        lng: activityData.lng,
        tiktok_url: activityData.url,
        tiktok_creator: activityData.tk,
        day_number: activityData.day || null,
        scheduled_time: activityData.time || '10:00',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getActivitiesByTrip(tripId, filters = {}) {
    let query = supabase
      .from('activities')
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

  async getActivityById(activityId) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateActivity(activityId, updates) {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteActivity(activityId) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (error) throw error;
  },

  async addToWishlist(activityId, userId) {
    const { error } = await supabase
      .from('activity_wishlist')
      .insert([{ activity_id: activityId, user_id: userId }]);

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = duplicate key
  },

  async removeFromWishlist(activityId, userId) {
    const { error } = await supabase
      .from('activity_wishlist')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getWishlistByUser(userId) {
    const { data, error } = await supabase
      .from('activity_wishlist')
      .select('activity_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(w => w.activity_id);
  }
};
