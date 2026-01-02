import prisma from "@/lib/prisma";

const indexedUrls = async (projectId: string) => {
  try {
    const indexedurl = await prisma.url.findMany({
      where: {
        projectId,
        isIndexed: true,
      },
      select: { url: true }
    })
    console.log("Indexed URLs:", indexedurl);
    console.log("Total indexed URLs:", indexedurl.length);
  } catch (error) {
    console.error("Error fetching indexed URLs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

indexedUrls("cmju3amnl0000cwwhd0s4llak");