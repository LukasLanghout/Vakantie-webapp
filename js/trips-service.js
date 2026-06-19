import { supabase } from './supabase-client.js';

export const tripsService = {
  async createTrip(name, destination, startDate, endDate, hotelName, hotelLat, hotelLng) {
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('trips')
      .insert([{
        owner_id: user.id,
        name,
        destination,
        start_date: startDate,
        end_date: endDate,
        hotel_name: hotelName,
        hotel_lat: hotelLat,
        hotel_lng: hotelLng,
        location_lat: hotelLat,
        location_lng: hotelLng,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserTrips() {
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTripById(tripId) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTrip(tripId, updates) {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTrip(tripId) {
    const { error } = await supabase
      .from('trips')
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
      const date = current.toLocaleString('nl-NL', { year: 'numeric', month: '2-digit', day: '2-digit' });

      days.push({
        n,
        date: `${day} ${month}`,
        label: `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`,
        fullDate: date,
      });

      current.setDate(current.getDate() + 1);
      n++;
    }

    return days;
  }
};
