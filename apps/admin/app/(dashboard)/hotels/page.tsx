"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BedDouble, MapPin, Pencil, Plus, RefreshCw, Search, Star, Trash2 } from "lucide-react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  cities, deleteHotel, hotelStatusMap, listHotels, type HotelRecord,
} from "@/lib/admin-hotels"
import { faNum } from "@/lib/jalali"

function formatPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < count ? "h-3.5 w-3.5 fill-primary text-primary" : "h-3.5 w-3.5 text-border"}
        />
      ))}
    </span>
  )
}

export default function HotelsPage() {
  const { toast } = useToast()
  const [hotels, setHotels] = useState<HotelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<HotelRecord | null>(null)

  const refresh = () => {
    setLoading(true)
    setHotels(listHotels())
    setLoading(false)
  }

  useEffect(refresh, [])

  const filtered = useMemo(() => {
    return hotels.filter((h) => {
      const q = query.trim()
      const matchQ = !q || h.name.includes(q) || h.city.includes(q) || h.slug.includes(q)
      const matchCity = cityFilter === "all" || h.city === cityFilter
      const matchStatus = statusFilter === "all" || h.status === statusFilter
      return matchQ && matchCity && matchStatus
    })
  }, [hotels, query, cityFilter, statusFilter])

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteHotel(deleteTarget.id)
    toast({ title: "هتل حذف شد", description: `«${deleteTarget.name}» حذف شد` })
    setDeleteTarget(null)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">هتل‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت هتل‌های داخلی و خارجی + همگام‌سازی وردپرس
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
            <Link href="/settings/sync">
              <RefreshCw className="ml-2 h-4 w-4" />
              همگام‌سازی وردپرس
            </Link>
          </Button>
          <Button asChild className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
            <Link href="/hotels/new">
              <Plus className="ml-2 h-4 w-4" />
              هتل جدید
            </Link>
          </Button>
        </div>
      </div>

      <Panel
        title="لیست هتل‌ها"
        description={`${faNum(filtered.length)} هتل یافت شد`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجوی هتل یا شهر..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-56 rounded-md pr-10"
              />
            </div>
            <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="h-10 w-36">
              <option value="all">همه شهرها</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-36">
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="pending">در انتظار</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">هتل</th>
                  <th className="pb-3 font-medium">موقعیت</th>
                  <th className="pb-3 font-medium">ستاره</th>
                  <th className="pb-3 font-medium">اتاق‌ها</th>
                  <th className="pb-3 font-medium">بازه قیمت</th>
                  <th className="pb-3 font-medium">منبع</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                  <th className="pb-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => {
                  const status = hotelStatusMap[h.status]
                  return (
                    <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                            <BedDouble className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <Link href={`/hotels/${h.id}/edit`} className="font-bold text-foreground hover:text-primary">
                              {h.name}
                            </Link>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{h.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {h.city}، {h.country}
                        </span>
                      </td>
                      <td className="py-4"><Stars count={h.stars} /></td>
                      <td className="py-4 tabular-nums text-muted-foreground">{faNum(h.roomsCount)}</td>
                      <td className="py-4">
                        <span className="text-xs font-bold text-foreground">{formatPrice(h.priceRange.min)}</span>
                        <span className="mx-1 text-muted-foreground">تا</span>
                        <span className="text-xs text-muted-foreground">{formatPrice(h.priceRange.max)}</span>
                      </td>
                      <td className="py-4">
                        <Badge variant={h.source === "wordpress" ? "info" : "secondary"}>
                          {h.source === "wordpress" ? "وردپرس" : "دستی"}
                        </Badge>
                      </td>
                      <td className="py-4"><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <Link href={`/hotels/${h.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(h)} className="h-8 w-8 text-danger hover:bg-danger/10">
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
              <div className="py-16 text-center text-muted-foreground">هتلی با این مشخصات یافت نشد.</div>
            )}
          </div>
        )}
      </Panel>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف هتل</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleteTarget?.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-danger text-white hover:bg-danger/90">
              حذف هتل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
