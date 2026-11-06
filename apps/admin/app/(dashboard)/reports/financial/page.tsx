"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { getFinancialReport, faNum, faPrice } from "@/lib/admin-reports"

export default function FinancialReportPage() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    setData(getFinancialReport())
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
            <h1 className="text-2xl font-bold text-foreground">گزارش مالی</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              تحلیل پرداخت‌ها، استردادها و درآمد خالص
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="پرداخت‌های موفق"
          value={faPrice(data.successfulPayments || 0)}
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          title="استردادها"
          value={faPrice(data.refunds || 0)}
          icon={TrendingDown}
          accent="red"
        />
        <StatCard
          title="درآمد خالص"
          value={faPrice(data.netIncome || 0)}
          icon={DollarSign}
          accent="blue"
        />
        <StatCard
          title="در انتظار پرداخت"
          value={faPrice(data.pending || 0)}
          icon={Wallet}
          accent="yellow"
        />
      </div>

      <Panel title="جزئیات مالی" description="خلاصه تراکنش‌ها">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">تعداد تراکنش‌ها</p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {faNum(data.totalTransactions || 0)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">نرخ موفقیت</p>
            <p className="mt-1 text-2xl font-extrabold text-success">
              {faNum(data.successRate || 0)}٪
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
