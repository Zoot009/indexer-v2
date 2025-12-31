import { PrismaClient, CreditOperation } from '../generated/prisma'

const prisma = new PrismaClient()

// ============================================
// Types
// ============================================

export interface CreditBalance {
  total: number
  used: number
  reserved: number
  available: number
  creditsPerCheck: number
}

export interface CreditCheckResult {
  success: boolean
  available: number
  required: number
  shortfall: number
  message: string
}

export interface ReservationResult {
  success: boolean
  reservedAmount: number
  message: string
}

// ============================================
// Credit Service
// ============================================

export class CreditService {
  
  /**
   * Get current credit balance
   */
  async getBalance(): Promise<CreditBalance> {
    const config = await prisma. creditConfig.findFirst({
      where:  { id: 'main' },
    })

    if (!config) {
      throw new Error('Credit configuration not found.  Please run seed.')
    }

    const available = config.totalCredits - config. usedCredits - config.reservedCredits

    return {
      total: config.totalCredits,
      used: config.usedCredits,
      reserved: config. reservedCredits,
      available:  Math.max(0, available),
      creditsPerCheck: config.creditsPerCheck,
    }
  }

  /**
   * Check if enough credits are available for a project
   */
  async checkCreditsForProject(urlCount: number): Promise<CreditCheckResult> {
    const balance = await this.getBalance()
    const required = urlCount * balance.creditsPerCheck

    if (balance.available >= required) {
      return {
        success: true,
        available:  balance.available,
        required,
        shortfall: 0,
        message:  `Sufficient credits available. Required: ${required. toLocaleString()}, Available: ${balance.available.toLocaleString()}`,
      }
    }

    const shortfall = required - balance.available
    const maxUrls = Math.floor(balance.available / balance. creditsPerCheck)

    return {
      success: false,
      available:  balance.available,
      required,
      shortfall,
      message: `Insufficient credits. Required: ${required.toLocaleString()}, Available: ${balance.available. toLocaleString()}.  You can check ${maxUrls. toLocaleString()} URLs with current balance.`,
    }
  }

  /**
   * Reserve credits for a project (called when project starts)
   * Uses a transaction to ensure atomicity
   */
  async reserveCredits(projectId: string, urlCount: number): Promise<ReservationResult> {
    const balance = await this.getBalance()
    const reserveAmount = urlCount * balance.creditsPerCheck

    // Check availability
    if (balance.available < reserveAmount) {
      return {
        success:  false,
        reservedAmount: 0,
        message: `Insufficient credits. Required: ${reserveAmount}, Available: ${balance. available}`,
      }
    }

    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Update global credit config
      await tx. creditConfig.update({
        where: { id: 'main' },
        data: {
          reservedCredits: { increment: reserveAmount },
        },
      })

      // Update project's reserved credits
      await tx.project.update({
        where: { id: projectId },
        data: {
          creditsReserved:  reserveAmount,
        },
      })

      // Log the reservation
      const updatedConfig = await tx.creditConfig.findFirst({
        where: { id: 'main' },
      })

      await tx.creditLog. create({
        data: {
          amount: reserveAmount,
          operation: CreditOperation.RESERVATION,
          balanceAfter: updatedConfig! .totalCredits - updatedConfig!. usedCredits - updatedConfig!. reservedCredits,
          description: `Reserved ${reserveAmount} credits for project (${urlCount} URLs)`,
          projectId,
        },
      })
    })

    return {
      success:  true,
      reservedAmount: reserveAmount,
      message: `Successfully reserved ${reserveAmount. toLocaleString()} credits for ${urlCount.toLocaleString()} URLs`,
    }
  }

  /**
   * Consume credits when a URL check completes successfully
   * Moves credits from reserved to used
   */
  async consumeCredit(projectId: string, urlCount: number = 1): Promise<void> {
    const balance = await this.getBalance()
    const consumeAmount = urlCount * balance.creditsPerCheck

    await prisma.$transaction(async (tx) => {
      // Move from reserved to used in global config
      await tx.creditConfig.update({
        where:  { id: 'main' },
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
          creditsUsed: { increment: consumeAmount },
        },
      })

      // Log consumption
      const updatedConfig = await tx. creditConfig.findFirst({
        where:  { id: 'main' },
      })

      await tx.creditLog.create({
        data:  {
          amount:  consumeAmount,
          operation: CreditOperation.CONSUMPTION,
          balanceAfter: updatedConfig!.totalCredits - updatedConfig! .usedCredits - updatedConfig! .reservedCredits,
          description:  `Consumed ${consumeAmount} credits for URL check`,
          projectId,
        },
      })
    })
  }

  /**
   * Release unused reserved credits (when project completes or fails)
   */
  async releaseReservedCredits(projectId: string): Promise<number> {
    const project = await prisma. project.findUnique({
      where:  { id: projectId },
    })

    if (!project || project.creditsReserved <= 0) {
      return 0
    }

    const releaseAmount = project. creditsReserved

    await prisma.$transaction(async (tx) => {
      // Release from global reserved
      await tx.creditConfig.update({
        where: { id: 'main' },
        data:  {
          reservedCredits: { decrement: releaseAmount },
        },
      })

      // Clear project's reserved credits
      await tx.project.update({
        where:  { id: projectId },
        data:  {
          creditsReserved: 0,
        },
      })

      // Log the release
      const updatedConfig = await tx.creditConfig. findFirst({
        where: { id:  'main' },
      })

      await tx.creditLog.create({
        data: {
          amount: -releaseAmount, // Negative = credits returned
          operation: CreditOperation.RELEASE,
          balanceAfter: updatedConfig!.totalCredits - updatedConfig!.usedCredits - updatedConfig!.reservedCredits,
          description: `Released ${releaseAmount} unused reserved credits`,
          projectId,
        },
      })
    })

    return releaseAmount
  }

  /**
   * Get credit history for a project or overall
   */
  async getCreditHistory(projectId?: string, limit: number = 50) {
    return prisma.creditLog. findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    })
  }
}

// Export singleton instance
export const creditService = new CreditService()