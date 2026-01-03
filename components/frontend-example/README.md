# Real-time Dashboard Implementation Guide

## Overview

This implementation uses **SSE (Server-Sent Events) + Redis Pub/Sub** for real-time updates.

### Architecture Flow:
```
Worker Process URL → Update Stats → Redis Pub/Sub → SSE Endpoint → Next.js Frontend
```

## Backend Setup

### 1. Start the SSE API Server

```bash
# Add to package.json scripts
"api:dev": "tsx watch api/stats-sse.ts",
"api:start": "tsx api/stats-sse.ts"
```

```bash
# Run the API server
npm run api:dev
```

### 2. Environment Variables

Add to your `.env`:
```env
REDIS_URL=redis://localhost:6379
API_PORT=3001
```

### 3. How It Works

#### When a URL is processed:
1. Worker updates database via [processor.ts](workers/processor.ts)
2. Calls `incrementStats()` to update in-memory cache
3. Publishes event via Redis Pub/Sub
4. SSE endpoint receives event and pushes to all connected clients

#### Frontend receives:
```json
{
  "totalProcessed": 1523,
  "indexedCount": 1234,
  "notIndexedCount": 245,
  "errorCount": 44,
  "timestamp": 1704283200000
}
```

## Frontend Setup (Next.js)

### 1. Copy files to your Next.js app:

```
frontend-example/
  ├── useRealtimeStats.ts      → app/hooks/useRealtimeStats.ts
  ├── RealtimeDashboard.tsx    → app/components/RealtimeDashboard.tsx
  └── dashboard-page-example.tsx → app/dashboard/page.tsx
```

### 2. Environment Variable

Add to your Next.js `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Install Tailwind CSS (if not already installed)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Usage

```tsx
import RealtimeDashboard from '@/components/RealtimeDashboard'

export default function Page() {
  return <RealtimeDashboard />
}

// Or for a specific project:
export default function ProjectPage({ params }) {
  return <RealtimeDashboard projectId={params.projectId} />
}
```

## Why SSE over WebSockets or Polling?

### ✅ SSE (Server-Sent Events) - RECOMMENDED
- **One-way data flow** (server → client) - perfect for dashboards
- **Auto-reconnection** built into the browser
- **Simple implementation** - works over HTTP/HTTPS
- **Lower overhead** than WebSockets
- **No need for special libraries** - native browser API
- **Works with existing infrastructure** (no extra ports/protocols)

### WebSockets
- ❌ Overkill for one-way data
- ❌ More complex setup (requires ws:// protocol)
- ❌ More server resources (stateful connections)
- ✅ Better for bi-directional communication (chat, games)

### Polling + Redis
- ❌ Higher latency (1-5 second delay)
- ❌ More database/API load
- ❌ Wastes bandwidth with empty responses
- ✅ Simple to implement
- ✅ Works with any infrastructure

## Testing

### 1. Start your services:

```bash
# Terminal 1: Worker
npm run worker:dev

# Terminal 2: SSE API
npm run api:dev

# Terminal 3: Next.js Frontend
cd your-nextjs-app
npm run dev
```

### 2. Test the SSE endpoint directly:

```bash
curl -N http://localhost:3001/api/stats/stream
```

You should see:
```
data: {"totalProcessed":0,"indexedCount":0,"notIndexedCount":0,"errorCount":0}

:heartbeat

data: {"totalProcessed":1,"indexedCount":1,"notIndexedCount":0,"errorCount":0,"timestamp":1704283200000}
```

### 3. Monitor events:

Watch your worker logs for:
```
[Stats] Cache initialized: { totalProcessed: 1523, indexedCount: 1234, ... }
```

## Production Considerations

### 1. CORS Configuration

Update [stats-sse.ts](api/stats-sse.ts):

```typescript
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com')
// Or for multiple origins:
const allowedOrigins = ['https://yourdomain.com', 'https://app.yourdomain.com']
const origin = req.headers.origin
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
}
```

### 2. Authentication

Add auth middleware:

```typescript
app.get('/api/stats/stream', authenticateUser, (req, res) => {
  // Verify user has access to projectId
  if (projectId && !userCanAccessProject(req.user, projectId)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  // ... rest of code
})
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/stats', limiter)
```

### 4. SSL/HTTPS

SSE works seamlessly over HTTPS. Just ensure your Next.js app connects to `https://` URL.

### 5. Scaling

For horizontal scaling with multiple API servers:
- All servers listen to same Redis Pub/Sub
- Each connected client maintains connection to one server
- Redis broadcasts to all servers
- Load balancer distributes connections

## Alternative: Next.js API Route (if you prefer)

You can also create the SSE endpoint in Next.js:

```typescript
// app/api/stats/stream/route.ts
import { subscribeToEvents, EVENTS } from '@/lib/events'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(getStats(projectId))}\n\n`))

      const unsubscribe = subscribeToEvents((channel, message) => {
        if (channel === EVENTS.STATS_UPDATE) {
          const data = JSON.parse(message)
          if (!projectId || data.projectId === projectId) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }
        }
      })

      request.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

## Monitoring

Add monitoring to track:
- Number of active SSE connections
- Events published per second
- Redis Pub/Sub performance

```typescript
let activeConnections = 0

app.get('/api/stats/stream', (req, res) => {
  activeConnections++
  console.log(`Active SSE connections: ${activeConnections}`)

  req.on('close', () => {
    activeConnections--
    console.log(`Active SSE connections: ${activeConnections}`)
  })
  // ... rest of code
})
```

## Troubleshooting

### SSE not connecting:
- Check CORS headers
- Verify API server is running on correct port
- Check browser DevTools → Network tab → EventStream

### Stats not updating:
- Verify worker is calling `incrementStats()`
- Check Redis Pub/Sub: `redis-cli SUBSCRIBE stats:update`
- Check worker logs for event publishing

### High memory usage:
- Limit max SSE connections per IP
- Set connection timeouts
- Monitor Redis memory usage

## Summary

You now have a fully functional real-time dashboard! The system:
1. ✅ Updates instantly when URLs are processed
2. ✅ Scales well (Redis Pub/Sub handles distribution)
3. ✅ Auto-reconnects on disconnect
4. ✅ Works with your existing Redis infrastructure
5. ✅ Simple to understand and maintain
