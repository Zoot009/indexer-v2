"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type ActionResponse<T> = {
	success: boolean;
	data?: T;
	error?: string;
};

export async function importUrls(
	projectId: string,
	urls: string[]
): Promise<ActionResponse<{ imported: number; total: number }>> {
	try {
		if (!projectId) {
			return { success: false, error: "projectId is required" };
		}

		if (!urls || urls.length === 0) {
			return { success: false, error: "No URLs provided" };
		}

		// Normalize and prepare data
		const data = urls
			.filter((u) => !!u)
			.map((u) => {
				const url = new URL(u);
				return {
					url: url.toString(),
					domain: url.hostname,
					projectId,
				};
			});

		// Ensure Domain records exist for each hostname
		const uniqueDomains = Array.from(new Set(data.map((d) => d.domain)));
		if (uniqueDomains.length > 0) {
			await prisma.domain.createMany({
				data: uniqueDomains.map((domain) => ({ domain, projectId })),
				skipDuplicates: true,
			});
		}

		const result = await prisma.url.createMany({
			data,
			skipDuplicates: true,
		});

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

