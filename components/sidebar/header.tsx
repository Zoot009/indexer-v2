"use client"

import React from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getProjectDetails } from "@/actions/get-project-details"

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
const [projectName, setProjectName] = useState<string | null>(null)
  

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch project name when on a project detail page
  useEffect(() => {
    const fetchProjectName = async () => {
      if (!pathname) return
      
      const segments = pathname.split('/').filter(Boolean)
      // Check if we're on /projects/[id] route
      if (segments[0] === 'projects' && segments[1]) {
        const projectId = segments[1]
        // Check if it looks like a UUID or ID
        if (projectId.match(/^[a-f0-9-]{36}$/i) || projectId.match(/^[a-zA-Z0-9]{8,}$/)) {
          try {
            const project = await getProjectDetails(projectId)
            if (project) {
              setProjectName(project.name)
            } else {
              setProjectName(null)
            }
          } catch (error) {
            console.error('Failed to fetch project details:', error)
            setProjectName(null)
          }
        }
      } else {
        setProjectName(null)
      }
    }

    fetchProjectName()
  }, [pathname])

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return []
    
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Home', href: '/' }]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Capitalize and format segment
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Special handling for UUIDs or IDs
      if (segment.match(/^[a-f0-9-]{36}$/i) || segment.match(/^[a-zA-Z0-9]{8,}$/)) {
        // If it's the project ID and we have the project name, use it
        if (index === 1 && segments[0] === 'projects' && projectName) {
          label = projectName
        } else if (index === 1) {
          label = 'Project Details'
        } else {
          label = segment
        }
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (!mounted) {
    return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
          <div className="flex items-center gap-1 lg:gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Loading...</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme and logout buttons rendered below */}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="flex py-2 h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {index < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="h-9 w-9 p-0"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">
              {resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}