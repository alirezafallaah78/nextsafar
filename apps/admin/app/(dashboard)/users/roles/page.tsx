"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Panel } from "@/components/dashboard/panel"
import { listUsers, roleMap, type UserRole } from "@/lib/admin-users"
import { faNum } from "@/lib/jalali"

export default function RolesPage() {
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    setUsers(listUsers())
  }, [])

  // ✅ SSR skeleton برای جلوگیری از hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">نقش‌ها و دسترسی‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ساختار RBAC پلتفرم — ۹ نقش با دسترسی‌های تعریف‌شده
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">نقش‌ها و دسترسی‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ساختار RBAC پلتفرم — ۹ نقش با دسترسی‌های تعریف‌شده
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(Object.entries(roleMap) as [UserRole, (typeof roleMap)[UserRole]][]).map(([key, role]) => {
          const count = users.filter((u) => u.role === key).length
          const perms = Array.isArray(role.perms) ? role.perms : []

          return (
            <Panel key={key} title={role.label} description={role.desc}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    تعداد کاربران
                  </span>
                  <Badge variant="secondary">{faNum(count)}</Badge>
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    دسترسی‌ها ({faNum(perms.length)})
                  </p>

                  {perms.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted-foreground">
                      دسترسی‌ای تعریف نشده است
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {perms.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
