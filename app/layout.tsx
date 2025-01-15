import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "next-themes";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Add metadata export
export const metadata = {
  title: "Sub Box - 订阅管理系统",
  description: "简单高效的订阅管理工具",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

function getStoredTheme(): string {
  try {
    const headersList = headers();
    const cookie = headersList.get("cookie") ?? "";
    if (!cookie) return "system";

    const themeMatch = cookie.match(/theme=([^;]+)/);
    return themeMatch?.[1] ?? "system";
  } catch {
    return "system";
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const defaultTheme = getStoredTheme();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen")}>
        <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
