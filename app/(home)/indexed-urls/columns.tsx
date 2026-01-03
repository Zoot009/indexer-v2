"use client"

import { UrlStatus } from "@/lib/generated/prisma"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Check, Copy, CopyCheck, ExternalLink, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProjectDetails } from "@/actions/get-project-details"
import React from "react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type IndexedUrl = {
  id: string
  url: string,
  domain: string,
  status: UrlStatus,
  errorMessage: string,
  projectId: string,
}

export const columns: ColumnDef<IndexedUrl>[] = [
  {
    accessorKey: "number",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "url",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const url = row.original.url
      return <div className="text-left truncate w-80">{url}</div>
    },
  },
  {
    accessorKey: "domain",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },    
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.errorMessage ? `STOPPED` : row.original.status
      return <div>{status}</div>
    },
  },
  {
    accessorKey: "projectName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }, 
    cell: ({ row }) => {
      const [projectName, setProjectName] = React.useState<string>("Loading...");
      React.useEffect(() => {
        const fetchProjectName = async () => {
          const name = await getProjectName(row.original.projectId);
          setProjectName(name);
        };
        fetchProjectName();
      }, [row.original.projectId]);
      const getProjectName = async (projectId: string) => {
        const res = await getProjectDetails(projectId);
        return res?.name || "Unknown Project";
      }
      
      return <div>{projectName}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const indexedUrl = row.original
      const [copied, setCopied] = React.useState(false)

      React.useEffect(() => {
        if (copied) {
          const timeout = setTimeout(() => setCopied(false), 2000)
          return () => clearTimeout(timeout)
        }
      }, [copied])

      return (
        <div className="flex items-center space-x-2">
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy
              size={16}
              className="cursor-pointer text-sm hover:text-primary"
              onClick={async () => {
                await navigator.clipboard.writeText(indexedUrl.url)
                setCopied(true)
              }}
            />
          )}
          <ExternalLink
            size={16}
            className="ml-2 cursor-pointer text-sm hover:text-primary"
            onClick={() => {
              window.open(indexedUrl.url, '_blank')
            }}
          />
        </div>
      )
    },
  },

]