// hit.js
const REST_URL = (process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'kerstore_hits_total';

async function upstashCommand(cmdArray) {
  const res = await fetch(`${REST_URL}/command`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cmd: cmdArray })
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

module.exports = async function (req, res) {
  const ALLOWED_ORIGIN = 'https://kerles.github.io';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
  }
  if (!REST_URL || !REST_TOKEN) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Upstash env vars not configured' }));
  }

  try {
    const incr = await upstashCommand(['INCR', KEY]);
    if (!incr.ok) {
      res.statusCode = incr.status || 502;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'Upstash INCR failed', details: incr.data }));
    }

    // read new value
    const get = await upstashCommand(['GET', KEY]);
    if (!get.ok) {
      res.statusCode = get.status || 502;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'Upstash GET failed', details: get.data }));
    }

    const value = Number(get.data?.result) || 0;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, value }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};
