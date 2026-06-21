export const maxDuration = 60;

const TIKWM_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
  'Referer': 'https://www.tiktok.com/',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ ok: false, error: 'Missing url' });

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return res.status(500).json({ ok: false, error: 'GROQ_API_KEY not configured' });

  try {
    // Step 1: Get TikTok video info
    const tikwmRes = await fetch(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
      { headers: TIKWM_HEADERS }
    );
    const tikwmData = await tikwmRes.json();
    const video = tikwmData?.data;

    if (!video?.play) {
      return res.json({ ok: false, error: 'Kon video URL niet ophalen' });
    }

    const metadata = {
      title: video.title || '',
      author: video.author?.nickname || '',
    };

    // Step 2: Download video (max 25MB for Groq Whisper)
    const videoRes = await fetch(video.play, {
      headers: TIKWM_HEADERS,
      signal: AbortSignal.timeout(30000),
    });

    if (!videoRes.ok) {
      return res.json({ ok: false, error: 'Kon video niet downloaden', metadata });
    }

    const contentLength = parseInt(videoRes.headers.get('content-length') || '0');
    if (contentLength > 24 * 1024 * 1024) {
      return res.json({ ok: false, error: 'Video te groot voor transcriptie', metadata });
    }

    const videoBuffer = await videoRes.arrayBuffer();

    // Step 3: Transcribe with Groq Whisper
    const form = new FormData();
    form.append('file', new Blob([videoBuffer], { type: 'video/mp4' }), 'video.mp4');
    form.append('model', 'whisper-large-v3-turbo');
    form.append('response_format', 'text');

    const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}` },
      body: form,
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.json().catch(() => ({}));
      return res.json({ ok: false, error: err.error?.message || 'Whisper fout', metadata });
    }

    const transcript = await whisperRes.text();
    return res.json({ ok: true, transcript: transcript.trim(), metadata });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
