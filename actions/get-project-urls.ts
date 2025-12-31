"use server";

import prisma from "@/lib/prisma";

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface ProjectUrls {
  id: string;
  url: string;
  status: string;
  isIndexed: boolean;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProjectUrls(
  projectId: string,
  page = 1,
  pageSize = 50,
): Promise<ActionResponse<{ items: ProjectUrls[]; total: number; totalIndexed: number }>> {
  try {
    if (!projectId) {
      return { success: false, error: "projectId is required" };
    }
    const where = { projectId } as any;

    const total = await prisma.url.count({ where });
    const totalIndexed = await prisma.url.count({ where: { ...where, isIndexed: true } });

    const urls = await prisma.url.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const formatedUrls = urls.map((url) => ({
      id: url.id,
      url: url.url,
      status: url.status,
      isIndexed: url.isIndexed,
      domain: url.domain,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }));

    return {
      success: true,
      data: { items: formatedUrls, total, totalIndexed },
    };
  } catch (error) {
    console.error("Failed to import URLs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch project URLs",
    };
  }
}

