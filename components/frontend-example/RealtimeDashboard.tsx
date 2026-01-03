// app/components/RealtimeDashboard.tsx
'use client'

import { useRealtimeStats } from "./useRealtimeStats"


export default function RealtimeDashboard({ projectId }: { projectId?: string }) {
  const { stats, isConnected, error } = useRealtimeStats(projectId)

  const indexedRate = stats.totalProcessed > 0 
    ? ((stats.indexedCount / stats.totalProcessed) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Real-time URL Processing Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Processed"
          value={stats.totalProcessed.toLocaleString()}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Indexed"
          value={stats.indexedCount.toLocaleString()}
          icon="✅"
          color="green"
          subtitle={`${indexedRate}% success rate`}
        />
        <StatCard
          title="Not Indexed"
          value={stats.notIndexedCount.toLocaleString()}
          icon="❌"
          color="yellow"
        />
        <StatCard
          title="Errors"
          value={stats.errorCount.toLocaleString()}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Progress Bar */}
      {stats.totalProcessed > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Breakdown</h3>
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
            <div 
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${(stats.indexedCount / stats.totalProcessed) * 100}%` }}
            />
            <div 
              className="bg-yellow-500 transition-all duration-500"
              style={{ width: `${(stats.notIndexedCount / stats.totalProcessed) * 100}%` }}
            />
            <div 
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${(stats.errorCount / stats.totalProcessed) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Indexed: {indexedRate}%</span>
            <span>Not Indexed: {((stats.notIndexedCount / stats.totalProcessed) * 100).toFixed(1)}%</span>
            <span>Errors: {((stats.errorCount / stats.totalProcessed) * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}: { 
  title: string
  value: string
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red'
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  }

  return (
    <div className={`${colorClasses[color]} rounded-lg border p-6 shadow transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
    </div>
  )
}
