// Popular destinations database
const DESTINATIONS_DB = {
  'rhodos': { name: 'Rhodes, Greece', lat: 36.28, lng: 28.15, country: 'Greece' },
  'rhodes': { name: 'Rhodes, Greece', lat: 36.28, lng: 28.15, country: 'Greece' },
  'rodos': { name: 'Rhodes, Greece', lat: 36.28, lng: 28.15, country: 'Greece' },
  'bali': { name: 'Bali, Indonesia', lat: -8.65, lng: 115.21, country: 'Indonesia' },
  'barcelona': { name: 'Barcelona, Spain', lat: 41.39, lng: 2.17, country: 'Spain' },
  'amsterdam': { name: 'Amsterdam, Netherlands', lat: 52.37, lng: 4.89, country: 'Netherlands' },
  'paris': { name: 'Paris, France', lat: 48.86, lng: 2.35, country: 'France' },
  'london': { name: 'London, United Kingdom', lat: 51.51, lng: -0.13, country: 'United Kingdom' },
  'berlin': { name: 'Berlin, Germany', lat: 52.52, lng: 13.40, country: 'Germany' },
  'rome': { name: 'Rome, Italy', lat: 41.90, lng: 12.50, country: 'Italy' },
  'venice': { name: 'Venice, Italy', lat: 45.44, lng: 12.34, country: 'Italy' },
  'florence': { name: 'Florence, Italy', lat: 43.77, lng: 11.26, country: 'Italy' },
  'milan': { name: 'Milan, Italy', lat: 45.46, lng: 9.19, country: 'Italy' },
  'lisbon': { name: 'Lisbon, Portugal', lat: 38.72, lng: -9.14, country: 'Portugal' },
  'madrid': { name: 'Madrid, Spain', lat: 40.42, lng: -3.70, country: 'Spain' },
  'bangkok': { name: 'Bangkok, Thailand', lat: 13.73, lng: 100.49, country: 'Thailand' },
  'tokyo': { name: 'Tokyo, Japan', lat: 35.68, lng: 139.69, country: 'Japan' },
  'sydney': { name: 'Sydney, Australia', lat: -33.87, lng: 151.21, country: 'Australia' },
  'dubai': { name: 'Dubai, UAE', lat: 25.20, lng: 55.27, country: 'United Arab Emirates' },
  'singapore': { name: 'Singapore', lat: 1.35, lng: 103.82, country: 'Singapore' },
  'new york': { name: 'New York, USA', lat: 40.71, lng: -74.01, country: 'United States' },
  'los angeles': { name: 'Los Angeles, USA', lat: 34.05, lng: -118.24, country: 'United States' },
  'miami': { name: 'Miami, USA', lat: 25.76, lng: -80.19, country: 'United States' },
  'cancun': { name: 'Cancun, Mexico', lat: 21.16, lng: -87.13, country: 'Mexico' },
  'playa del carmen': { name: 'Playa del Carmen, Mexico', lat: 20.63, lng: -87.07, country: 'Mexico' },
  'buenos aires': { name: 'Buenos Aires, Argentina', lat: -34.60, lng: -58.38, country: 'Argentina' },
};

// Rhodes area database (existing, kept for backwards compatibility)
const RHODOS_AREAS = {
  'anthony quinn bay': { lat: 36.2867, lng: 28.1117 },
  'anthony quinn': { lat: 36.2867, lng: 28.1117 },
  'vagies bay': { lat: 36.2867, lng: 28.1117 },
  'lindos': { lat: 36.0908, lng: 28.0961 },
  'rhodos-stad': { lat: 36.4412, lng: 28.2247 },
  'rhodos stad': { lat: 36.4412, lng: 28.2247 },
  'rodos stad': { lat: 36.4412, lng: 28.2247 },
  'rhodes town': { lat: 36.4412, lng: 28.2247 },
  'old town': { lat: 36.4449, lng: 28.2275 },
  'oude stad': { lat: 36.4449, lng: 28.2275 },
  'faliraki': { lat: 36.3333, lng: 28.2167 },
  'ixia': { lat: 36.3917, lng: 28.2083 },
  'ixia beach': { lat: 36.3917, lng: 28.2083 },
  'pefkos': { lat: 36.1594, lng: 28.1239 },
  'pefki': { lat: 36.1594, lng: 28.1239 },
  'kiotari': { lat: 36.1706, lng: 28.0814 },
  'kolymbia': { lat: 36.2333, lng: 28.1833 },
  'tsambika': { lat: 36.2389, lng: 28.1797 },
  'tsambika beach': { lat: 36.2389, lng: 28.1797 },
  'afantou': { lat: 36.2256, lng: 28.1672 },
  'kalithea': { lat: 36.3583, lng: 28.2333 },
  'kalithea springs': { lat: 36.3583, lng: 28.2333 },
  'monte smith': { lat: 36.4279, lng: 28.2079 },
  'filerimos': { lat: 36.3917, lng: 28.1542 },
  'archangelos': { lat: 36.2167, lng: 28.1333 },
  'embonas': { lat: 36.2333, lng: 27.9167 },
  'prasonisi': { lat: 35.8883, lng: 27.7794 },
  'stegna beach': { lat: 36.2053, lng: 28.1569 },
  'haraki': { lat: 36.1706, lng: 28.0814 },
  'vlicha bay': { lat: 36.0850, lng: 28.1050 },
  'lindos beach': { lat: 36.0886, lng: 28.0944 },
  'petaloudes': { lat: 36.3583, lng: 28.0500 },
  'butterfly valley': { lat: 36.3583, lng: 28.0500 },
  'mandraki': { lat: 36.4486, lng: 28.2280 },
};

export const destinationService = {
  getDestinationFromDB(searchTerm) {
    const term = (searchTerm || '').toLowerCase().trim();
    return DESTINATIONS_DB[term] || null;
  },

  searchDestinations(query) {
    if (!query || query.length < 2) return [];

    const term = query.toLowerCase();
    return Object.values(DESTINATIONS_DB).filter(d =>
      d.name.toLowerCase().includes(term) || d.country.toLowerCase().includes(term)
    ).slice(0, 10); // Return top 10
  },

  async geocodeWithNominatim(area) {
    try {
      const q = encodeURIComponent(area);
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`,
        { headers: { 'Accept-Language': 'nl', 'User-Agent': 'TriplyApp/1.0' } }
      );
      const data = await r.json();
      if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch(e) {
      console.warn('Nominatim geocoding failed:', e);
    }
    return null;
  },

  geocodeFallback(area) {
    const key = (area || '').toLowerCase().trim();
    for (const [k, v] of Object.entries(RHODOS_AREAS)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    return null;
  },

  async geocode(area, destination = 'Rhodes, Greece') {
    // Try exact match in destination DB first
    const destMatch = this.getDestinationFromDB(area);
    if (destMatch) return { lat: destMatch.lat, lng: destMatch.lng };

    // Try fallback for Rhodes areas
    const fbMatch = this.geocodeFallback(area);
    if (fbMatch) return fbMatch;

    // Try Nominatim
    const nomMatch = await this.geocodeWithNominatim(`${area}, ${destination}`);
    if (nomMatch) return nomMatch;

    // Default: center of destination + small random offset
    const dest = this.getDestinationFromDB(destination) || { lat: 51.5, lng: 0 };
    return {
      lat: dest.lat + (Math.random() - 0.5) * 0.1,
      lng: dest.lng + (Math.random() - 0.5) * 0.1
    };
  }
};
