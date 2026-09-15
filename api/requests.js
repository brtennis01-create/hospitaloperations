// api/requests.js
// Vacation-request storage for HospitalistOps (shared via Upstash Redis).
// Mirrors api/census.js — uses the same UPSTASH_REDIS_REST_* env vars.
// Key stored: vacation_requests  (a JSON object keyed by provider initials)

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'vacation_requests';

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    if (req.method === 'GET') {
      const out = await redis(['GET', KEY]);
      const data = out && out.result ? JSON.parse(out.result) : {};
      res.status(200).json({ data });
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      body = body || {};

      const cur = await redis(['GET', KEY]);
      let data = cur && cur.result ? JSON.parse(cur.result) : {};

      if (body.all && typeof body.all === 'object') {
        data = body.all;
      } else if (body.provider && body.delete) {
        delete data[body.provider];
      } else if (body.provider && body.entry) {
        data[body.provider] = body.entry;
      } else {
        res.status(400).json({ error: 'Bad request: expected {provider, entry}, {provider, delete}, or {all}.' });
        return;
      }

      await redis(['SET', KEY, JSON.stringify(data)]);
      res.status(200).json({ ok: true, data });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
