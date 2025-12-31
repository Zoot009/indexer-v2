'use server'

import { CreditOperation } from '@/lib/generated/prisma'
import prisma from '@/lib/prisma'
import type { 
  ActionResponse, 
  CreditBalance, 
  CreditCheckResult 
} from '@/lib/types/actions'
import { revalidatePath } from 'next/cache'

// ============================================
// Get Credit Balance
// ============================================

export async function getCreditBalance(): Promise<ActionResponse<CreditBalance>> {
  try {
    const config = await prisma. creditConfig.findFirst({
      where: { id: 'main' },
    })

    if (!config) {
      return {
        success: false,
        error:  'Credit configuration not found.  Please run database seed.',
      }
    }

    const available = Math.max(
      0,
      config.totalCredits - config.usedCredits - config. reservedCredits
    )

    return {
      success: true,
      data: {
        total: config. totalCredits,
        used: config. usedCredits,
        reserved: config.reservedCredits,
        available,
        creditsPerCheck: config.creditsPerCheck,
      },
    }
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return {
      success: false,
      error:  'Failed to fetch credit balance',
    }
  }
}

// ============================================
// Check Credits for Project
// ============================================

export async function checkCreditsForProject(
  urlCount: number
): Promise<ActionResponse<CreditCheckResult>> {
  try {
    const balanceResult = await getCreditBalance()
    
    if (!balanceResult.success) {
      return balanceResult
    }

    const balance = balanceResult. data
    const required = urlCount * balance.creditsPerCheck
    const maxUrlsAllowed = Math.floor(balance. available / balance.creditsPerCheck)

    if (balance.available >= required) {
      return {
        success: true,
        data: {
          canProceed:  true,
          available: balance.available,
          required,
          shortfall: 0,
          maxUrlsAllowed,
        },
      }
    }

    return {
      success: true,
      data:  {
        canProceed: false,
        available: balance.available,
        required,
        shortfall: required - balance.available,
        maxUrlsAllowed,
      },
    }
  } catch (error) {
    console.error('Error checking credits:', error)
    return {
      success:  false,
      error: 'Failed to check credit availability',
    }
  }
}

// ============================================
// Reserve Credits (Internal - called by startProject)
// ============================================

export async function reserveCredits(
  projectId: string,
  urlCount: number
): Promise<ActionResponse<{ reservedAmount: number }>> {
  try {
    const balanceResult = await getCreditBalance()
    
    if (!balanceResult.success) {
      return balanceResult
    }

    const balance = balanceResult.data
    const reserveAmount = urlCount * balance.creditsPerCheck

    if (balance.available < reserveAmount) {
      return {
        success: false,
        error: `Insufficient credits.  Required: ${reserveAmount. toLocaleString()}, Available: ${balance. available.toLocaleString()}`,
      }
    }

    // Use transaction for atomicity
    await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Update global credit config
      await tx.creditConfig.update({
      where: { id: 'main' },
      data: {
        reservedCredits: { increment: reserveAmount },
      },
      })

      // Update project's reserved credits
      await tx.project.update({
      where: { id: projectId },
      data: {
        creditsReserved: reserveAmount,
      },
      })

      // Get updated balance for logging
      const updatedConfig = await tx.creditConfig.findFirst({
      where: { id: 'main' },
      })

      // Log the reservation
      await tx.creditLog.create({
      data: {
        amount: reserveAmount,
        operation: CreditOperation.RESERVATION,
        balanceAfter: 
        updatedConfig!.totalCredits -
        updatedConfig!.usedCredits -
        updatedConfig!.reservedCredits,
        description: `Reserved ${reserveAmount.toLocaleString()} credits for ${urlCount.toLocaleString()} URLs`,
        projectId,
      },
      })
    })

    revalidatePath('/') // Revalidate to update UI

    return {
      success: true,
      data: { reservedAmount: reserveAmount },
      message: `Successfully reserved ${reserveAmount.toLocaleString()} credits`,
    }
  } catch (error) {
    console. error('Error reserving credits:', error)
    return {
      success: false,
      error: 'Failed to reserve credits',
    }
  }
}

// ============================================
// Consume Credit (Called by webhook handler)
// ============================================

export async function consumeCredit(
  projectId:  string,
  urlCount: number = 1
): Promise<ActionResponse<void>> {
  try {
    const balanceResult = await getCreditBalance()
    
    if (!balanceResult.success) {
      return balanceResult
    }

    const consumeAmount = urlCount * balanceResult.data. creditsPerCheck

    await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Move from reserved to used
      await tx.creditConfig.update({
      where: { id:  'main' },
      data: {
        reservedCredits: { decrement: consumeAmount },
        usedCredits:  { increment: consumeAmount },
      },
      })

      // Update project credits
      await tx. project.update({
      where: { id: projectId },
      data: {
        creditsReserved: { decrement: consumeAmount },
        creditsUsed:  { increment: consumeAmount },
      },
      })

      // Get updated balance for logging
      const updatedConfig = await tx.creditConfig.findFirst({
      where: { id: 'main' },
      })

      // Log consumption
      await tx. creditLog.create({
      data: {
        amount: consumeAmount,
        operation: CreditOperation.CONSUMPTION,
        balanceAfter:
        updatedConfig!.totalCredits -
        updatedConfig!.usedCredits -
        updatedConfig! .reservedCredits,
        description:  `Consumed ${consumeAmount} credits for URL check`,
        projectId,
      },
      })
    })

    return { success: true, data: undefined }
  } catch (error) {
    console. error('Error consuming credit:', error)
    return {
      success: false,
      error: 'Failed to consume credit',
    }
  }
}

// ============================================
// Release Reserved Credits
// ============================================

export async function releaseReservedCredits(
  projectId: string
): Promise<ActionResponse<{ releasedAmount: number }>> {
  try {
    const project = await prisma. project.findUnique({
      where:  { id: projectId },
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      }
    }

    if (project.creditsReserved <= 0) {
      return {
        success: true,
        data:  { releasedAmount: 0 },
        message: 'No credits to release',
      }
    }

    const releaseAmount = project.creditsReserved

    await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Release from global reserved
      await tx.creditConfig.update({
      where: { id: 'main' },
      data: {
        reservedCredits: { decrement: releaseAmount },
      },
      })

      // Clear project's reserved credits
      await tx.project.update({
      where: { id: projectId },
      data: {
        creditsReserved: 0,
      },
      })

      // Get updated balance for logging
      const updatedConfig = await tx.creditConfig.findFirst({
      where: { id: 'main' },
      })

      // Log the release
      await tx.creditLog.create({
      data: {
        amount: -releaseAmount, // Negative = credits returned
        operation: CreditOperation.RELEASE,
        balanceAfter:
        updatedConfig!.totalCredits -
        updatedConfig!.usedCredits -
        updatedConfig!.reservedCredits,
        description: `Released ${releaseAmount.toLocaleString()} unused reserved credits`,
        projectId,
      },
      })
    })

    revalidatePath('/')

    return {
      success: true,
      data:  { releasedAmount: releaseAmount },
      message: `Released ${releaseAmount. toLocaleString()} credits`,
    }
  } catch (error) {
    console.error('Error releasing credits:', error)
    return {
      success: false,
      error: 'Failed to release credits',
    }
  }
}

// ============================================
// Get Credit History
// ============================================

export async function getCreditHistory(
  projectId?:  string,
  limit: number = 50
): Promise<ActionResponse<Awaited<ReturnType<typeof prisma.creditLog. findMany>>>> {
  try {
    const logs = await prisma. creditLog.findMany({
      where:  projectId ? { projectId } : {},
      orderBy:  { createdAt:  'desc' },
      take: limit,
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    })

    return {
      success:  true,
      data: logs,
    }
  } catch (error) {
    console.error('Error fetching credit history:', error)
    return {
      success: false,
      error: 'Failed to fetch credit history',
    }
  }
}