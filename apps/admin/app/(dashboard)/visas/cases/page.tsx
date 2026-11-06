"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { FileText, Search, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { listVisaCases, visaCaseStatusMap, type VisaCaseRecord, type VisaCaseStatus } from "@/lib/admin-visas"
import { faNum } from "@/lib/jalali"

export default function VisaCasesPage() {
  const [cases, setCases] = useState<VisaCaseRecord[]>([])
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => setCases(listVisaCases()), [])

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const q = query.trim()
      const matchQ = !q || c.customer.name.includes(q) || c.customer.mobile.includes(q) || c.visaTitle.includes(q)
      const matchS = statusFilter === "all" || c.status === statusFilter
      return matchQ && matchS
    })
  }, [cases, query, statusFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">پرونده‌های ویزا</h1>
        <p className="mt-1 text-sm text-muted-foreground">پیگیری درخواست‌های ویزا از ثبت تا تکمیل</p>
      </div>

      <Panel
        title="لیست پرونده‌ها"
        description={`${faNum(filtered.length)} پرونده`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="جستجو..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-56 rounded-md pr-10" />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-40">
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(visaCaseStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">کد پرونده</th>
                <th className="pb-3 font-medium">مشتری</th>
                <th className="pb-3 font-medium">ویزا</th>
                <th className="pb-3 font-medium">مسافران</th>
                <th className="pb-3 font-medium">مبلغ</th>
                <th className="pb-3 font-medium">کارشناس</th>
                <th className="pb-3 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-4">
                    <Link href={`/visas/cases/${c.id}`} className="font-mono text-xs font-bold text-primary hover:underline">{c.id}</Link>
                  </td>
                  <td className="py-4">
                    <p className="font-bold text-foreground">{c.customer.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">{c.customer.mobile}</p>
                  </td>
                  <td className="py-4 text-muted-foreground">{c.visaTitle}</td>
                  <td className="py-4 tabular-nums text-muted-foreground">{faNum(c.passengers)}</td>
                  <td className="py-4 font-bold tabular-nums text-foreground">{faPrice(c.totalAmount)}</td>
                  <td className="py-4 text-xs text-muted-foreground">{c.assignedAgent || "—"}</td>
                  <td className="py-4"><Badge variant={visaCaseStatusMap[c.status].variant}>{visaCaseStatusMap[c.status].label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground">پرونده‌ای یافت نشد.</div>}
        </div>
      </Panel>
    </div>
  )
}

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}
