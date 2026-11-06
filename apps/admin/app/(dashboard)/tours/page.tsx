"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  deleteTour,
  formatDateSafe,
  listTours,
  toViewModel,
  tourStatusMap,
  type TourViewModel,
} from "@/lib/admin-tours"
import { cn } from "@/lib/utils"

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

function formatPrice(value?: number) {
  if (!value) return "-"
  return `${formatNumber(value)} ریال`
}

export default function ToursPage() {
  const { toast } = useToast()
  const [tours, setTours] = useState<TourViewModel[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<TourViewModel | null>(null)

  const refresh = () => {
    setLoading(true)
    const records = listTours()
    setTours(records.map(toViewModel))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      const matchQuery =
        !query || t.title.includes(query) || t.destination.includes(query) || t.slug.includes(query)
      const matchStatus = statusFilter === "all" || t.status === statusFilter
      return matchQuery && matchStatus
    })
  }, [tours, query, statusFilter])

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteTour(deleteTarget.id)
    toast({
      title: "تور حذف شد",
      description: `«${deleteTarget.title}» با موفقیت حذف شد`,
    })
    setDeleteTarget(null)
    refresh()
  }

  const statusOptions = [
    { value: "all", label: "همه" },
    { value: "selling", label: "در حال فروش" },
    { value: "published", label: "منتشر شده" },
    { value: "draft", label: "پیش‌نویس" },
    { value: "sold_out", label: "تکمیل ظرفیت" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تورها</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت تورهای آفلاین، تاریخ‌ها و قیمت‌ها
          </p>
        </div>
        <Button asChild className="rounded-md bg-gradient-to-l from-primary to-primary-dark shadow-card-hover">
          <Link href="/tours/new">
            <Plus className="ml-2 h-4 w-4" />
            تور جدید
          </Link>
        </Button>
      </div>

      <Panel
        title="لیست تورها"
        description={`${formatNumber(filtered.length)} تور یافت شد`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="جستجوی تور..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-56 rounded-md border-slate-200 bg-slate-50 pr-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-muted-foreground">
                  <th className="pb-3 font-medium">تور</th>
                  <th className="pb-3 font-medium">مقصد</th>
                  <th className="pb-3 font-medium">تاریخ حرکت</th>
                  <th className="pb-3 font-medium">ظرفیت</th>
                  <th className="pb-3 font-medium">قیمت بزرگسال</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                  <th className="pb-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tour) => {
                  const status =
                    tourStatusMap[tour.status] || { label: tour.status, variant: "secondary" as const }
                  const percent = tour.capacity
                    ? Math.round((tour.booked / tour.capacity) * 100)
                    : 0
                  return (
                    <tr key={tour.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="py-4">
                        <Link href={`/tours/${tour.id}/edit`} className="font-bold text-foreground hover:text-primary-dark">
                          {tour.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{tour.slug}</p>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {tour.destination}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDateSafe(tour.startDate)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="w-28">
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {formatNumber(tour.booked)}
                            </span>
                            <span>{formatNumber(tour.capacity)}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn("h-full rounded-full", percent >= 100 ? "bg-danger" : "bg-primary")}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-foreground">{formatPrice(tour.adultPrice)}</td>
                      <td className="py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-lightest hover:text-primary-dark">
                            <Link href={`/tours/${tour.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(tour)}
                            className="h-8 w-8 hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                توری با این مشخصات یافت نشد.
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* دیالوگ تأیید حذف */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف تور</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleteTarget?.title}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              حذف تور
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
