import prisma from '@/lib/prisma'
import { urlQueue } from '@/lib/queue'

export async function POST(req: Request) {
  const { projectId } = await req.json()

  const urls = await prisma.url.findMany({
    where: {
      projectId,
      status: 'PENDING',
    },
    select: { id: true },
  })

  await urlQueue.addBulk(
    urls.map(u => ({
      name: 'check-index',
      data: { urlId: u.id },
      opts: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 60_000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }))
  )

  // await prisma.url.updateMany({
  //   where: {
  //     projectId,
  //     status: 'PENDING',
  //   },
  //   data: {
  //     status: 'QUEUED',
  //   },
  // })

  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'PROCESSING',
      startedAt: new Date(),
    },
  })

  return Response.json({ queued: urls.length })
}