import { redirect } from "next/navigation"
import { getUser } from "@/server/services/authentication-service"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="container mx-auto py-6 px-4 md:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
} 