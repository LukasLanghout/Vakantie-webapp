export const maxDuration = 30;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query, location } = req.query;
  if (!query) return res.status(400).json({ ok: false, error: 'Missing query' });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return res.status(500).json({ ok: false, error: 'GOOGLE_PLACES_API_KEY not configured' });

  try {
    // Text Search: find places matching query
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.append('query', query + (location ? ` ${location}` : ''));
    searchUrl.searchParams.append('key', apiKey);

    const searchRes = await fetch(searchUrl.toString(), { signal: AbortSignal.timeout(10000) });
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.json({ ok: true, results: [] });
    }

    // Get details for top 5 results
    const results = [];
    for (let i = 0; i < Math.min(5, searchData.results.length); i++) {
      const place = searchData.results[i];
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.append('place_id', place.place_id);
      detailsUrl.searchParams.append('fields', 'name,formatted_address,geometry,rating,user_ratings_total,types,photos,website,formatted_phone_number,opening_hours');
      detailsUrl.searchParams.append('key', apiKey);

      try {
        const detailsRes = await fetch(detailsUrl.toString(), { signal: AbortSignal.timeout(8000) });
        const detailsData = await detailsRes.json();
        const details = detailsData.result || {};

        results.push({
          name: details.name || place.name || '',
          address: details.formatted_address || place.formatted_address || '',
          lat: details.geometry?.location?.lat || place.geometry?.location?.lat || 0,
          lng: details.geometry?.location?.lng || place.geometry?.location?.lng || 0,
          rating: details.rating || null,
          reviews: details.user_ratings_total || 0,
          phone: details.formatted_phone_number || '',
          website: details.website || '',
          types: details.types || [],
          photoUrl: details.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${details.photos[0].photo_reference}&key=${apiKey}` : null,
        });
      } catch (_) {
        // If details fetch fails, just use search result
        results.push({
          name: place.name || '',
          address: place.formatted_address || '',
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0,
          rating: null,
          reviews: 0,
          phone: '',
          website: '',
          types: place.types || [],
          photoUrl: null,
        });
      }
    }

    return res.json({ ok: true, results });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
