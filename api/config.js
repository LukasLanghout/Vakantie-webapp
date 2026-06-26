export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_ANON_KEY || '',
    groqApiKey: process.env.GROQ_API_KEY || '',
    googlePlacesKey: process.env.GOOGLE_PLACES_API_KEY || '',
  });
}
