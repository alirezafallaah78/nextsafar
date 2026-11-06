"use client"

import { useMemo, useState } from "react"
import * as faCal from "date-fns-jalali"
import * as enCal from "date-fns"
import { faIR } from "date-fns-jalali/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { faNum, formatJalaliDate, todayStart } from "@/lib/jalali"

const WD_FA = ["ش", "ی", "د", "س", "چ", "پ", "ج"]
const WD_EN = ["S", "M", "T", "W", "T", "F", "S"]

function monthCells(m: Date, cal: any, satStart: boolean): (Date | null)[] {
  const start = cal.startOfMonth(m)
  const count = cal.getDate(cal.endOfMonth(m))
  const offset = satStart ? (cal.getDay(start) + 1) % 7 : cal.getDay(start)
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= count; d++) cells.push(cal.setDate(start, d))
  return cells
}

interface DashboardCalendarProps {
  markedTimes?: number[]
}

export function DashboardCalendar({ markedTimes = [] }: DashboardCalendarProps) {
  const [calendar, setCalendar] = useState<"fa" | "en">("fa")
  const today = useMemo(() => todayStart(), [])
  const [viewMonth, setViewMonth] = useState<Date>(() => faCal.startOfMonth(today))
  const [selected, setSelected] = useState<Date | null>(today)

  const cal = calendar === "fa" ? faCal : enCal
  const cells = useMemo(
    () => monthCells(viewMonth, cal, calendar === "fa"),
    [viewMonth, calendar]
  )

  const markedSet = useMemo(() => {
    const s = new Set<number>()
    markedTimes.forEach((t) => {
      const d = new Date(t)
      d.setHours(0, 0, 0, 0)
      s.add(d.getTime())
    })
    return s
  }, [markedTimes])

  const switchCalendar = () => {
    const next = calendar === "fa" ? "en" : "fa"
    setCalendar(next)
    setViewMonth((next === "fa" ? faCal : enCal).startOfMonth(viewMonth))
  }

  const monthLabel =
    calendar === "fa"
      ? faCal.format(viewMonth, "MMMM yyyy", { locale: faIR })
      : enCal.format(viewMonth, "MMMM yyyy")

  const selectedLabel = selected
    ? calendar === "fa"
      ? formatJalaliDate(selected)
      : enCal.format(selected, "yyyy/MM/dd")
    : ""

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="ماه قبل"
            onClick={() => setViewMonth(cal.addMonths(viewMonth, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h3 className="min-w-[104px] text-center text-sm font-bold text-foreground">
            {monthLabel}
          </h3>
          <button
            type="button"
            aria-label="ماه بعد"
            onClick={() => setViewMonth(cal.addMonths(viewMonth, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={switchCalendar}
          className="rounded-sm bg-muted px-2.5 py-1.5 text-[11px] font-bold text-foreground transition hover:bg-accent"
        >
          {calendar === "fa" ? "میلادی" : "شمسی"}
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="grid grid-cols-7">
          {(calendar === "fa" ? WD_FA : WD_EN).map((w, i) => (
            <div
              key={i}
              className="flex h-7 items-center justify-center text-[11px] font-bold text-muted-foreground"
            >
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={`b${i}`} className="h-9" />
            const t = d.getTime()
            const isToday = t === today.getTime()
            const isSelected = !!selected && t === selected.getTime()
            const isMarked = markedSet.has(t)

            return (
              <div key={i} className="flex h-9 items-center justify-center">
                <button
                  type="button"
                  onClick={() => setSelected(d)}
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-sm text-sm transition",
                    isSelected
                      ? "bg-primary font-bold text-primary-foreground shadow"
                      : isToday
                      ? "border-2 border-primary font-bold text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {calendar === "fa" ? faNum(cal.getDate(d)) : cal.getDate(d)}
                  {isMarked && !isSelected && (
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => {
            setSelected(today)
            setViewMonth(cal.startOfMonth(today))
          }}
          className="text-xs font-bold text-primary hover:text-primary/80"
        >
          برو به امروز
        </button>
        <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
          {selectedLabel}
        </span>
      </div>
    </div>
  )
}
