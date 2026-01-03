// app/hooks/useRealtimeStats.ts
'use client'

import { useEffect, useState } from 'react'

export interface Stats {
  totalProcessed: number
  indexedCount: number
  notIndexedCount: number
  errorCount: number
  timestamp?: number
}

export function useRealtimeStats(projectId?: string) {
  const [stats, setStats] = useState<Stats>({
    totalProcessed: 0,
    indexedCount: 0,
    notIndexedCount: 0,
    errorCount: 0,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const url = projectId 
      ? `${apiUrl}/api/stats/stream?projectId=${projectId}`
      : `${apiUrl}/api/stats/stream`

    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource(url)

      eventSource.onopen = () => {
        console.log('✅ SSE Connected')
        setIsConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setStats(data)
        } catch (err) {
          console.error('Failed to parse stats:', err)
        }
      }

      eventSource.onerror = (err) => {
        console.error('❌ SSE Error:', err)
        setIsConnected(false)
        setError('Connection lost. Reconnecting...')
        
        // EventSource auto-reconnects, but we can add custom logic
        setTimeout(() => {
          if (eventSource?.readyState === EventSource.CLOSED) {
            setError('Failed to reconnect')
          }
        }, 3000)
      }
    } catch (err) {
      console.error('Failed to create EventSource:', err)
      setError('Failed to connect to server')
    }

    return () => {
      if (eventSource) {
        eventSource.close()
        setIsConnected(false)
      }
    }
  }, [projectId])

  return { stats, isConnected, error }
}
