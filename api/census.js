export default async function handler(req, res) {
  let restBase = process.env.UPSTASH_REDIS_REST_URL;
  let token    = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!restBase || !token) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return res.status(500).json({ error: 'No Redis credentials found' });
    try {
      const u = new URL(redisUrl);
      restBase = `https://${u.hostname}`;
      token = u.password;
    } catch(e) {
      return res.status(500).json({ error: 'Cannot parse REDIS_URL: ' + e.message });
    }
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
    return res.status(500).json({ error: e.message, restBase: restBase });
  }
}
