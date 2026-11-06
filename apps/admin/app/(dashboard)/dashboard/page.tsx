"use client"

import { useEffect, useState } from "react"
import { FileText, Hotel, Plane, Ticket } from "lucide-react"

import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { UpcomingToursList } from "@/components/dashboard/upcoming-tours"
import { ActivityFeed, LeadMessages, RecentOrders } from "@/components/dashboard/lists"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdminDashboard, type DashboardData } from "@/lib/admin-dashboard"
import { getUpcomingTours, type UpcomingTour } from "@/lib/admin-tours-upcoming"

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [upcoming, setUpcoming] = useState<UpcomingTour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const result = await getAdminDashboard()
        if (!mounted) return
        setData(result)

        const upcomingTours = await getUpcomingTours(7, 4)
        if (!mounted) return
        setUpcoming(upcomingTours)
      } catch (error) {
        console.error("Dashboard load error:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  if (loading || !data) {
    return (
      <div className="grid gap-6 xl:grid-cols-4">
        <div className="space-y-6 xl:col-span-3">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
        <div className="space-y-6 xl:col-span-1">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    )
  }

  const { overview, recentOrders, recentLeads, activity } = data

  const markedTimes = upcoming
    .map((t) => t.time)
    .filter((t): t is number => t !== null)

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      {/* ═══ ستون راست: ۳/۴ ═══ */}
      <div className="space-y-6 xl:col-span-3">
        {/* ۴ کارت آماری */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="تورهای فعال"
            value={formatNumber(overview.activeTours)}
            icon={Plane}
            accent="blue"
          />
          <StatCard
            title="رزروهای تور"
            value={formatNumber(overview.tourBookings)}
            icon={Ticket}
            accent="blue"
          />
          <StatCard
            title="رزروهای ویزا"
            value={formatNumber(overview.visaBookings)}
            icon={FileText}
            accent="gray"
          />
          <StatCard
            title="تمام هتل‌ها"
            value={formatNumber(overview.totalHotels)}
            icon={Hotel}
            accent="gray"
          />
        </div>

        {/* نمودار خطی درآمد با بازه‌ها */}
        <RevenueTrendChart />

        {/* آخرین رزروهای تور */}
        <Panel
          title="آخرین رزروهای تور"
          description="جدیدترین رزروهای ثبت‌شده"
        >
          <RecentOrders orders={recentOrders} />
        </Panel>

        {/* درخواست‌ها + فعالیت‌ها */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="درخواست‌های اخیر" description="لیدها و پیام‌های مشتریان">
            <LeadMessages leads={recentLeads} />
          </Panel>
          <Panel title="فعالیت‌های اخیر" description="رویدادهای سیستم">
            <ActivityFeed items={activity} />
          </Panel>
        </div>
      </div>

      {/* ═══ ستون چپ: ۱/۴ ═══ */}
      <div className="space-y-6 xl:col-span-1">
        <DashboardCalendar markedTimes={markedTimes} />
        <UpcomingToursList tours={upcoming} />
      </div>
    </div>
  )
}
