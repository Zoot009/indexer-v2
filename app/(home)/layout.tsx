

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>  
        <SiteHeader/>
        <div className="p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}