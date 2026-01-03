import prisma from "@/lib/prisma"
import { columns, IndexedUrl } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<IndexedUrl[]> {
  const data = await prisma.url.findMany({
    where: {
      isIndexed: true,
    },
    include:{
      project: {
        select:{
          name: true,
        }
      },
      domainData: {
        select:{
          domain: true,
        }
      }
    },
  })

  return data.map((item) => ({
    id: item.id,
    url: item.url,
    domain: item.domainData?.domain || "",
    status: item.status,
    errorMessage: item.errorMessage || "",
    projectId: item.projectId,
  }))
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}