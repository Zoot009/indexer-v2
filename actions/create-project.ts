"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createProject(
  name: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!name) {
      return {
        success: false,
        error: "Project name is required",
      };
    }

    const project = await prisma.project.create({
      data: {
        name,
      },
    });

    revalidatePath("/projects");

    return {
      success: true,
      data: { id: project.id },
    };
  } catch (error) {
    console.error("Failed to create project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}
