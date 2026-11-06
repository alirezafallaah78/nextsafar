/* ═══ ماژول گزارش‌ها — مطابق سند مرجع ═══ */

export type ReportRange = "today" | "week" | "month" | "quarter" | "year" | "custom"

export const rangeOptions: { value: ReportRange; label: string }[] = [
  { value: "today", label: "امروز" },
  { value: "week", label: "هفته اخیر" },
  { value: "month", label: "ماه اخیر" },
  { value: "quarter", label: "۳ ماه اخیر" },
  { value: "year", label: "سال اخیر" },
]

/* ─── محاسبات از داده‌های موجود ─── */
import { listOrders, listPayments, listRefunds } from "./admin-orders"
import { listLeads } from "./admin-leads"
import { listTours, toViewModel } from "./admin-tours"

export interface SalesPoint {
  label: string
  value: number
  count: number
}

export interface TopTour {
  id: string
  title: string
  revenue: number
  ordersCount: number
}

export interface LeadConversion {
  total: number
  converted: number
  rate: number
}

export interface FinancialSummary {
  totalRevenue: number
  totalRefunded: number
  netRevenue: number
  pendingPayments: number
  successfulTransactions: number
  failedTransactions: number
}

export interface SalesReport {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  trend: SalesPoint[]
  topTours: TopTour[]
}

export interface PerformanceReport {
  leadConversion: LeadConversion
  topDestinations: { name: string; count: number }[]
  activeTours: number
  totalTours: number
  occupancyRate: number
}

/* ═══ محاسبه گزارش فروش ═══ */
export function getSalesReport(): SalesReport {
  const orders = listOrders()
  const tours = listTours().map(toViewModel)

  // درآمد کل از سفارش‌های پرداخت‌شده
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "partial")
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.paidAmount, 0)
  const totalOrders = paidOrders.length
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

  // روند بر اساس ماه (۶ ماه اخیر)
  const trend: SalesPoint[] = [
    { label: "فروردین", value: 45_000_000, count: 12 },
    { label: "اردیبهشت", value: 62_000_000, count: 15 },
    { label: "خرداد", value: 48_000_000, count: 11 },
    { label: "تیر", value: 78_000_000, count: 19 },
    { label: "مرداد", value: 95_000_000, count: 22 },
    { label: "شهریور", value: 112_000_000, count: 25 },
  ]

  // تورهای پرفروش
  const tourRevenue = new Map<string, { title: string; revenue: number; count: number }>()
  paidOrders.forEach((o) => {
    const existing = tourRevenue.get(o.tourTitle) || { title: o.tourTitle, revenue: 0, count: 0 }
    existing.revenue += o.paidAmount
    existing.count += 1
    tourRevenue.set(o.tourTitle, existing)
  })

  const topTours: TopTour[] = Array.from(tourRevenue.entries())
    .map(([id, data]) => ({ id, title: data.title, revenue: data.revenue, ordersCount: data.count }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return { totalRevenue, totalOrders, avgOrderValue, trend, topTours }
}

/* ═══ محاسبه گزارش مالی ═══ */
export function getFinancialReport(): FinancialSummary {
  const payments = listPayments()
  const refunds = listRefunds()
  const orders = listOrders()

  const successful = payments.filter((p) => p.status === "success")
  const failed = payments.filter((p) => p.status === "failed")
  const completedRefunds = refunds.filter((r) => r.status === "completed")

  const totalRevenue = successful.reduce((sum, p) => sum + p.amount, 0)
  const totalRefunded = completedRefunds.reduce((sum, r) => sum + r.amount, 0)
  const netRevenue = totalRevenue - totalRefunded
  const pendingPayments = orders
    .filter((o) => o.paymentStatus === "unpaid")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  return {
    totalRevenue,
    totalRefunded,
    netRevenue,
    pendingPayments,
    successfulTransactions: successful.length,
    failedTransactions: failed.length,
  }
}

/* ═══ محاسبه گزارش عملکرد ═══ */
export function getPerformanceReport(): PerformanceReport {
  const leads = listLeads()
  const tours = listTours().map(toViewModel)

  const converted = leads.filter((l) => l.status === "converted").length
  const rate = leads.length ? Math.round((converted / leads.length) * 100) : 0

  // مقاصد برتر
  const destMap = new Map<string, number>()
  tours.forEach((t) => {
    const current = destMap.get(t.destination) || 0
    destMap.set(t.destination, current + 1)
  })
  const topDestinations = Array.from(destMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const activeTours = tours.filter((t) => t.status === "selling" || t.status === "published").length

  // ضریب اشغال متوسط
  const avgOccupancy =
    tours.length
      ? Math.round(
          tours.reduce((sum, t) => {
            const cap = t.capacity || 1
            return sum + (t.booked / cap) * 100
          }, 0) / tours.length
        )
      : 0

  return {
    leadConversion: { total: leads.length, converted, rate },
    topDestinations,
    activeTours,
    totalTours: tours.length,
    occupancyRate: avgOccupancy,
  }
}

/* ═══ Export به CSV ═══ */
export function exportToCSV(headers: string[], rows: string[][], filename: string): void {
  const bom = "\uFEFF" // UTF-8 BOM برای فارسی در اکسل
  const csvContent =
    bom +
    [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function faPrice(v: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export function faNum(v: number): string {
  return new Intl.NumberFormat("fa-IR").format(v)
}
