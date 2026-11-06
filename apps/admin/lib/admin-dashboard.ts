import { api } from "@/lib/api"

/* ═══ Types ═══ */

export interface DashboardData {
  overview: {
    activeTours: number
    tourBookings: number
    visaBookings: number
    totalHotels: number
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    activeVisaCases: number
  }
  recentOrders: any[]
  recentLeads: any[]
  activity: any[]
}

export type RevenueRange = "weekly" | "monthly" | "yearly"

export interface RevenuePoint {
  label: string
  value: number
  date: string
}

export interface RevenueRangeOption {
  value: RevenueRange
  label: string
}

/* ═══ Constants ═══ */

export const revenueRanges: RevenueRangeOption[] = [
  { value: "weekly", label: "هفته اخیر" },
  { value: "monthly", label: "ماه اخیر" },
  { value: "yearly", label: "سال اخیر" },
]

/* ═══ Dashboard Stats ═══ */

export async function getAdminDashboard(): Promise<DashboardData> {
  try {
    const response = await api.get("/admin/dashboard")
    const data = response.data?.data || response.data

    return {
      overview: {
        totalUsers: data.overview?.totalUsers || 0,
        totalOrders: data.overview?.totalOrders || 0,
        totalRevenue: data.overview?.totalRevenue || 0,
        pendingOrders: data.overview?.pendingOrders || 0,
        activeVisaCases: data.overview?.activeVisaCases || 0,
        totalHotels: data.overview?.totalHotels || 0,
        activeTours: data.overview?.totalTours || 0,
        tourBookings: data.overview?.totalOrders || 0,
        visaBookings: data.overview?.activeVisaCases || 0,
      },
      recentOrders: data.recentOrders || [],
      recentLeads: data.recentLeads || [],
      activity: data.activity || [],
    }
  } catch (error) {
    console.error("getAdminDashboard error:", error)
    return {
      overview: {
        activeTours: 0,
        tourBookings: 0,
        visaBookings: 0,
        totalHotels: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        activeVisaCases: 0,
      },
      recentOrders: [],
      recentLeads: [],
      activity: [],
    }
  }
}

/* ═══ Revenue Series ═══ */

/**
 * تولید داده‌های سری درآمد برای نمودار
 * در فاز فعلی داده‌های نمونه برمی‌گرداند
 * در آینده به /admin/reports/revenue متصل می‌شود
 */
export async function getRevenueSeries(range: RevenueRange): Promise<RevenuePoint[]> {
  try {
    // تلاش برای دریافت از API
    const response = await api.get("/admin/reports/revenue", {
      params: { range },
    })

    const data = response.data?.data || response.data

    // اگر API داده معتبر برگرداند
    if (Array.isArray(data) && data.length > 0) {
      return data.map((point: any) => ({
        label: point.label || point.date || "",
        value: Number(point.value || point.revenue || point.amount || 0),
        date: point.date || point.label || "",
      }))
    }
  } catch (error) {
    // API ممکن است پیاده‌سازی نشده باشد یا خطا دهد
    console.warn("Revenue API not ready, using fallback data")
  }

  // Fallback: داده‌های نمونه برای نمایش
  return generateFallbackRevenueData(range)
}

/**
 * تولید داده‌های نمونه برای نمودار درآمد
 */
function generateFallbackRevenueData(range: RevenueRange): RevenuePoint[] {
  const now = new Date()
  const points: RevenuePoint[] = []

  if (range === "weekly") {
    // 7 روز اخیر
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayName = date.toLocaleDateString("fa-IR", { weekday: "short" })
      points.push({
        label: dayName,
        value: Math.floor(Math.random() * 50000000) + 10000000,
        date: date.toISOString().split("T")[0],
      })
    }
  } else if (range === "monthly") {
    // 30 روز اخیر (نمایش هفتگی)
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i * 7)
      const weekStart = new Date(date)
      weekStart.setDate(weekStart.getDate() - 6)
      points.push({
        label: `هفته ${4 - i}`,
        value: Math.floor(Math.random() * 200000000) + 50000000,
        date: weekStart.toISOString().split("T")[0],
      })
    }
  } else if (range === "yearly") {
    // 12 ماه اخیر
    const monthNames = [
      "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
    ]
    const currentMonth = now.getMonth()
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      points.push({
        label: monthNames[monthIndex],
        value: Math.floor(Math.random() * 500000000) + 100000000,
        date: `${now.getFullYear()}-${String(monthIndex + 1).padStart(2, "0")}-01`,
      })
    }
  }

  return points
}

/**
 * Sync version برای سازگاری با کد قدیمی
 */
export function getRevenueSeriesSync(range: RevenueRange): RevenuePoint[] {
  return generateFallbackRevenueData(range)
}
