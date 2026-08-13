export default async function handler(req, res) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return res.status(500).json({ error: 'REDIS_URL not configured' });

  let restBase, token;
  try {
    const u = new URL(redisUrl);
    restBase = `https://${u.hostname}`;
    token = u.password;
  } catch(e) {
    return res.status(500).json({ error: 'Cannot parse REDIS_URL' });
  }

  const KEY = 'flex_census';

  async function redisCmd(cmd) {
    const r = await fetch(`${restBase}/${cmd}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return r.json();
  }

  if (req.method === 'GET') {
    const result = await redisCmd(`GET/${KEY}`);
    if (!result.result) return res.status(200).json({ data: null });
    try { return res.status(200).json({ data: JSON.parse(decodeURIComponent(result.result)) }); }
    catch(e) { return res.status(200).json({ data: null }); }
  }

  if (req.method === 'POST') {
    const encoded = encodeURIComponent(JSON.stringify(req.body));
    await redisCmd(`SET/${KEY}/${encoded}`);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
