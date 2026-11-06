"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw, Search, User, Users as UsersIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { useToast } from "@/hooks/use-toast"
import { faNum } from "@/lib/jalali"
import api from "@/lib/api"

const relationshipMap: Record<string, string> = {
  self: "خود",
  spouse: "همسر",
  child: "فرزند",
  parent: "والد",
  other: "سایر",
  SELF: "خود",
  SPOUSE: "همسر",
  CHILD: "فرزند",
  PARENT: "والد",
  OTHER: "سایر",
}

interface Passenger {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  passportNumber?: string
  birthDate: string
  gender: string
  relationship: string
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    mobile: string
  }
}

export default function PassengersPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const response = await api.get("/users/passengers", {
        params: { search: query || undefined, limit: 100 },
      })
      const data = response.data?.data || response.data || []
      setPassengers(data)
    } catch (err: any) {
      console.error("load passengers error:", err)
      toast({
        variant: "destructive",
        title: "خطا در دریافت مسافران",
        description: err.response?.data?.message || err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => {
      load()
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const filtered = useMemo(() => {
    if (!query.trim()) return passengers
    const q = query.trim().toLowerCase()
    return passengers.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.nationalId?.includes(q) ||
        `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.toLowerCase().includes(q)
    )
  }, [passengers, query])

  const stats = useMemo(() => {
    const uniqueUsers = new Set(passengers.map((p) => p.userId)).size
    const males = passengers.filter((p) => 
      p.gender?.toLowerCase() === "male" || p.gender === "MALE"
    ).length
    const females = passengers.filter((p) => 
      p.gender?.toLowerCase() === "female" || p.gender === "FEMALE"
    ).length
    return { total: passengers.length, uniqueUsers, males, females }
  }, [passengers])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مسافران</h1>
          <p className="mt-1 text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مسافران</h1>
          <p className="mt-1 text-sm text-muted-foreground">همه مسافران ثبت‌شده در سیستم</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="rounded-sm">
          {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
          بارگذاری مجدد
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="کل مسافران" value={faNum(stats.total)} icon={UsersIcon} accent="blue" />
        <StatCard title="کاربران دارای مسافر" value={faNum(stats.uniqueUsers)} icon={User} accent="gray" />
        <StatCard title="مرد" value={faNum(stats.males)} icon={UsersIcon} accent="blue" />
        <StatCard title="زن" value={faNum(stats.females)} icon={UsersIcon} accent="gray" />
      </div>

      <Panel
        title="لیست مسافران"
        description={`${faNum(filtered.length)} مسافر`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو: نام، کد ملی، مالک..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-64 rounded-md pr-10"
            />
          </div>
        }
      >
        {loading && passengers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-3 text-sm text-muted-foreground">در حال بارگذاری...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">نام</th>
                  <th className="pb-3 font-medium">کد ملی</th>
                  <th className="pb-3 font-medium">تاریخ تولد</th>
                  <th className="pb-3 font-medium">جنسیت</th>
                  <th className="pb-3 font-medium">نسبت</th>
                  <th className="pb-3 font-medium">مالک (کاربر)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {p.firstName?.[0] || "?"}
                        </span>
                        <span className="font-bold text-foreground">
                          {p.firstName} {p.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs text-muted-foreground" dir="ltr">
                      {p.nationalId || "—"}
                    </td>
                    <td className="py-4 text-muted-foreground">{p.birthDate || "—"}</td>
                    <td className="py-4">
                      <Badge variant="secondary">
                        {p.gender?.toLowerCase() === "male" || p.gender === "MALE" ? "مرد" : "زن"}
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {relationshipMap[p.relationship] || p.relationship || "—"}
                    </td>
                    <td className="py-4">
                      {p.user ? (
                        <div>
                          <p className="font-bold text-foreground">
                            {p.user.firstName} {p.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            {p.user.mobile}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="py-16 text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-bold text-foreground">مسافری یافت نشد</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  مسافران از طریق صفحه جزئیات هر کاربر قابل افزودن هستند
                </p>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}
