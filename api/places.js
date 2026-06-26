export const maxDuration = 30;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query, location, tripId } = req.query;
  if (!query) return res.status(400).json({ ok: false, error: 'Missing query' });

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // Check Supabase cache first if tripId provided
    if (tripId && sbUrl && sbKey) {
      const cacheRes = await fetch(
        `${sbUrl}/rest/v1/triply_places?trip_id=eq.${tripId}&name=ilike.*${encodeURIComponent(query)}*&limit=10`,
        { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
      );
      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        if (cached && cached.length > 0) {
          return res.json({ ok: true, results: formatPlaces(cached), cached: true });
        }
      }
    }

    // Get bounding box for location
    const bbox = location ? await getLocationBbox(location) : null;
    const kinds = 'interesting_places,museums,historic,cafe,restaurant,bar,hotel';
    const apiUrl = `https://api.opentripmap.com/0.1/en/places/bbox?lon_min=${bbox?.lon_min ?? -180}&lon_max=${bbox?.lon_max ?? 180}&lat_min=${bbox?.lat_min ?? -90}&lat_max=${bbox?.lat_max ?? 90}&kinds=${kinds}&limit=50&format=json`;

    const placesRes = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
    if (!placesRes.ok) return res.json({ ok: true, results: [] });

    const placesData = await placesRes.json();
    const features = Array.isArray(placesData) ? placesData : (placesData.features || []);

    if (features.length === 0) return res.json({ ok: true, results: [] });

    // Filter by query text
    const queryLower = query.toLowerCase();
    const matched = features
      .filter(f => (f.properties?.name || f.name || '').toLowerCase().includes(queryLower))
      .slice(0, 10);

    if (matched.length === 0) return res.json({ ok: true, results: [] });

    // Fetch full details for each matched place
    const results = [];
    for (const feature of matched) {
      const xid = feature.properties?.xid || feature.xid;
      if (!xid) continue;
      try {
        const detailRes = await fetch(
          `https://api.opentripmap.com/0.1/en/places/xid/${xid}?format=json`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!detailRes.ok) throw new Error('detail failed');
        const d = await detailRes.json();

        const place = {
          name: d.name || feature.properties?.name || '',
          category: (d.kinds || '').split(',')[0] || 'Plaats',
          address: formatAddress(d.address),
          lat: d.point?.lat || d.lat || feature.geometry?.coordinates?.[1] || 0,
          lng: d.point?.lon || d.lon || feature.geometry?.coordinates?.[0] || 0,
          rating: d.rate ? parseFloat(d.rate) : null,
          review_count: 0,
          description: d.wikipedia_extracts?.text || d.info?.descr || '',
          opening_hours: '',
          website: d.url || d.otm || '',
          phone: '',
          image_url: d.preview?.source || null,
          external_id: xid,
        };
        results.push(place);

        // Cache to Supabase if tripId provided
        if (tripId && sbUrl && sbKey) {
          fetch(`${sbUrl}/rest/v1/triply_places`, {
            method: 'POST',
            headers: {
              apikey: sbKey,
              Authorization: `Bearer ${sbKey}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates',
            },
            body: JSON.stringify([{
              trip_id: tripId,
              ...place,
              source: 'opentripmap',
            }]),
          }).catch(() => {});
        }
      } catch (_) {
        // Fall back to basic info from search result
        const props = feature.properties || feature;
        results.push({
          name: props.name || '',
          category: (props.kinds || '').split(',')[0] || 'Plaats',
          address: '',
          lat: feature.geometry?.coordinates?.[1] || 0,
          lng: feature.geometry?.coordinates?.[0] || 0,
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

function formatAddress(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [addr.road, addr.city || addr.town || addr.village, addr.country]
    .filter(Boolean).join(', ');
}

async function getLocationBbox(location) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'nl', 'User-Agent': 'Triply/1.0' } }
    );
    const data = await r.json();
    if (data[0]?.boundingbox) {
      const [lat_min, lat_max, lon_min, lon_max] = data[0].boundingbox.map(parseFloat);
      return { lat_min, lat_max, lon_min, lon_max };
    }
  } catch (_) {}
  return null;
}

function formatPlaces(rows) {
  return rows.map(p => ({
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
