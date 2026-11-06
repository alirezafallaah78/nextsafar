"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  Ban,
  Calendar,
  Loader2,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  User,
  UserCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserDetail, useUsersList } from "@/hooks/use-users"
import { useToast } from "@/hooks/use-toast"
import { roleMap, statusMap, type UserRole } from "@/lib/admin-users"
import { faNum, faPrice } from "@/lib/jalali"

export default function UserDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const { user, loading, error, reload } = useUserDetail(id)
  const { toggleStatus, updateRole } = useUsersList()
  const [actionLoading, setActionLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBlock = async () => {
    if (!user) return
    setActionLoading(true)
    await toggleStatus(user.id, user.status)
    await reload()
    setActionLoading(false)
  }

  const handleRoleChange = async (role: UserRole) => {
    if (!user) return
    setActionLoading(true)
    await updateRole(user.id, role)
    await reload()
    setActionLoading(false)
  }

  // ✅ Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  // ✅ Error state
  if (error || !user) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">
          {error || "کاربر یافت نشد"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          شناسه: <code className="font-mono" dir="ltr">{id}</code>
        </p>
        <Button asChild className="mt-6 rounded-sm">
          <Link href="/users">بازگشت به لیست کاربران</Link>
        </Button>
      </div>
    )
  }

  // ✅ Hydration-safe loading
  if (!mounted) {
    return <Skeleton className="h-96 w-full rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-sm">
            <Link href="/users">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {user.firstName?.[0] || "?"}
          </div>
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
              <Badge variant={statusMap[user.status].variant}>{statusMap[user.status].label}</Badge>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{user.mobile}</span>
              </span>
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span dir="ltr">{user.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            className="h-10 w-40"
            disabled={actionLoading}
          >
            {Object.entries(roleMap).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={handleBlock}
            disabled={actionLoading}
            className={
              user.status === "active"
                ? "rounded-sm border-danger/30 text-danger hover:bg-danger/10"
                : "rounded-sm border-primary/30 text-primary hover:bg-primary/10"
            }
          >
            {actionLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : user.status === "active" ? (
              <Ban className="ml-2 h-4 w-4" />
            ) : (
              <UserCheck className="ml-2 h-4 w-4" />
            )}
            {user.status === "active" ? "مسدودسازی" : "فعال‌سازی"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">سفارش‌ها</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{faNum(user.ordersCount)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">مجموع خرید</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{faPrice(user.totalSpent)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">مسافران</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{faNum(user.passengers?.length || 0)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">شناسه کاربری</p>
          <p className="mt-1 text-xs font-bold text-foreground font-mono truncate" dir="ltr" title={user.id}>
            {user.id}
          </p>
        </div>
      </div>

      <Panel title="اطلاعات پایه" description="جزئیات حساب کاربری">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow icon={User} label="نام" value={`${user.firstName} ${user.lastName}`} />
          <InfoRow icon={Phone} label="موبایل" value={user.mobile} ltr />
          <InfoRow icon={Mail} label="ایمیل" value={user.email || "—"} ltr />
          <InfoRow icon={Shield} label="نقش" value={roleMap[user.role]?.label || user.role} />
        </div>
      </Panel>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, ltr }: { icon: any; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p
          className={`mt-0.5 truncate text-sm font-bold text-foreground ${ltr ? "font-mono" : ""}`}
          dir={ltr ? "ltr" : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
