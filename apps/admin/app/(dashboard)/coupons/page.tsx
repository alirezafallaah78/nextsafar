"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Copy, Edit, Plus, Search, Tag, ToggleLeft, ToggleRight, Trash2, Users } from "lucide-react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { useToast } from "@/hooks/use-toast"
import {
  couponStatusMap, couponTypeMap, deleteCoupon, listCoupons, toggleCouponStatus,
  type CouponRecord,
} from "@/lib/admin-coupons"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export default function CouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<CouponRecord[]>([])
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<CouponRecord | null>(null)

  const load = () => setCoupons(listCoupons())
  useEffect(load, [])

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const q = query.trim().toLowerCase()
      const matchQ = !q || c.code.toLowerCase().includes(q) || (c.description || "").includes(q)
      const matchS = statusFilter === "all" || c.status === statusFilter
      return matchQ && matchS
    })
  }, [coupons, query, statusFilter])

  const activeCount = coupons.filter((c) => c.status === "active").length
  const expiredCount = coupons.filter((c) => c.status === "expired").length
  const totalUsed = coupons.reduce((s, c) => s + c.usedCount, 0)
  const totalLimit = coupons.reduce((s, c) => s + c.usageLimit, 0)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "کد کپی شد", description: code })
  }

  const toggleStatus = (c: CouponRecord) => {
    toggleCouponStatus(c.id)
    toast({
      title: c.status === "active" ? "کد غیرفعال شد" : "کد فعال شد",
      description: c.code,
    })
    load()
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteCoupon(deleteTarget.id)
    toast({ title: "کد تخفیف حذف شد", description: deleteTarget.code })
    setDeleteTarget(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">کدهای تخفیف</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت کوپن‌های درصدی و مبلغ ثابت</p>
        </div>
        <Button asChild className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
          <Link href="/coupons/new">
            <Plus className="ml-2 h-4 w-4" />
            کد تخفیف جدید
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="کدهای فعال" value={faNum(activeCount)} icon={Tag} accent="blue" />
        <StatCard title="منقضی شده" value={faNum(expiredCount)} icon={CalendarDays} accent="gray" />
        <StatCard title="مجموع استفاده" value={faNum(totalUsed)} icon={Users} accent="gray" />
        <StatCard title="ظرفیت کل" value={faNum(totalLimit)} icon={Users} accent="blue" />
      </div>

      <Panel
        title="لیست کدهای تخفیف"
        description={`${faNum(filtered.length)} کد`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="جستجو در کد یا توضیحات..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-60 rounded-md pr-10" />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-36">
              <option value="all">همه</option>
              {Object.entries(couponStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
        }
      >
        <div className="space-y-3">
          {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground">کدی یافت نشد.</div>}
          {filtered.map((c) => {
            const usagePercent = c.usageLimit ? Math.round((c.usedCount / c.usageLimit) * 100) : 0
            return (
              <div key={c.id} className="rounded-lg border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-card">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* اطلاعات اصلی */}
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-14 w-20 flex-shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                      <span className="text-xs font-bold">
                        {c.type === "percent" ? `${faNum(c.value)}٪` : faPrice(c.value)}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {couponTypeMap[c.type]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold tracking-wider text-foreground" dir="ltr">{c.code}</span>
                        <Button variant="ghost" size="icon" onClick={() => copyCode(c.code)} className="h-6 w-6 rounded-sm hover:bg-primary/10 hover:text-primary">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Badge variant={couponStatusMap[c.status].variant}>{couponStatusMap[c.status].label}</Badge>
                      </div>
                      {c.description && <p className="mt-1 truncate text-xs text-muted-foreground">{c.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{c.startsAt} تا {c.expiresAt}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{faNum(c.usedCount)} / {faNum(c.usageLimit)} استفاده</span>
                        {c.validTours.length > 0 && <span className="rounded-sm bg-primary/10 px-1.5 text-primary">{faNum(c.validTours.length)} تور مجاز</span>}
                      </div>
                    </div>
                  </div>

                  {/* اکشن‌ها */}
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(c)} className="h-9 w-9 rounded-sm hover:bg-primary/10 hover:text-primary" aria-label="تغییر وضعیت">
                      {c.status === "active" ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-sm hover:bg-primary/10 hover:text-primary">
                      <Link href={`/coupons/${c.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c)} className="h-9 w-9 rounded-sm text-danger hover:bg-danger/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* نوار استفاده */}
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>نرخ استفاده</span>
                    <span>{faNum(usagePercent)}٪</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full transition-all ${usagePercent >= 90 ? "bg-danger" : usagePercent >= 70 ? "bg-warning" : "bg-primary"}`} style={{ width: `${usagePercent}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کد تخفیف</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف کد «{deleteTarget?.code}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-danger text-white hover:bg-danger/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
