"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { navSections } from "@/config/nav"
import { auth } from "@/lib/auth"

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    // مسیرهای خاص که باید exact match باشند
    // چون parent یک sub-route مستقل در nav هستند
    const exactMatchRoutes = ["/dashboard", "/users"]
    
    if (exactMatchRoutes.includes(href)) {
      return pathname === href
    }
    
    return pathname === href || pathname.startsWith(href + "/")
  }

  const handleLogout = async () => {
    await auth.logout()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-l border-border bg-card transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between border-b border-border px-4">
        {!collapsed && <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8 hover:bg-accent rotate-180",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", active && "scale-110")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              active
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>خروج از حساب</span>}
        </button>
      </div>
    </aside>
  )
}
