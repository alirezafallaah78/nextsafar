"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { getSalesReport, faNum, faPrice } from "@/lib/admin-reports"

export default function SalesReportPage() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    setData(getSalesReport())
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg bg-muted" />
          <div className="h-80 animate-pulse rounded-lg bg-muted" />
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
            <h1 className="text-2xl font-bold text-foreground">گزارش فروش</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              تحلیل درآمد، تعداد سفارش‌ها و تورهای پرفروش
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل فروش"
          value={faPrice(data.totalRevenue || 0)}
          icon={DollarSign}
          accent="green"
          trend={{ value: data.revenueTrend || 0, isPositive: true }}
        />
        <StatCard
          title="تعداد سفارش‌ها"
          value={faNum(data.totalOrders || 0)}
          icon={ShoppingCart}
          accent="blue"
          trend={{ value: data.ordersTrend || 0, isPositive: true }}
        />
        <StatCard
          title="میانگین سفارش"
          value={faPrice(data.averageOrder || 0)}
          icon={BarChart3}
          accent="purple"
        />
        <StatCard
          title="نرخ رشد"
          value={`${faNum(data.growthRate || 0)}٪`}
          icon={TrendingUp}
          accent="orange"
        />
      </div>

      {/* Top Tours */}
      <Panel title="تورهای پرفروش" description="۵ تور برتر از نظر فروش">
        <div className="space-y-3">
          {(data.topTours || []).map((tour: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{tour.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {faNum(tour.ordersCount)} سفارش
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-primary">
                {faPrice(tour.revenue)}
              </p>
            </div>
          ))}
          {(!data.topTours || data.topTours.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              داده‌ای برای نمایش وجود ندارد
            </p>
          )}
        </div>
      </Panel>
    </div>
  )
}
