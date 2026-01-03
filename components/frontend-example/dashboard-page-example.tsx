// app/dashboard/page.tsx
import RealtimeDashboard from './RealtimeDashboard'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <RealtimeDashboard />
    </main>
  )
}

// For project-specific dashboard:
// app/dashboard/[projectId]/page.tsx
// export default function ProjectDashboardPage({ params }: { params: { projectId: string } }) {
//   return (
//     <main className="min-h-screen bg-gray-50 py-8">
//       <RealtimeDashboard projectId={params.projectId} />
//     </main>
//   )
// }
