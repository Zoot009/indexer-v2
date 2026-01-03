import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlsTable } from "@/components/project/urls-table";
import { getProjectDetails } from "@/actions/get-project-details";
import prisma from "@/lib/prisma";
import { AlertCircle, CheckCircle2, Clock, CreditCard, Globe, TrendingUp, Activity, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow, formatDistance } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch project details
  const project = await getProjectDetails(id);
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Fetch additional stats
  const [totalUrls, indexedUrls, notIndexedUrls, failedUrls, pendingUrls, processingUrls, totalDomains, blacklistedDomains] = await Promise.all([
    prisma.url.count({ where: { projectId: id } }),
    prisma.url.count({ where: { projectId: id, isIndexed: true } }),
    prisma.url.count({ where: { projectId: id, isIndexed: false, status: 'COMPLETED' } }),
    prisma.url.count({ where: { projectId: id, status: 'FAILED' } }),
    prisma.url.count({ where: { projectId: id, status: 'PENDING' } }),
    prisma.url.count({ where: { projectId: id, status: 'PROCESSING' } }),
    prisma.projectDomain.count({ where: { projectId: id } }),
    prisma.projectDomain.count({ where: { projectId: id, isBlacklisted: true } }),
  ]);

  const indexedPercentage = totalUrls > 0 ? (indexedUrls / totalUrls) * 100 : 0;
  const errorRate = totalUrls > 0 ? (failedUrls / totalUrls) * 100 : 0;
  const completedUrls = indexedUrls + notIndexedUrls + failedUrls;
  const completionPercentage = totalUrls > 0 ? (completedUrls / totalUrls) * 100 : 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      IDLE: { label: "Idle", variant: "outline" as const, className: undefined },
      PROCESSING: { label: "Processing", variant: "default" as const, className: undefined },
      COMPLETED: { label: "Completed", variant: "default" as const, className: "bg-green-500" },
      FAILED: { label: "Failed", variant: "destructive" as const, className: undefined },
      IMPORTING: { label: "Importing", variant: "secondary" as const, className: undefined },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.IDLE;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUrls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalDomains} {totalDomains === 1 ? 'domain' : 'domains'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexed URLs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indexedUrls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {indexedPercentage.toFixed(1)}% of total
            </p>
            <Progress value={indexedPercentage} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.creditsUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {completedUrls} URLs checked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {failedUrls} failed {failedUrls === 1 ? 'check' : 'checks'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Current processing status and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              {getStatusBadge(project.status)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{completionPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-semibold">{pendingUrls}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Processing</p>
                  <p className="text-sm font-semibold">{processingUrls}</p>
                </div>
              </div>
            </div>

            {project.startedAt && (
              <div className="pt-2 border-t">
                {project.completedAt ? (
                  <div className="space-y-1 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Completed {formatDistanceToNow(new Date(project.completedAt), { addSuffix: true })}
                    </p>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      ⏱ Took {formatDistance(new Date(project.startedAt), new Date(project.completedAt), { 
                        includeSeconds: true 
                      })} to complete
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Started {formatDistanceToNow(new Date(project.startedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL Breakdown</CardTitle>
            <CardDescription>Detailed URL status distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Indexed</span>
              </div>
              <span className="font-semibold">{indexedUrls.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Not Indexed</span>
              </div>
              <span className="font-semibold">{notIndexedUrls.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Failed</span>
              </div>
              <span className="font-semibold">{failedUrls.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-semibold">{pendingUrls.toLocaleString()}</span>
            </div>

            {blacklistedDomains > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Blacklisted Domains</span>
                  <Badge variant="destructive" className="text-xs">{blacklistedDomains}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* URLs Table */}
      <Card>
        <CardContent className="pt-6">
          <UrlsTable projectId={id} />
        </CardContent>
      </Card>
    </div>
  );
}