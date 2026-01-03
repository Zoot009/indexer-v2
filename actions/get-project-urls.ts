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
  sortBy: "url" | "domain" | "updatedAt" = "updatedAt",
  sortOrder: "asc" | "desc" = "desc",
  search = "",
  isIndexedFilter: "all" | "indexed" | "not-indexed" = "all",
): Promise<ActionResponse<{ items: ProjectUrls[]; total: number; totalIndexed: number }>> {
  try {
    if (!projectId) {
      return { success: false, error: "projectId is required" };
    }
    const where = { projectId } as any;

    // Add search filter
    if (search) {
      where.OR = [
        { url: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add indexed filter
    if (isIndexedFilter === "indexed") {
      where.isIndexed = true;
    } else if (isIndexedFilter === "not-indexed") {
      where.isIndexed = false;
    }

    const total = await prisma.url.count({ where });
    const totalIndexed = await prisma.url.count({ where: { projectId, isIndexed: true } });

    const urls = await prisma.url.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        domainData: {
          select: { domain: true },
        },
      },
    });

    const formatedUrls = urls.map((url) => ({
      id: url.id,
      url: url.url,
      status: url.status,
      isIndexed: url.isIndexed,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
      domain: url.domainData?.domain || "",
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

