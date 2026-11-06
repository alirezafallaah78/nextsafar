"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Globe, Search, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { listVisas, listVisaCases, visaCaseStatusMap, type VisaRecord } from "@/lib/admin-visas"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export default function VisasPage() {
  const visas = listVisas()
  const cases = listVisaCases()
  const [query, setQuery] = useState("")

  const filtered = visas.filter((v) => {
    const q = query.trim()
    return !q || v.title.includes(q) || v.country.includes(q)
  })

  const activeCases = cases.filter((c) => !["approved", "rejected", "completed", "cancelled"].includes(c.status)).length
  const completedCases = cases.filter((c) => c.status === "completed" || c.status === "approved").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ویزا</h1>
        <p className="mt-1 text-sm text-muted-foreground">مدیریت انواع ویزا و پرونده‌های درخواست</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="انواع ویزا" value={faNum(visas.length)} icon={Globe} accent="blue" />
        <StatCard title="پرونده‌های فعال" value={faNum(activeCases)} icon={FileText} accent="gray" />
        <StatCard title="تکمیل شده" value={faNum(completedCases)} icon={Users} accent="gray" />
      </div>

      <Panel
        title="انواع ویزا (از وردپرس)"
        description={`${faNum(filtered.length)} نوع ویزا`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="جستجو..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-56 rounded-md pr-10" />
          </div>
        }
      >
        <div className="space-y-4">
          {filtered.map((v) => (
            <Link
              key={v.id}
              href={`/visas/${v.id}`}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-card md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{v.title}</span>
                    <Badge variant="secondary">{v.country}</Badge>
                    <Badge variant="outline">{v.source === "wordpress" ? "وردپرس" : "دستی"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{v.shortDescription}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>⏱️ {v.issueTime}</span>
                    <span>📅 اعتبار: {v.validityTime}</span>
                    <span>💰 از {faPrice(v.minPrice || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Badge variant="info">{faNum(v.prices.length)} قیمت</Badge>
                <Badge variant="secondary">{faNum(v.documents.length)} مدرک</Badge>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-muted-foreground">ویزایی یافت نشد.</div>}
        </div>
      </Panel>

      <Panel title="پرونده‌های اخیر" description="آخرین درخواست‌های ویزا">
        <div className="space-y-3">
          {cases.slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{c.customer.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.visaTitle} · {c.createdAt}</p>
                </div>
              </div>
              <Badge variant={visaCaseStatusMap[c.status].variant}>{visaCaseStatusMap[c.status].label}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
