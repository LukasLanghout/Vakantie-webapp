import { getSupabase } from './supabase-client.js';

export const tripsService = {
  async createTrip(name, destination, startDate, endDate, hotelName, hotelLat, hotelLng) {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const { data, error } = await sb
      .from('triply_trips')
      .insert([{
        owner_id: session.user.id,
        name,
        destination,
        start_date: startDate,
        end_date: endDate,
        hotel_name: hotelName,
        hotel_lat: hotelLat || 0,
        hotel_lng: hotelLng || 0,
        location_lat: hotelLat || 0,
        location_lng: hotelLng || 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserTrips() {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const { data, error } = await sb
      .from('triply_trips')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTripById(tripId) {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from('triply_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTrip(tripId, updates) {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from('triply_trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTrip(tripId) {
    const sb = await getSupabase();
    const { error } = await sb
      .from('triply_trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
  },

  getDaysArray(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    const current = new Date(start);
    let n = 1;

    while (current <= end) {
      const day = current.getDate();
      const month = current.toLocaleString('nl-NL', { month: 'short' });
      const weekday = current.toLocaleString('nl-NL', { weekday: 'long' });

      days.push({
        n,
        date: `${day} ${month}`,
        label: `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`,
      });

      current.setDate(current.getDate() + 1);
      n++;
    }

    return days;
  }
};
