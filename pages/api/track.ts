import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export default async function handler(req, res) {
  const { pathname } = req.body

  try {

    await redis.hincrby('site_stats', pathname, 1)
    
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar estatística' })
  }
}
