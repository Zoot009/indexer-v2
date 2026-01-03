"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type ActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

interface UrlWithAnchor {
    url: string;
    anchorText?: string;
}

export async function importUrls(
    projectId: string,
    urls: (string | UrlWithAnchor)[]
): Promise<ActionResponse<{ imported: number; total: number }>> {
    try {
        if (!projectId) {
            return { success: false, error: "projectId is required" };
        }

        if (!urls || urls.length === 0) {
            return { success: false, error: "No URLs provided" };
        }

        const indexedUrls = await prisma.url.findMany({
            where:{
                projectId,
                isIndexed: true,
            },
            select: { url: true }
        })

        const indexedUrlArray = indexedUrls.map((u) => u.url);

        // Normalize URLs to objects with anchorText
        const normalizedUrls: UrlWithAnchor[] = urls.map((u) => 
            typeof u === 'string' ? { url: u } : u
        );

        // Filter out already indexed URLs
        const filteredUrls = normalizedUrls.filter((u) => !indexedUrlArray.includes(u.url));

        // Normalize and prepare data
        const data = filteredUrls
            .filter((u) => !!u.url)
            .map((u) => {
                const url = new URL(u.url);
                return {
                    url: url.toString(),
                    domain: url.hostname,
                    anchorText: u.anchorText || null,
                    projectId,
                };
            });

        // Ensure Domain records exist for each hostname
        const uniqueDomains = Array.from(new Set(data.map((d) => d.domain)));
        if (uniqueDomains.length > 0) {
            await prisma.domain.createMany({
                data: uniqueDomains.map((domain) => ({ domain })),
                skipDuplicates: true,
            });
        }

        // Fetch domain IDs
        const domainRecords = await prisma.domain.findMany({
            where: {
                domain: { in: uniqueDomains },
            },
            select: { id: true, domain: true },
        });

        const domainMap = new Map(domainRecords.map((d) => [d.domain, d.id]));

        // Create ProjectDomain relationships
        const projectDomainData = uniqueDomains
            .map((domain) => ({
                projectId,
                domainId: domainMap.get(domain)!,
            }))
            .filter((pd) => pd.domainId);

        if (projectDomainData.length > 0) {
            await prisma.projectDomain.createMany({
                data: projectDomainData,
                skipDuplicates: true,
            });
        }

        // Create URLs with domainId and anchorText
        const urlsToCreate = data.map((d) => ({
            url: d.url,
            projectId,
            domainId: domainMap.get(d.domain)!,
            anchorText: d.anchorText,
        }));

        const result = await prisma.url.createMany({
            data: urlsToCreate,
            skipDuplicates: true,
        });

        await prisma.project.update({
            where: { id: projectId },
            data: { status: "IMPORTED", totalUrls: { increment: result.count } },
        })

        // Revalidate the project details page
        revalidatePath(`/projects/${projectId}`);

        return {
            success: true,
            data: { imported: result.count, total: urls.length },
        };
    } catch (error) {
        console.error("Failed to import URLs:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to import URLs",
        };
    }
}