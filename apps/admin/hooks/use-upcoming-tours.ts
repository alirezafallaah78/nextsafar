"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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
  daysUntil: number | null
  inProgress: boolean
  status: string
}

/**
 * Hook برای دریافت تورهای پیش رو
 * @param days - تعداد روزهای آینده (پیش‌فرض 7)
 * @param limit - تعداد تورها (پیش‌فرض 4)
 */
export function useUpcomingTours(days: number = 7, limit: number = 4) {
  const [tours, setTours] = useState<UpcomingTour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadUpcoming = async () => {
      try {
        setLoading(true)
        setError(null)

        // دریافت همه تورهای PUBLISHED و SELLING
        const response = await api.get("/admin/tours", {
          params: { limit: 100, status: "PUBLISHED" },
        })

        const allTours = response.data?.data || []
        const now = new Date()
        const futureLimit = new Date()
        futureLimit.setDate(futureLimit.getDate() + days)

        // پردازش تورها و پیدا کردن nextDate
        const upcomingTours: UpcomingTour[] = allTours
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

            const startDate = new Date(nextDate.startDate)
            const endDate = new Date(nextDate.endDate)

            // بررسی آیا در محدوده زمانی مورد نظر است
            if (endDate < now) return null
            if (startDate > futureLimit) return null

            const daysUntil = Math.ceil(
              (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
            const inProgress = startDate <= now && endDate >= now

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
              daysUntil: inProgress ? 0 : daysUntil,
              inProgress,
              status: tour.status,
            }
          })
          .filter((t: any): t is UpcomingTour => t !== null)
          .sort((a, b) => {
            // اول in-progress، سپس بر اساس daysUntil
            if (a.inProgress && !b.inProgress) return -1
            if (!a.inProgress && b.inProgress) return 1
            return (a.daysUntil || 0) - (b.daysUntil || 0)
          })
          .slice(0, limit)

        setTours(upcomingTours)
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "خطا در دریافت تورها"
        console.error("useUpcomingTours error:", err)
        setError(msg)
        setTours([])
      } finally {
        setLoading(false)
      }
    }

    loadUpcoming()
  }, [days, limit, toast])

  return { tours, loading, error }
}
