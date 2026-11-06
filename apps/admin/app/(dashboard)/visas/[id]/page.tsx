"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, CalendarDays, Check, Clock, DollarSign, FileText, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { getVisa, type VisaRecord } from "@/lib/admin-visas"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export default function VisaDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [visa, setVisa] = useState<VisaRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useState(() => {
    setVisa(getVisa(id))
    setLoading(false)
  })

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />

  if (!visa) {
    return (
      <div className="rounded-lg border border-border bg-card p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">ویزا یافت نشد</h2>
        <Button asChild className="mt-6 rounded-sm"><Link href="/visas">بازگشت</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-sm"><Link href="/visas"><ArrowRight className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            {visa.title}
            <Badge variant="secondary">{visa.country}</Badge>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{visa.shortDescription}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ستون اصلی */}
        <div className="space-y-6 xl:col-span-2">
          <Panel title="اطلاعات پایه">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  زمان اخذ
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">{visa.issueTime}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  اعتبار ویزا
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">{visa.validityTime}</p>
              </div>
            </div>
          </Panel>

          <Panel title="قیمت‌ها" description={`${faNum(visa.prices.length)} نوع قیمت`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-right text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 font-medium">نوع ویزا</th>
                    <th className="pb-3 font-medium">مدت</th>
                    <th className="pb-3 font-medium">شخص</th>
                    <th className="pb-3 font-medium">قیمت</th>
                  </tr>
                </thead>
                <tbody>
                  {visa.prices.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 font-bold text-foreground">{p.type}</td>
                      <td className="py-3 text-muted-foreground">{p.duration}</td>
                      <td className="py-3">
                        <Badge variant={p.person === "بزرگسال" ? "info" : "secondary"}>{p.person}</Badge>
                      </td>
                      <td className="py-3 font-bold tabular-nums text-primary">{faPrice(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="مدارک مورد نیاز" description={`${faNum(visa.documents.length)} مدرک`}>
            <div className="space-y-2">
              {visa.documents.map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
                  <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm ${d.required ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {d.required && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{d.name}</p>
                    {d.description && <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* ستون کناری */}
        <Panel title="خلاصه">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">کشور:</span><span className="font-bold text-foreground">{visa.country}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">منبع:</span><Badge variant="secondary">{visa.source === "wordpress" ? "وردپرس" : "دستی"}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">کمترین قیمت:</span><span className="font-bold text-primary">{faPrice(visa.minPrice || 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">تعداد قیمت‌ها:</span><span className="font-bold text-foreground">{faNum(visa.prices.length)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">مدارک اجباری:</span><span className="font-bold text-foreground">{faNum(visa.documents.filter((d) => d.required).length)}</span></div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
