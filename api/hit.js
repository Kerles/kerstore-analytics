import fetch from 'node-fetch';

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

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    // opcional: você pode receber { path } no body e registrar por rota
    await upstashCommand([['INCR', KEY]]);
    const result = await upstashCommand([['GET', KEY]]);
    const value = result?.result?.[0] ?? null;

    return res.status(200).json({ ok: true, value: Number(value) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
