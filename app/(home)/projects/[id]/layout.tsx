import { getProjectDetails } from '@/actions/get-project-details';
import { ReactNode } from 'react'

export default async function ProjectLayout({
  children, params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // Fetch project data
  const project = await getProjectDetails(id);
  
  return (
    <div>
      <h1 className="text-3xl font-extrabold">{project?.name ? project.name : "Loading..."}</h1>
      <p className="text-muted-foreground text-sm">Manage your project URLs and imports</p>  
      <div className="mt-6">
        {children}
      </div>
    </div>  
  )
}