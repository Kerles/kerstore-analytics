import { Redis } from '@upstash/redis'
import { useEffect, useState } from 'react'

export default function Estatisticas() {
  const [stats, setStats] = useState({})

  useEffect(() => {
    async function fetchStats() {
      const redis = new Redis({
        url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
        token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!
      })

      const pageStats = await redis.hgetall('site_stats')
      setStats(pageStats || {})
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1>Estatísticas do Site</h1>
      {Object.entries(stats).map(([pagina, views]) => (
        <div key={pagina}>
          {pagina}: {views} visualizações
        </div>
      ))}
    </div>
  )
}
