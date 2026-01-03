"use client"

import { usePathname } from "next/navigation"
import * as React from "react"
import logo from "@/public/android-chrome-192x192.png"
import {
  Folder,
  Gauge,
  Globe,
  Link,
  OctagonX,
  PieChart,
  Settings2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-project"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { NavSecondary } from "./nav-secondary"



const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "All Projects",
      url: "/projects",
      icon: Folder,
      isActive: true,
    },
    {
      title: "All Indexed URLs",
      url: "/indexed-urls",
      icon: Link,
      isActive: true,
    },
    {
      title: "Domains",
      url: "/domains",
      icon: Globe,
      isActive: true,
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: Gauge ,
    },
    {
      name: "Data Table",
      url: "/data-table",
      icon: PieChart,
    },
    {
      name: "Failed URLs",
      url: "#",
      icon: OctagonX,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useUser()
  const [ userData, setUserData ] = React.useState(data.user)

  React.useEffect(() => {
    if (user.user) {
      setUserData({
        name: user.user.firstName|| "User",
        email: user.user.primaryEmailAddress?.emailAddress || "",
        avatar: user.user.imageUrl || "",
      })
    } 
  }, [user.user])

  // Determine which content to show
  const isProjectList = pathname === '/projects'
  const isProjectDetail = pathname?.startsWith('/projects/') && pathname !== '/projects'

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/projects">
                <div className="font-extrabold text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src={logo}
                    alt="InDeXeR Logo"
                    className="h-8 w-8"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">InDeXeR</span>
                  <span className="truncate text-xs">SEO Tool</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {isProjectList && (
          <NavMain items={data.navMain} />
        )}
        
        {isProjectDetail && (
          <NavProjects projects={data.projects} />
        )}
        
        {!isProjectList && !isProjectDetail && (
          <NavMain items={data.navMain} />
        )}
       <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
