'use server'

import prisma  from '@/lib/prisma'
import { ProjectStatus, UrlStatus } from '@/lib/generated/prisma'
import type { ActionResponse, ProjectStartResult } from '@/lib/types/actions'
import { 
  checkCreditsForProject, 
  reserveCredits, 
  releaseReservedCredits 
} from './credit-actions'
import { revalidatePath } from 'next/cache'

// ============================================
// Start Project
// ============================================

export async function startProject(
  projectId: string
): Promise<ActionResponse<ProjectStartResult>> {
  try {
    // 1. Fetch project with pending URL count
    const project = await prisma. project.findUnique({
      where:  { id: projectId },
      include:  {
        _count: {
          select: {
            urls: {
              where: { status: UrlStatus.PENDING },
            },
          },
        },
      },
    })

    // 2. Validate project exists
    if (!project) {
      return {
        success:  false,
        error: 'Project not found',
      }
    }

    // 3. Validate project status
    if (project.status !== ProjectStatus.IDLE) {
      return {
        success: false,
        error: `Project cannot be started. Current status: ${project.status}`,
        details: { currentStatus: project.status },
      }
    }

    const pendingUrlCount = project._count.urls

    // 4. Validate URLs exist
    if (pendingUrlCount === 0) {
      return {
        success: false,
        error: 'No pending URLs to process.  Please upload URLs first.',
      }
    }

    // 5. Check credit availability
    const creditCheck = await checkCreditsForProject(pendingUrlCount)

    if (!creditCheck.success) {
      return creditCheck
    }

    if (! creditCheck.data.canProceed) {
      return {
        success:  false,
        error: `Insufficient credits. You need ${creditCheck. data.required. toLocaleString()} credits but only have ${creditCheck.data.available.toLocaleString()} available.`,
        details: {
          required: creditCheck. data.required,
          available: creditCheck.data.available,
          shortfall: creditCheck. data.shortfall,
          maxUrlsAllowed: creditCheck.data.maxUrlsAllowed,
        },
      }
    }

    // 6. Reserve credits
    const reservation = await reserveCredits(projectId, pendingUrlCount)

    if (!reservation.success) {
      return reservation
    }

    // 7. Update project status and counters
    try {
      await prisma.project.update({
        where:  { id: projectId },
        data:  {
          status:  ProjectStatus.QUEUED,
          totalUrls: pendingUrlCount,
          processedCount: 0,
          indexedCount: 0,
          notIndexedCount: 0,
          errorCount: 0,
          startedAt: new Date(),
          completedAt: null,
        },
      })
    } catch (updateError) {
      // If project update fails, release the reserved credits
      console.error('Error updating project, releasing credits:', updateError)
      await releaseReservedCredits(projectId)
      throw updateError
    }

    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/projects')

    // 8. Return success
    return {
      success: true,
      data: {
        projectId,
        urlCount: pendingUrlCount,
        creditsReserved:  reservation.data.reservedAmount,
        status: ProjectStatus.QUEUED,
      },
      message: `Project started!  Processing ${pendingUrlCount.toLocaleString()} URLs.`,
    }
  } catch (error) {
    console.error('Error starting project:', error)

    // Try to release any reserved credits on failure
    try {
      await releaseReservedCredits(projectId)
    } catch (releaseError) {
      console.error('Error releasing credits after failure:', releaseError)
    }

    return {
      success: false,
      error: 'Failed to start project.  Please try again.',
    }
  }
}

// ============================================
// Get Project with Stats
// ============================================

export async function getProjectWithStats(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count:  {
          select:  {
            urls:  true,
          },
        },
      },
    })

    if (!project) {
      return {
        success:  false,
        error: 'Project not found',
      }
    }

    // Get URL status breakdown
    const urlStats = await prisma.url.groupBy({
      by: ['status'],
      where: { projectId },
      _count: { status: true },
    })

    const statusBreakdown = urlStats.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status
        return acc
      },
      {} as Record<string, number>
    )

    return {
      success:  true,
      data: {
        ... project,
        urlStats: statusBreakdown,
      },
    }
  } catch (error) {
    console. error('Error fetching project:', error)
    return {
      success:  false,
      error: 'Failed to fetch project',
    }
  }
}

// ============================================
// Cancel/Stop Project
// ============================================

export async function cancelProject(
  projectId: string
): Promise<ActionResponse<{ releasedCredits: number }>> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      }
    }

    // Only allow cancelling QUEUED or PROCESSING projects
    if (!([ProjectStatus.QUEUED, ProjectStatus.PROCESSING] as ProjectStatus[]).includes(project.status)) {
      return {
        success: false,
        error: `Cannot cancel project with status: ${project.status}`,
      }
    }

    // Release reserved credits
    const releaseResult = await releaseReservedCredits(projectId)

    // Update project status
    await prisma.project. update({
      where: { id: projectId },
      data: {
        status: ProjectStatus. FAILED,
        completedAt: new Date(),
      },
    })

    // Update pending URLs to failed
    await prisma.url. updateMany({
      where: {
        projectId,
        status: { in: [UrlStatus.PENDING, UrlStatus. QUEUED] },
      },
      data:  {
        status:  UrlStatus. FAILED,
        errorMessage: 'Project cancelled by user',
      },
    })

    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/projects')

    return {
      success: true,
      data: {
        releasedCredits: releaseResult. success ? releaseResult. data.releasedAmount : 0,
      },
      message:  'Project cancelled successfully',
    }
  } catch (error) {
    console.error('Error cancelling project:', error)
    return {
      success: false,
      error: 'Failed to cancel project',
    }
  }
}