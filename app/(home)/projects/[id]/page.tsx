"use client";

import { getProjectDetails, ProjectDetails } from '@/actions/get-project-details'
import { ImportTab } from '@/components/project/import-section';
import { UrlsTable } from '@/components/project/urls-table';
import { Button } from '@/components/ui/button'
import { ProjectStatus } from '@/lib/generated/prisma';
import axios from 'axios';
import { Download, Import, ImportIcon, Loader, Play } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProjectPage = () => {
  const [projectDetails, setProjectDetails] =  useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartChecking = async() => {
    if (!projectDetails) return;
    try {
      setLoading(true);
      const response = await axios.post('/api/enqueue', {
        projectId: projectDetails.id,
      });
      if (response.status === 200) {
        // Refresh project details to update status
        const updatedDetails = await getProjectDetails(projectDetails.id);
        setProjectDetails(updatedDetails || null);
      }
    } catch (error) {
      console.error("Error starting index check:", error);
    } finally {
      setLoading(false);
    }
  }

  const params = useParams<{id: string}>();
  
  const fetchProjectDetails = async() => {
    if (params.id) {
      const details = await getProjectDetails(params.id);
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
          <h1 className="text-3xl font-extrabold">{projectDetails?.name ? projectDetails.name : "Loading..."}</h1>
          <p className="text-muted-foreground text-sm">Manage your project URLs and imports</p>  
        </div>  
        <div className="flex gap-2">
          {
            projectDetails?.status === ProjectStatus.COMPLETED ? (
              <></>
            ) : (
              <Button  
                onClick={()=>handleStartChecking()}
                disabled={projectDetails?.status !== ProjectStatus.IMPORTED || loading}          
              >{loading ? <Loader className="animate-spin" /> : <Play />} Start Checking</Button>
            )
          }
        </div>
      </div>
      <div className="">
        {
          projectDetails?.status === ProjectStatus.IDLE ? (
            <ImportTab projectId={params.id!} onImportComplete={fetchProjectDetails} />
          ) : (
            <UrlsTable projectId={params.id!}/>
          )
        }
      </div>
    </div>
  )
}

export default ProjectPage