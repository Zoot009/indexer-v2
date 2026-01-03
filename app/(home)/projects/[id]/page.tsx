"use client";

import { getProjectDetails, ProjectDetails } from '@/actions/get-project-details'
import { ImportTab } from '@/components/project/import-section';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectStatus } from '@/lib/generated/prisma';
import axios from 'axios';
import { CheckCircle2, Loader2, Play, Rocket, Clock, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ProjectPage = () => {
  const [projectDetails, setProjectDetails] =  useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlCount, setUrlCount] = useState(0);
  const router = useRouter();

  const handleStartChecking = async() => {
    if (!projectDetails) return;
    try {
      setLoading(true);
      const response = await axios.post('/api/enqueue', {
        projectId: projectDetails.id,
      });
      if (response.status === 200) {
        toast.success("Project started successfully!");
        // Refresh project details to update status
        const updatedDetails = await getProjectDetails(projectDetails.id);
        setProjectDetails(updatedDetails || null);
        // Redirect to dashboard after starting
        setTimeout(() => {
          router.push(`/projects/${projectDetails.id}/dashboard`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error starting index check:", error);
      toast.error("Failed to start project");
    } finally {
      setLoading(false);
    }
  }

  const params = useParams<{id: string}>();
  
  const fetchProjectDetails = async() => {
    if (params.id) {
      const details = await getProjectDetails(params.id);
      setProjectDetails(details || null);
      // Fetch URL count
      if (details) {
        try {
          const response = await fetch(`/api/projects/${params.id}/url-count`);
          if (response.ok) {
            const data = await response.json();
            setUrlCount(data.count || 0);
          }
        } catch (error) {
          console.error("Error fetching URL count:", error);
        }
      }
    }
  }

  useEffect(()=>{
    fetchProjectDetails();
  },[params.id])

  const getStatusInfo = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IDLE:
        return { icon: Clock, label: "Not Started", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-800" };
      case ProjectStatus.IMPORTED:
        return { icon: CheckCircle2, label: "Ready to Start", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" };
      case ProjectStatus.QUEUED:
      case ProjectStatus.PROCESSING:
        return { icon: Loader2, label: "Processing", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" };
      case ProjectStatus.COMPLETED:
        return { icon: CheckCircle2, label: "Completed", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" };
      case ProjectStatus.FAILED:
        return { icon: AlertCircle, label: "Failed", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" };
      default:
        return { icon: Clock, label: status, color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-800" };
    }
  };

  const statusInfo = projectDetails ? getStatusInfo(projectDetails.status) : null;
  const StatusIcon = statusInfo?.icon;
  const canStart = projectDetails?.status === ProjectStatus.IMPORTED && !loading;
  const isProcessing = projectDetails?.status === ProjectStatus.PROCESSING || projectDetails?.status === ProjectStatus.QUEUED;

  return (
    <>    
      {projectDetails?.status === ProjectStatus.IDLE ? (
        <ImportTab projectId={params.id!} onImportComplete={fetchProjectDetails} />
      ) : (
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {StatusIcon && <StatusIcon className={`h-5 w-5 ${statusInfo?.color} ${isProcessing ? 'animate-spin' : ''}`} />}
                    Project Status
                  </CardTitle>
                  <CardDescription>
                    {projectDetails?.name || 'Loading...'}
                  </CardDescription>
                </div>
                {statusInfo && (
                  <Badge className={statusInfo.bgColor} variant="secondary">
                    <span className={statusInfo.color}>{statusInfo.label}</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* URL Count */}
                {urlCount > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div>
                      <p className="text-sm font-medium">URLs Ready to Check</p>
                      <p className="text-2xl font-bold mt-1">{urlCount.toLocaleString()}</p>
                    </div>
                    <Rocket className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Action Button */}
                {projectDetails?.status === ProjectStatus.IMPORTED && (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleStartChecking}
                      disabled={!canStart}
                      size="lg"
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Starting Project...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          Start Checking {urlCount > 0 ? `${urlCount.toLocaleString()} URLs` : 'URLs'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Click to begin indexing status checks for all imported URLs
                    </p>
                  </div>
                )}

                {/* Processing Message */}
                {isProcessing && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                    <div className="flex items-start gap-3">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Project is currently processing
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Your URLs are being checked for indexing status. You can view the progress in the dashboard.
                        </p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-blue-600 dark:text-blue-400 mt-2"
                          onClick={() => router.push(`/projects/${params.id}/dashboard`)}
                        >
                          Go to Dashboard →
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Message */}
                {projectDetails?.status === ProjectStatus.COMPLETED && (
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Project completed successfully!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          All URLs have been checked. View the results in the dashboard.
                        </p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-green-600 dark:text-green-400 mt-2"
                          onClick={() => router.push(`/projects/${params.id}/dashboard`)}
                        >
                          View Dashboard →
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default ProjectPage