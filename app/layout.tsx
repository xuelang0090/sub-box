import { Inter } from 'next/font/google'

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={cn(inter.className, "min-h-screen")}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="container mx-auto py-6 px-4 md:px-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}

