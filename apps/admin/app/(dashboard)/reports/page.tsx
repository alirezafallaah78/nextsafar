"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BarChart3, DollarSign, LineChart, TrendingUp } from "lucide-react"

import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { getFinancialReport, getPerformanceReport, getSalesReport, faNum, faPrice } from "@/lib/admin-reports"

const reports = [
  {
    href: "/reports/sales",
    title: "گزارش فروش",
    description: "درآمد، تعداد سفارش‌ها، تورهای پرفروش و روند فروش",
    icon: LineChart,
    color: "from-primary to-primary-dark",
  },
  {
    href: "/reports/financial",
    title: "گزارش مالی",
    description: "پرداخت‌های موفق، استردادها، درآمد خالص و در انتظار",
    icon: DollarSign,
    color: "from-success to-emerald-600",
  },
  {
    href: "/reports/performance",
    title: "گزارش عملکرد",
    description: "نرخ تبدیل لیدها، مقاصد برتر و ضریب اشغال تورها",
    icon: TrendingUp,
    color: "from-warning to-amber-600",
  },
]

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [salesData, setSalesData] = useState<any>(null)
  const [financialData, setFinancialData] = useState<any>(null)
  const [performanceData, setPerformanceData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    setSalesData(getSalesReport())
    setFinancialData(getFinancialReport())
    setPerformanceData(getPerformanceReport())
  }, [])

  // Skeleton در زمان SSR - جلوگیری از hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">گزارش‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">گزارش‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          گزارش‌های جامع فروش، مالی و عملکرد
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل فروش"
          value={faPrice(salesData?.totalRevenue || 0)}
          icon={DollarSign}
          accent="green"
          trend={{ value: salesData?.revenueTrend || 0, isPositive: true }}
        />
        <StatCard
          title="تعداد سفارش‌ها"
          value={faNum(salesData?.totalOrders || 0)}
          icon={BarChart3}
          accent="blue"
          trend={{ value: salesData?.ordersTrend || 0, isPositive: true }}
        />
        <StatCard
          title="پرداخت‌های موفق"
          value={faPrice(financialData?.successfulPayments || 0)}
          icon={DollarSign}
          accent="green"
        />
        <StatCard
          title="نرخ تبدیل"
          value={`${faNum(performanceData?.conversionRate || 0)}٪`}
          icon={TrendingUp}
          accent="orange"
        />
      </div>

      {/* Report Cards */}
      <Panel title="گزارش‌های تفصیلی" description="برای مشاهده جزئیات روی هر گزارش کلیک کنید">
        <div className="grid gap-6 md:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon
            return (
              <Link
                key={report.href}
                href={report.href}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${report.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary">
                  {report.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {report.description}
                </p>
                <div className="mt-4 text-xs font-bold text-primary">
                  مشاهده گزارش ←
                </div>
              </Link>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
