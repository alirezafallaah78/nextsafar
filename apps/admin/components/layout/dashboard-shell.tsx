"use client"

import { useState } from "react"
import { Header } from "./header"
import { MobileSidebar } from "./mobile-sidebar"
import { Sidebar } from "./sidebar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* سایدبار در راست (به دلیل RTL) */}
      <Sidebar className="sticky top-0 hidden h-screen shrink-0 md:flex" />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
