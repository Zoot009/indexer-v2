"use client";

import { getProjectDetails, ProjectDetails } from '@/actions/get-project-details'
import { ImportTab } from '@/components/project/import-section';
import { Button } from '@/components/ui/button'
import { ProjectStatus } from '@/lib/generated/prisma';
import { Download, Import, ImportIcon, Play } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProjectPage = () => {
  const [projectDetails, setProjectDetails] =  useState<ProjectDetails | null>(null);
  const params = useParams<{id: string}>();
  
  const fetchProjectDetails = async() => {
    if (params.id) {
      const details = await getProjectDetails(params.id);
      console.log("Project Name:", details?.name);
      setProjectDetails(details || null);
    }
  }

  useEffect(()=>{
    console.log("Fetching project name for ID:", params.id);
    fetchProjectDetails();
  },[params.id])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{projectDetails?.name ? projectDetails.name : "Loading..."}</h1>
          <p className="text-muted-foreground text-sm">Manage your project URLs and imports</p>  
        </div>  
        <div className="flex gap-2">
          <Button  
            disabled={projectDetails?.status !== ProjectStatus.IDLE}          
          ><Play/> Start Checking</Button>
        </div>
      </div>
      <div className="">
        <ImportTab
          projectId={params.id!}
        />
      </div>
    </div>
  )
}

export default ProjectPage