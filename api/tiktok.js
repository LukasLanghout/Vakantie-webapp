export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, url, mix_id } = req.query;

  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://www.tiktok.com/',
  };

  try {
    if (type === 'collection' && mix_id) {
      // Try multiple TikWM endpoints for collections/mix
      const endpoints = [
        `https://www.tikwm.com/api/user/mix?mix_id=${mix_id}&count=35&cursor=0`,
        `https://www.tikwm.com/api/mix/item_list/?mix_id=${mix_id}&count=35&cursor=0`,
      ];

      for (const endpoint of endpoints) {
        try {
          const r = await fetch(endpoint, { headers: HEADERS });
          if (!r.ok) continue;
          const data = await r.json();
          const items =
            data?.data?.videos ||
            data?.data?.aweme_list ||
            data?.data?.itemList ||
            (Array.isArray(data?.data) ? data.data : null);
          if (items && items.length > 0) {
            return res.json({ ok: true, items });
          }
        } catch (_) { /* try next */ }
      }

      return res.json({ ok: false, error: 'Collectie niet gevonden of leeg' });

    } else if (type === 'video' && url) {
      const r = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
        { headers: HEADERS }
      );
      const data = await r.json();
      return res.json({ ok: true, data });

    } else {
      return res.status(400).json({ ok: false, error: 'Ongeldige parameters' });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
