// CommonJS on Node 24 (Vercel) — usa fetch global
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
  return res.json();
}

module.exports = async function (req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    }

    // increment key
    await upstashCommand([['INCR', KEY]]);
    const result = await upstashCommand([['GET', KEY]]);
    const value = result?.result?.[0] ?? 0;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, value: Number(value) }));
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};
