"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { listPayments, paymentStateMap, type PaymentRecord } from "@/lib/admin-orders"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => setPayments(listPayments()), [])

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const q = query.trim()
      const matchQ = !q || p.id.includes(q) || p.orderId.includes(q) || p.trackingCode.includes(q)
      const matchS = statusFilter === "all" || p.status === statusFilter
      return matchQ && matchS
    })
  }, [payments, query, statusFilter])

  const successSum = payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0)
  const successCount = payments.filter((p) => p.status === "success").length
  const failedCount = payments.filter((p) => p.status === "failed").length
  const pendingCount = payments.filter((p) => p.status === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">پرداخت‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">تمام تراکنش‌های درگاه پرداخت با کد رهگیری</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="مجموع پرداخت موفق" value={faPrice(successSum)} icon={CreditCard} accent="blue" />
        <StatCard title="تراکنش‌های موفق" value={faNum(successCount)} icon={CheckCircle2} accent="gray" />
        <StatCard title="ناموفق / در انتظار" value={`${faNum(failedCount)} / ${faNum(pendingCount)}`} icon={XCircle} accent="gray" />
      </div>

      <Panel
        title="لیست تراکنش‌ها"
        description={`${faNum(filtered.length)} تراکنش`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="جستجو: کد پرداخت، سفارش، رهگیری..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-64 rounded-md" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-36">
              <option value="all">همه</option>
              {Object.entries(paymentStateMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">کد پرداخت</th>
                <th className="pb-3 font-medium">سفارش</th>
                <th className="pb-3 font-medium">مبلغ</th>
                <th className="pb-3 font-medium">درگاه</th>
                <th className="pb-3 font-medium">کد رهگیری</th>
                <th className="pb-3 font-medium">تاریخ</th>
                <th className="pb-3 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-4 font-mono text-xs font-bold text-foreground">{p.id}</td>
                  <td className="py-4">
                    <Link href={`/orders/${p.orderId}`} className="font-mono text-xs font-bold text-primary hover:underline">{p.orderId}</Link>
                  </td>
                  <td className="py-4 font-bold tabular-nums text-foreground">{faPrice(p.amount)}</td>
                  <td className="py-4 text-muted-foreground">{p.gateway === "zarinpal" ? "زرین‌پال" : "درگاه تست"}</td>
                  <td className="py-4 font-mono text-xs text-muted-foreground">{p.trackingCode}</td>
                  <td className="py-4 text-xs text-muted-foreground">{p.createdAt}</td>
                  <td className="py-4"><Badge variant={paymentStateMap[p.status].variant}>{paymentStateMap[p.status].label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground">تراکنشی یافت نشد.</div>}
        </div>
      </Panel>
    </div>
  )
}
