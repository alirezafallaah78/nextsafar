import { api } from "@/lib/api"
import { parseJalaliDate, todayStart } from "./jalali"

export interface UpcomingTour {
  id: string
  title: string
  slug: string
  destination: string
  startDate?: string
  endDate?: string
  capacity: number
  booked: number
  adultPrice: number
  time: number | null
  end: number | null
  daysUntil: number | null
  inProgress: boolean
  status: string
}

function parseAnyTime(value?: string): number | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    }
  }
  const j = parseJalaliDate(value)
  if (j) {
    const d = new Date(j)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  return null
}

/**
 * دریافت تورهای پیش رو از API
 * ✅ متصل به /admin/tours
 */
export async function getUpcomingTours(
  days: number = 7,
  count: number = 4
): Promise<UpcomingTour[]> {
  const today = todayStart()
  const fromTs = today.getTime()
  const toTs = fromTs + days * 86_400_000

  try {
    const response = await api.get("/admin/tours", {
      params: { limit: 100, status: "PUBLISHED" },
    })

    const allTours = response.data?.data || []

    return allTours
      .map((tour: any) => {
        const dates = tour.dates || []
        const activeDates = dates
          .filter((d: any) => d.status === "ACTIVE")
          .sort(
            (a: any, b: any) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )

        const nextDate = activeDates[0]
        if (!nextDate) return null

        const start = parseAnyTime(nextDate.startDate)
        const end = parseAnyTime(nextDate.endDate) ?? start
        const inProgress =
          start !== null && end !== null && start <= fromTs && end >= fromTs

        return {
          id: tour.id,
          title: tour.title,
          slug: tour.slug,
          destination: tour.destination?.name || "",
          startDate: nextDate.startDate,
          endDate: nextDate.endDate,
          capacity: nextDate.totalCapacity || 0,
          booked:
            (nextDate.totalCapacity || 0) - (nextDate.remainingCapacity || 0),
          adultPrice: Number(nextDate.adultPrice) || 0,
          time: start,
          end,
          inProgress,
          daysUntil:
            start !== null
              ? Math.ceil((start - fromTs) / 86_400_000)
              : null,
          status: tour.status,
        }
      })
      .filter((t: any): t is UpcomingTour => t !== null)
      .filter((t: UpcomingTour) => {
        if (t.time === null) return false
        const ts = t.time as number
        return (ts >= fromTs && ts <= toTs) || t.inProgress
      })
      .sort((a, b) => (a.time as number) - (b.time as number))
      .slice(0, count)
  } catch (error) {
    console.error("getUpcomingTours error:", error)
    return []
  }
}
