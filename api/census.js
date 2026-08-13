export default async function handler(req, res) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(500).json({ error: 'Upstash credentials not configured' });
  const KEY = 'flex_census';
  async function redisCmd(command) {
    const r = await fetch(`${url}/${command}`, {
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
