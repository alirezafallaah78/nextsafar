"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Search, ShoppingCart, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { listOrders, orderStatusMap, paymentStatusMap, type OrderRecord } from "@/lib/admin-orders"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [payFilter, setPayFilter] = useState("all")

  useEffect(() => {
    setOrders(listOrders())
    setLoading(false)
  }, [])

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = query.trim()
      const matchQ = !q || o.id.includes(q) || o.customer.name.includes(q) || o.tourTitle.includes(q) || o.customer.mobile.includes(q)
      const matchS = statusFilter === "all" || o.status === statusFilter
      const matchP = payFilter === "all" || o.paymentStatus === payFilter
      return matchQ && matchS && matchP
    })
  }, [orders, query, statusFilter, payFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">سفارش‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">مدیریت چرخه کامل سفارش: ثبت، پرداخت، تأیید و انجام</p>
      </div>

      <Panel
        title="لیست سفارش‌ها"
        description={`${faNum(filtered.length)} سفارش یافت شد`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="جستجو: کد، مشتری، تور..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-60 rounded-md pr-10" />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-40">
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(orderStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="h-10 w-40">
              <option value="all">همه پرداخت‌ها</option>
              {Object.entries(paymentStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">کد سفارش</th>
                  <th className="pb-3 font-medium">مشتری</th>
                  <th className="pb-3 font-medium">تور</th>
                  <th className="pb-3 font-medium">تاریخ حرکت</th>
                  <th className="pb-3 font-medium">مبلغ کل</th>
                  <th className="pb-3 font-medium">پرداخت</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-4">
                      <Link href={`/orders/${o.id}`} className="font-mono text-xs font-bold text-primary hover:underline">{o.id}</Link>
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-foreground">{o.customer.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">{o.customer.mobile}</p>
                    </td>
                    <td className="py-4 text-muted-foreground">{o.tourTitle}</td>
                    <td className="py-4">
                      <span className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{o.departureDate}</span>
                    </td>
                    <td className="py-4 font-bold tabular-nums text-foreground">{faPrice(o.totalAmount)}</td>
                    <td className="py-4"><Badge variant={paymentStatusMap[o.paymentStatus].variant}>{paymentStatusMap[o.paymentStatus].label}</Badge></td>
                    <td className="py-4"><Badge variant={orderStatusMap[o.status].variant}>{orderStatusMap[o.status].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground">سفارشی یافت نشد.</div>}
          </div>
        )}
      </Panel>
    </div>
  )
}
