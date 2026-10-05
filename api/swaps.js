// api/swaps.js
// Swap-tool storage for HospitalistOps (shared via Upstash Redis).
// Mirrors api/census.js and api/requests.js — same UPSTASH_REDIS_REST_* env vars.
// Keys stored:
//   swap_schedule  -> { shifts:[{d,p,s,site}], uploadedAt, uploadedBy, shiftCount, dateRange }
//   swap_status    -> { CODE: {tier, primary, secondary}, ... }  (provider status overrides)
//   swap_needs     -> { needId: {...} }  (posted coverage needs — used in part two)

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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

  // which bucket: ?key=schedule | status | needs
  // Read the query param defensively (req.query on Vercel, else parse req.url) —
  // avoid `new URL()` which can throw on some runtime req.url shapes.
  let which = 'schedule';
  try {
    if (req.query && req.query.key) {
      which = String(req.query.key).toLowerCase();
    } else if (req.url && req.url.indexOf('key=') !== -1) {
      const m = req.url.match(/[?&]key=([^&]+)/);
      if (m) which = decodeURIComponent(m[1]).toLowerCase();
    }
  } catch (e) { which = 'schedule'; }
  const KEY = which === 'status' ? 'swap_status'
            : which === 'needs'  ? 'swap_needs'
            : 'swap_schedule';

  try {
    if (req.method === 'GET') {
      const out = await redis(['GET', KEY]);
      const data = out && out.result ? JSON.parse(out.result) : null;
      res.status(200).json({ data });
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      body = body || {};

      // schedule + status: whole-object replace (body.data = the object to store)
      if (which === 'schedule' || which === 'status') {
        if (body.data === undefined) { res.status(400).json({ error: 'expected {data}' }); return; }
        await redis(['SET', KEY, JSON.stringify(body.data)]);
        res.status(200).json({ ok: true });
        return;
      }

      // needs: per-item merge/delete (used in part two)
      const cur = await redis(['GET', KEY]);
      let data = cur && cur.result ? JSON.parse(cur.result) : {};
      if (body.all && typeof body.all === 'object') data = body.all;
      else if (body.id && body.delete) delete data[body.id];
      else if (body.id && body.item) data[body.id] = body.item;
      else { res.status(400).json({ error: 'bad needs request' }); return; }
      await redis(['SET', KEY, JSON.stringify(data)]);
      res.status(200).json({ ok: true, data });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
