import CreateProjectDialog from "@/components/project/create-project";
import ProjectCard from "@/components/project/project-card";
import prisma from "@/lib/prisma";

export default async function TestRedisPage() {
  const projects = await prisma.project.findMany({
    include:{
      urls: true
    }
  });
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <span className="">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects here</p>
        </span>
        <CreateProjectDialog/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            projectId={project.id}
            projectName={project.name}
            lastUpdated={project.updatedAt.toISOString()}
            status={project.status}
            urlCount={project.urls.length}
            indexedCount={project.urls.filter(url => url.isIndexed).length}
          />
        ))}
      </div>
    </>
  );
}