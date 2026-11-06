"use client"

import Link from "next/link"
import { CalendarDays, MapPin, Plane } from "lucide-react"
import { Panel } from "./panel"
import { formatDateSafe } from "@/lib/admin-tours"
import type { UpcomingTour } from "@/lib/admin-tours-upcoming"
import { faNum } from "@/lib/jalali"
import { cn } from "@/lib/utils"

export function UpcomingToursList({ tours }: { tours: UpcomingTour[] }) {
  return (
    <Panel title="تورهای پیش رو" description="تورهای ۷ روز آینده">
      {tours.length === 0 ? (
        <div className="py-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Plane className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold text-foreground">
            توری در هفته آینده نیست
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            تورهای فعال در ۷ روز آینده برنامه‌ریزی نشده‌اند.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((t) => {
            const percent = t.capacity
              ? Math.min(100, Math.round((t.booked / t.capacity) * 100))
              : 0
            return (
              <Link
                key={t.id}
                href={`/tours/${t.id}/edit`}
                className="block rounded-lg border border-border bg-background p-3 transition hover:border-primary/50 hover:shadow-card"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-11 w-11 flex-shrink-0 rounded-md bg-gradient-to-br from-primary to-primary-dark" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {t.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {t.destination}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1 text-[11px] font-bold text-primary">
                        <CalendarDays className="h-3 w-3" />
                        {formatDateSafe(t.startDate)}
                      </p>
                      {t.inProgress ? (
                        <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          در حال اجرا
                        </span>
                      ) : t.daysUntil !== null ? (
                        <span
                          className={cn(
                            "rounded-sm px-2 py-0.5 text-[10px] font-bold",
                            t.daysUntil <= 3
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {t.daysUntil === 0 ? "امروز" : `${faNum(t.daysUntil)} روز دیگر`}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        percent >= 100 ? "bg-muted-foreground" : "bg-primary"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {faNum(t.booked)}/{faNum(t.capacity)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
