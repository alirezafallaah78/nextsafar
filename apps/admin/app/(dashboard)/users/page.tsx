"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Ban, Loader2, RefreshCw, Search, ShieldCheck, UserCheck, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { useUsersList, useUsersStats } from "@/hooks/use-users"
import { roleMap, statusMap, type UserRole } from "@/lib/admin-users"
import { faNum, faPrice } from "@/lib/jalali"

export default function UsersPage() {
  const { users, meta, loading, load, toggleStatus, updateRole, params } = useUsersList()

  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<"all" | "customers" | "staff" | "admins">("all")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // ✅ بارگذاری اولیه - فقط یک بار
  useEffect(() => {
    setMounted(true)
    load({ page: 1, limit: 50 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ Debounced search - فقط وقتی query یا statusFilter تغییر می‌کند
  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => {
      load({
        page: 1,
        limit: 50,
        search: query || undefined,
        status: statusFilter === "all" ? undefined : (statusFilter as any),
      })
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (tab === "customers") return u.role === "user"
      if (tab === "staff") {
        return ["support", "tour_agent", "visa_agent", "hotel_agent", "finance", "content"].includes(u.role)
      }
      if (tab === "admins") return ["admin", "super_admin"].includes(u.role)
      return true
    })
  }, [users, tab])

  const stats = useUsersStats(users)

  // ✅ جلوگیری از hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">کاربران</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت مشتریان، کارمندان و ادمین‌ها</p>
        </div>
        <Button
          variant="outline"
          onClick={() => load(params)}
          disabled={loading}
          className="rounded-sm"
        >
          {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
          بارگذاری مجدد
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="مشتریان" value={faNum(stats.totalCustomers)} icon={Users} accent="blue" />
        <StatCard title="کارمندان" value={faNum(stats.totalStaff)} icon={ShieldCheck} accent="gray" />
        <StatCard title="ادمین‌ها" value={faNum(stats.totalAdmins)} icon={ShieldCheck} accent="gray" />
        <StatCard title="کل کاربران" value={faNum(meta.total)} icon={Users} accent="blue" />
      </div>

      <div className="flex items-center gap-2 rounded-md bg-muted p-1">
        {[
          { key: "all", label: "همه", count: users.length },
          { key: "customers", label: "مشتریان", count: stats.totalCustomers },
          { key: "staff", label: "کارمندان", count: stats.totalStaff },
          { key: "admins", label: "ادمین‌ها", count: stats.totalAdmins },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 rounded-sm px-4 py-2 text-sm font-bold transition ${
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} ({faNum(t.count)})
          </button>
        ))}
      </div>

      <Panel
        title={`لیست ${tab === "all" ? "کاربران" : tab === "customers" ? "مشتریان" : tab === "staff" ? "کارمندان" : "ادمین‌ها"}`}
        description={`${faNum(filtered.length)} کاربر`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو: نام، موبایل، ایمیل..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-60 rounded-md pr-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-36">
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(statusMap).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </div>
        }
      >
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-3 text-sm text-muted-foreground">در حال بارگذاری...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">کاربر</th>
                  <th className="pb-3 font-medium">موبایل</th>
                  <th className="pb-3 font-medium">نقش</th>
                  <th className="pb-3 font-medium">سفارش‌ها</th>
                  <th className="pb-3 font-medium">مجموع خرید</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                  <th className="pb-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {u.firstName?.[0] || "?"}
                        </span>
                        <div>
                          <Link href={`/users/${u.id}`} className="font-bold text-foreground hover:text-primary">
                            {u.firstName} {u.lastName}
                          </Link>
                          {u.email && (
                            <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{u.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs text-muted-foreground" dir="ltr">{u.mobile}</td>
                    <td className="py-4">
                      <Select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                        className="h-9 w-36 text-xs"
                      >
                        {Object.entries(roleMap).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="py-4 tabular-nums text-muted-foreground">{faNum(u.ordersCount)}</td>
                    <td className="py-4 font-bold tabular-nums text-foreground">{faPrice(u.totalSpent)}</td>
                    <td className="py-4">
                      <Badge variant={statusMap[u.status].variant}>{statusMap[u.status].label}</Badge>
                    </td>
                    <td className="py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(u.id, u.status)}
                        className={
                          u.status === "active"
                            ? "rounded-sm text-danger hover:bg-danger/10"
                            : "rounded-sm text-primary hover:bg-primary/10"
                        }
                      >
                        {u.status === "active" ? (
                          <><Ban className="ml-1 h-4 w-4" /> مسدود</>
                        ) : (
                          <><UserCheck className="ml-1 h-4 w-4" /> فعال</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="py-16 text-center text-muted-foreground">کاربری یافت نشد.</div>
            )}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              صفحه {faNum(meta.page)} از {faNum(meta.totalPages)} (مجموع: {faNum(meta.total)})
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === 1 || loading}
                onClick={() => load({ ...params, page: meta.page - 1 })}
                className="rounded-sm"
              >
                قبلی
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === meta.totalPages || loading}
                onClick={() => load({ ...params, page: meta.page + 1 })}
                className="rounded-sm"
              >
                بعدی
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
