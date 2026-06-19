import { destinationService } from './destination-service.js';

const CAT_COLORS = {
  'Strand': { a: '#57c0d8', b: '#2f7fc7', emoji: '🏖️' },
  'Cultuur': { a: '#8b5cf6', b: '#6d28d9', emoji: '🏛️' },
  'Natuur': { a: '#3aa08a', b: '#059669', emoji: '🌿' },
  'Eten & drinken': { a: '#ef8f4c', b: '#dc6b19', emoji: '🍽️' },
  'Avontuur': { a: '#ef8f4c', b: '#e05c5c', emoji: '⚡' },
  'Uitzicht': { a: '#57c0d8', b: '#3aa08a', emoji: '🔭' },
  'Dagtrip': { a: '#2f7fc7', b: '#11314a', emoji: '🚗' },
};

export const tiktokAnalyzer = {
  async fetchTikTokMeta(url) {
    try {
      const r = await fetch(`/api/tiktok?type=video&url=${encodeURIComponent(url)}`);
      const json = await r.json();
      const v = json?.data?.data || json?.data;
      if (v && (v.title || v.desc)) {
        return { title: v.title || '', desc: v.desc || v.title || '', author: v.author?.unique_id || '' };
      }
    } catch(e) { }

    try {
      const oembed = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const r = await fetch(oembed);
      const data = await r.json();
      if (data && data.title) {
        return { title: data.title, desc: data.title, author: data.author_name || '' };
      }
    } catch(e) { }

    const parts = url.split('/');
    const author = parts.find(p => p.startsWith('@')) || '';
    return { title: '', desc: '', author };
  },

  async callGroq(prompt, apiKey) {
    const key = apiKey || localStorage.getItem('groq_api_key') || '';
    if (!key) throw new Error('Groq API key missing — stel in via ⚙️ Instellingen');
    apiKey = key;

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 600,
      })
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${r.status}`);
    }

    const data = await r.json();
    return data.choices[0].message.content;
  },

  parseGroqJson(text) {
    const clean = text.replace(/```json|```/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Geen JSON gevonden in AI response');
  },

  buildPrompt(url, title, desc, author, destination) {
    return `TAAK: Analyseer een TikTok over een activiteit in ${destination} en extract info.

TikTok URL: ${url}
Titel: "${title || ''}"
Beschrijving: "${(desc || '').slice(0, 300)}"
Creator: "${author || ''}"
Bestemming: ${destination}

STAP 1 - VALIDATIE:
Gaat dit over een activiteit/attractie in ${destination}?
- ALS JA → ga naar STAP 2
- ALS NEE → return {"error": true, "message": "Dit gaat niet over ${destination}"}

STAP 2 - EXTRACTION:
Wat is de activiteit? Waar in ${destination}? Prijs? Reservering nodig?
Gok gerust op basis van bekende attracties als metadata leeg is.
Vertaal naar het Nederlands.

OUTPUT - ALLEEN GELDIG JSON, NIETS ANDERS:
{"error":false,"name":"activiteitsnaam max 35 chars","cat":"Strand","area":"locatie","priceLabel":"Gratis","priceVal":0,"free":true,"reserve":false,"hours":"09:00-20:00","dur":"2 uur","travel":"30 min","blurb":"Korte 2-zins beschrijving Nederlands.","lat":0.0,"lng":0.0}

Kies cat uit: Strand, Cultuur, Natuur, Eten & drinken, Avontuur, Uitzicht, Dagtrip`;
  },

  async analyzeTikToks(urls, destination, tripId, apiKey, onProgress) {
    const results = [];
    const errors = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      if (!url) continue;

      onProgress?.(`${i + 1}/${urls.length}`, `Analyzing...`);

      try {
        // Fetch metadata
        const meta = await this.fetchTikTokMeta(url);

        // Call Groq
        const response = await this.callGroq(
          this.buildPrompt(url, meta.title, meta.desc, meta.author, destination),
          apiKey
        );
        const parsed = this.parseGroqJson(response);

        if (parsed.error) {
          errors.push({ url, reason: parsed.message || 'Unknown error' });
          onProgress?.(`${i + 1}/${urls.length}`, `Skipped: ${parsed.message}`);
          continue;
        }

        // Geocode if needed
        if (!parsed.lat || !parsed.lng || (parsed.lat === 0 && parsed.lng === 0)) {
          const geo = await destinationService.geocode(parsed.area, destination);
          parsed.lat = geo.lat;
          parsed.lng = geo.lng;
        }

        const cat = CAT_COLORS[parsed.cat] || CAT_COLORS['Strand'];
        const activity = {
          trip_id: tripId,
          name: parsed.name,
          category: parsed.cat,
          area: parsed.area,
          price_label: parsed.priceLabel,
          price_value: parsed.priceVal || 0,
          is_free: parsed.free,
          needs_reservation: parsed.reserve,
          opening_hours: parsed.hours,
          duration: parsed.dur,
          travel_time: parsed.travel,
          description: parsed.blurb,
          lat: parsed.lat,
          lng: parsed.lng,
          tiktok_url: url,
          tiktok_creator: meta.author,
          day_number: null,
          scheduled_time: '10:00',
        };

        results.push(activity);
        onProgress?.(`${i + 1}/${urls.length}`, `Added: ${parsed.name}`);
      } catch (e) {
        errors.push({ url, reason: e.message });
        onProgress?.(`${i + 1}/${urls.length}`, `Error: ${e.message}`);
      }

      // Rate limiting
      if (i < urls.length - 1) await new Promise(r => setTimeout(r, 400));
    }

    return { results, errors };
  }
};

window.tiktokAnalyzer = tiktokAnalyzer;
