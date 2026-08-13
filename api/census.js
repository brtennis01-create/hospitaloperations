export default async function handler(req, res) {
  const restBase = process.env.UPSTASH_REDIS_REST_URL;
  const token    = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!restBase || !token) {
    return res.status(500).json({ 
      error: 'Missing credentials',
      hasUrl: !!restBase,
      hasToken: !!token
    });
  }

  const KEY = 'flex_census';

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${restBase}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      if (!d.result) return res.status(200).json({ data: null });
      return res.status(200).json({ data: JSON.parse(decodeURIComponent(d.result)) });
    }

    if (req.method === 'POST') {
      const encoded = encodeURIComponent(JSON.stringify(req.body));
      await fetch(`${restBase}/set/${KEY}/${encoded}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
