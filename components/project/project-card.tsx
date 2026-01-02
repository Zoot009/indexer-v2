"use client"

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Calendar, EllipsisVertical, Folder } from "lucide-react";
import { redirect } from "next/navigation";

interface ProjectCardProps {
  projectId: string;
  projectName: string;
  urlCount?: number;
  lastUpdated: string;
  indexedCount: number;
  status?: string;
}

const ProjectCard = ({
  projectName,
  urlCount,
  lastUpdated,
  indexedCount,
  projectId,
  status,
}: ProjectCardProps) => {
  return (
    <Card 
      onClick={()=>redirect(`/projects/${projectId}`)}
      className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-start items-center gap-2">
          <Folder className="bg-primary/20 rounded-md p-1.5 text-emerald-400" size={32}/> 
          <h1 className="text-xl font-semibold">{projectName}</h1>
        </CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger><EllipsisVertical size={18}/></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <Badge variant={"outline"} className="text-xs">
            {urlCount ? `${urlCount} Backlinks` : 'No Backlinks'}
          </Badge>
          <Badge className={cn(
            "text-xs ml-2",
            status === 'indexing' ? 'border-blue-400 bg-blue-100 text-blue-800' : '',
            status === 'paused' ? 'border-zinc-400 bg-zinc-100 text-zinc-800' : '',
            status === 'completed' ? 'border-green-400 bg-green-100 text-green-800' : '',
          )}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Idle'}
          </Badge>  
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-muted-foreground text-sm">Progress</p>
            <span className="text-muted-foreground text-sm">{indexedCount} / {urlCount}</span>
          </div>
          <Progress value={urlCount ? (indexedCount / urlCount) * 100 : 0} />
        </div>
      </CardContent>
      <Separator />
      <CardFooter>
        <Calendar className="text-muted-foreground mr-2" size={14}/> <p className="text-muted-foreground text-sm">Created {lastUpdated}</p>
      </CardFooter>
    </Card>
  )
}

export default ProjectCard