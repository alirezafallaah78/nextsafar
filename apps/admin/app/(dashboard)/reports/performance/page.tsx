"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Target, TrendingUp, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { getPerformanceReport, faNum } from "@/lib/admin-reports"

export default function PerformanceReportPage() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    setData(getPerformanceReport())
  }, [])

  if (!mounted || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-sm">
            <Link href="/reports">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">گزارش عملکرد</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              تحلیل نرخ تبدیل، مقاصد برتر و ضریب اشغال
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="نرخ تبدیل"
          value={`${faNum(data.conversionRate || 0)}٪`}
          icon={Target}
          accent="orange"
        />
        <StatCard
          title="ضریب اشغال تورها"
          value={`${faNum(data.occupancyRate || 0)}٪`}
          icon={Users}
          accent="blue"
        />
        <StatCard
          title="تعداد مقاصد فعال"
          value={faNum(data.activeDestinations || 0)}
          icon={MapPin}
          accent="green"
        />
      </div>

      <Panel title="مقاصد برتر" description="پرطرفدارترین مقاصد">
        <div className="space-y-3">
          {(data.topDestinations || []).map((dest: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{dest.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {faNum(dest.ordersCount)} سفارش
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">
                {faNum(dest.percentage)}٪
              </span>
            </div>
          ))}
          {(!data.topDestinations || data.topDestinations.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              داده‌ای برای نمایش وجود ندارد
            </p>
          )}
        </div>
      </Panel>
    </div>
  )
}
