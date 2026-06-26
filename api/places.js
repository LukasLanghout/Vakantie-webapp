export const maxDuration = 30;

const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query, location, tripId } = req.query;
  if (!query) return res.status(400).json({ ok: false, error: 'Missing query' });

  try {
    // Check cache first if tripId provided
    let cachedResults = [];
    if (tripId) {
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data } = await sb
        .from('triply_places')
        .select('*')
        .eq('trip_id', tripId)
        .ilike('name', `%${query}%`)
        .limit(10);

      if (data && data.length > 0) {
        return res.json({ ok: true, results: formatPlaces(data), cached: true });
      }
    }

    // OpenTripMap free API - no key needed!
    const bbox = location ? await getLocationBbox(location) : null;
    const limit = 10;
    const kinds = 'interesting_places,museums,historic,cafe,restaurant,bar,hotel';

    let url = `https://api.opentripmap.com/0.1/en/places/bbox?lon_min=${bbox?.lon_min || -180}&lon_max=${bbox?.lon_max || 180}&lat_min=${bbox?.lat_min || -90}&lat_max=${bbox?.lat_max || 90}&kinds=${kinds}&limit=${limit}`;

    const placesRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const placesData = await placesRes.json();

    if (!placesData.features || placesData.features.length === 0) {
      return res.json({ ok: true, results: [] });
    }

    // Get full details for each place
    const results = [];
    for (const feature of placesData.features.slice(0, 10)) {
      const xid = feature.properties.xid;
      try {
        const detailRes = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${xid}`, {
          signal: AbortSignal.timeout(5000)
        });
        const detail = await detailRes.json();

        results.push({
          name: detail.name || '',
          category: (detail.kinds || '').split(',')[0] || 'Plaats',
          address: detail.address || '',
          lat: detail.lat || 0,
          lng: detail.lon || 0,
          rating: detail.rate ? parseFloat(detail.rate) : null,
          review_count: detail.review_count || 0,
          description: detail.wikipedia_extracts?.text || detail.description || '',
          opening_hours: detail.openinghours || '',
          website: detail.url || '',
          phone: detail.phone || '',
          image_url: detail.preview?.source || null,
          external_id: xid,
        });

        // Cache in database if tripId provided
        if (tripId && process.env.SUPABASE_URL) {
          const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          await sb.from('triply_places').upsert([{
            trip_id: tripId,
            name: detail.name || '',
            category: (detail.kinds || '').split(',')[0] || 'Plaats',
            address: detail.address || '',
            lat: detail.lat || 0,
            lng: detail.lon || 0,
            rating: detail.rate ? parseFloat(detail.rate) : null,
            review_count: detail.review_count || 0,
            description: detail.wikipedia_extracts?.text || detail.description || '',
            opening_hours: detail.openinghours || '',
            website: detail.url || '',
            phone: detail.phone || '',
            image_url: detail.preview?.source || null,
            external_id: xid,
            source: 'opentripmap',
          }], { onConflict: 'trip_id,external_id,source' }).catch(() => {});
        }
      } catch (_) {
        // If detail fails, use basic info
        results.push({
          name: feature.properties.name || '',
          category: 'Plaats',
          address: '',
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          rating: null,
          review_count: 0,
          description: '',
          opening_hours: '',
          website: '',
          phone: '',
          image_url: null,
          external_id: xid,
        });
      }
    }

    return res.json({ ok: true, results, cached: false });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

async function getLocationBbox(location) {
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'nl', 'User-Agent': 'Triply/1.0' } }
    );
    const geoData = await geoRes.json();
    if (geoData[0]) {
      const bbox = geoData[0].boundingbox;
      return {
        lat_min: parseFloat(bbox[0]),
        lat_max: parseFloat(bbox[1]),
        lon_min: parseFloat(bbox[2]),
        lon_max: parseFloat(bbox[3]),
      };
    }
  } catch (_) {}
  return null;
}

function formatPlaces(dbPlaces) {
  return dbPlaces.map(p => ({
    name: p.name,
    category: p.category,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    rating: p.rating,
    review_count: p.review_count,
    description: p.description,
    opening_hours: p.opening_hours,
    website: p.website,
    phone: p.phone,
    image_url: p.image_url,
    external_id: p.external_id,
  }));
}
