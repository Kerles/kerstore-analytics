// CommonJS on Node 24 (Vercel)
const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'kerstore_hits_total';

async function upstashCommand(commands) {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ commands })
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

module.exports = async function (req, res) {
  const ALLOWED_ORIGIN = 'https://kerles.github.io/KerStore/';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET');
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    }

    const { ok, status, data } = await upstashCommand([['GET', KEY]]);
    if (!ok) {
      console.error('Upstash error', status, data);
      res.statusCode = status || 502;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'Upstash request failed', details: data }));
    }

    const value = Number(data?.result?.[0] ?? 0);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, value }));
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};
