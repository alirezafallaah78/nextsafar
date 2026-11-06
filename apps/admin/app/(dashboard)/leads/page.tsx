"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Inbox, MessageSquare, Phone, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { leadStatusMap, leadTypeMap, listLeads, type LeadRecord } from "@/lib/admin-leads"
import { faNum } from "@/lib/jalali"

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    setLeads(listLeads())
    setLoading(false)
  }, [])

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = query.trim()
      const matchQ = !q || l.name.includes(q) || l.mobile.includes(q) || l.subject.includes(q)
      const matchS = statusFilter === "all" || l.status === statusFilter
      const matchT = typeFilter === "all" || l.type === typeFilter
      return matchQ && matchS && matchT
    })
  }, [leads, query, statusFilter, typeFilter])

  const newCount = leads.filter((l) => l.status === "new").length
  const contactedCount = leads.filter((l) => l.status === "contacted").length
  const convertedCount = leads.filter((l) => l.status === "converted").length
  const convRate = leads.length ? Math.round((convertedCount / leads.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">درخواست‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">پیگیری لیدها از ثبت تا تبدیل به سفارش</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="درخواست‌های جدید" value={faNum(newCount)} icon={Inbox} accent="blue" />
        <StatCard title="در حال پیگیری" value={faNum(contactedCount)} icon={Phone} accent="gray" />
        <StatCard title="تبدیل شده" value={faNum(convertedCount)} icon={CheckCircle2} accent="gray" />
        <StatCard title="نرخ تبدیل" value={`${faNum(convRate)}٪`} icon={MessageSquare} accent="blue" />
      </div>

      <Panel
        title="لیست درخواست‌ها"
        description={`${faNum(filtered.length)} درخواست`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="جستجو: نام، موبایل، موضوع..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-60 rounded-md pr-10" />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-40">
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(leadStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 w-36">
              <option value="all">همه انواع</option>
              {Object.entries(leadTypeMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => (
              <Link
                key={l.id}
                href={`/leads/${l.id}`}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-card md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{l.name}</span>
                      <span className="font-mono text-xs text-muted-foreground" dir="ltr">{l.mobile}</span>
                      <Badge variant="secondary">{leadTypeMap[l.type]}</Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{l.subject} — {l.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">منبع: {l.source} · {l.createdAt}</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {l.notes.length > 0 && (
                    <span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                      {faNum(l.notes.length)} یادداشت
                    </span>
                  )}
                  <Badge variant={leadStatusMap[l.status].variant}>{leadStatusMap[l.status].label}</Badge>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground">درخواستی یافت نشد.</div>}
          </div>
        )}
      </Panel>
    </div>
  )
}
