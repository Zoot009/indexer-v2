"use server"

import { ProjectStatus } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

export interface ProjectDetails {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
}

export const getProjectDetails = async (projectId: string): Promise<ProjectDetails | null> => {
  const projectDetails = await prisma.project.findUnique({
    where: { id: projectId }
  });
  return projectDetails;
}