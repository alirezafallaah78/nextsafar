"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import * as faCal from "date-fns-jalali"
import * as enCal from "date-fns"
import { faIR } from "date-fns-jalali/locale"
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatJalaliDate, formatJalaliLong, faNum, todayStart } from "@/lib/jalali"

export interface CalRange {
  from: Date | null
  to: Date | null
}

const WD_FA = ["ش", "ی", "د", "س", "چ", "پ", "ج"]
const WD_EN = ["S", "M", "T", "W", "T", "F", "S"]

const P100 = "#e8f5fe" // blue-100

function monthCells(m: Date, cal: any, satStart: boolean): (Date | null)[] {
  const start = cal.startOfMonth(m)
  const count = cal.getDate(cal.endOfMonth(m))
  const offset = satStart ? (cal.getDay(start) + 1) % 7 : cal.getDay(start)
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= count; d++) cells.push(cal.setDate(start, d))
  return cells
}

interface PersianDatePickerProps {
  mode?: "range" | "single"
  value: CalRange | Date | null
  onChange: (value: CalRange | Date | null) => void
  placeholder?: string
  fromLabel?: string
  toLabel?: string
  minDate?: Date
  maxDate?: Date
  showNights?: boolean
  className?: string
  disabled?: boolean
}

export function PersianDatePicker({
  mode = "single",
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  fromLabel = "از تاریخ",
  toLabel = "تا تاریخ",
  minDate,
  maxDate,
  showNights = true,
  className,
  disabled = false,
}: PersianDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [calendar, setCalendar] = useState<"fa" | "en">("fa")
  const [pending, setPending] = useState<CalRange>(
    value instanceof Date
      ? { from: value, to: null }
      : value || { from: null, to: null }
  )
  const [hover, setHover] = useState<Date | null>(null)

  const cal = calendar === "fa" ? faCal : enCal
  const today = useMemo(() => todayStart(), [])
  const effMin = minDate ?? today
  const effMax = maxDate ?? null

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const initialDate = pending.from ?? effMax ?? today
    return faCal.startOfMonth(initialDate)
  })

  // Sync value -> pending when value changes externally
  useEffect(() => {
    if (value instanceof Date) {
      setPending({ from: value, to: null })
    } else if (value) {
      setPending(value)
    }
  }, [value])

  const atMinMonth = viewMonth.getTime() <= cal.startOfMonth(effMin).getTime()
  const atMaxMonth = effMax ? viewMonth.getTime() >= cal.startOfMonth(effMax).getTime() : false

  const switchCalendar = (c: "fa" | "en") => {
    setCalendar(c)
    const nc = c === "fa" ? faCal : enCal
    setViewMonth(nc.startOfMonth(viewMonth))
  }

  const goToday = () =>
    setViewMonth(cal.startOfMonth(effMax && today.getTime() > effMax.getTime() ? effMax : today))

  const pick = (day: Date) => {
    let next: CalRange
    if (mode === "single") {
      next = { from: day, to: null }
    } else if (!pending.from || (pending.from && pending.to)) {
      next = { from: day, to: null }
    } else if (day.getTime() < pending.from.getTime()) {
      next = { from: day, to: null }
    } else {
      next = { from: pending.from, to: day }
    }
    setPending(next)
  }

  const confirm = () => {
    if (mode === "single") {
      onChange(pending.from)
    } else {
      onChange(pending)
    }
    setOpen(false)
  }

  const clear = () => {
    setPending({ from: null, to: null })
    onChange(mode === "single" ? null : { from: null, to: null })
    setOpen(false)
  }

  const preview: CalRange = useMemo(() => {
    if (mode !== "range" || !pending.from || pending.to || !hover) return pending
    if (hover.getTime() < pending.from.getTime()) return { from: hover, to: pending.from }
    return { from: pending.from, to: hover }
  }, [pending, hover, mode])

  const nights =
    pending.from && pending.to ? enCal.differenceInCalendarDays(pending.to, pending.from) : 0

  const canConfirm = mode === "single" ? !!pending.from : !!pending.from && !!pending.to

  const months = [viewMonth, cal.addMonths(viewMonth, 1)]

  // Display value
  const displayText = useMemo(() => {
    if (mode === "single") {
      if (value instanceof Date) return formatJalaliDate(value)
      return ""
    } else {
      const range = value as CalRange | null
      if (!range) return ""
      const parts = []
      if (range.from) parts.push(formatJalaliDate(range.from))
      if (range.to) parts.push(formatJalaliDate(range.to))
      return parts.join(" → ")
    }
  }, [mode, value])

  const fmtStatus = (d: Date) =>
    calendar === "fa" ? faCal.format(d, "d MMMM", { locale: faIR }) : enCal.format(d, "d MMMM")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm transition",
            "hover:border-primary-light focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        >
          <CalendarDays className="h-4 w-4 flex-shrink-0 text-primary-dark" />
          <span className={cn("flex-1", !displayText && "text-muted-foreground")}>
            {displayText || placeholder}
          </span>
          {displayText && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                clear()
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-200"
            >
              <X className="h-3 w-3 text-slate-500" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[640px] max-w-[95vw] rounded-2xl border-slate-200 bg-white p-4 shadow-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* هدر */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-foreground">
            {mode === "range" ? "انتخاب بازه تاریخ" : "انتخاب تاریخ"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToday}
              className="rounded-sm px-2 py-1 text-xs font-bold text-primary-dark hover:bg-primary-lightest"
            >
              برو به امروز
            </button>
            <button
              type="button"
              onClick={() => switchCalendar(calendar === "fa" ? "en" : "fa")}
              className="rounded-sm px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-slate-100"
            >
              {calendar === "fa" ? "تقویم میلادی" : "تقویم شمسی"}
            </button>
          </div>
        </div>

        {/* ماه‌ها */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setViewMonth(cal.addMonths(viewMonth, -1))}
            aria-label="ماه قبل"
            className={cn(
              "absolute top-2 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-primary-lightest hover:text-primary-dark",
              atMinMonth && "invisible"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMonth(cal.addMonths(viewMonth, 1))}
            aria-label="ماه بعد"
            className={cn(
              "absolute top-2 left-0 z-10 flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-primary-lightest hover:text-primary-dark",
              atMaxMonth && "invisible"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2">
            {months.map((m, mi) => (
              <div key={mi} className={cn(mi === 1 && "hidden md:block")}>
                <div className="mb-2 flex h-8 items-center justify-center text-center text-sm font-bold">
                  {calendar === "fa"
                    ? faCal.format(m, "MMMM yyyy", { locale: faIR })
                    : enCal.format(m, "MMMM yyyy")}
                </div>
                <div className="grid grid-cols-7">
                  {(calendar === "fa" ? WD_FA : WD_EN).map((w, i) => (
                    <div
                      key={i}
                      className="flex h-7 items-center justify-center text-[11px] font-bold text-muted-foreground"
                    >
                      {w}
                    </div>
                  ))}
                  {monthCells(m, cal, calendar === "fa").map((d, i) => {
                    if (!d) return <div key={`b${i}`} className="h-9" />
                    const t = d.getTime()
                    const isDisabled =
                      t < effMin.getTime() || (effMax ? t > effMax.getTime() : false)
                    const isToday = t === today.getTime()
                    const isStart = !!preview.from && t === preview.from.getTime()
                    const isEnd = !!preview.to && t === preview.to.getTime()
                    const inRange =
                      !!preview.from &&
                      !!preview.to &&
                      t > preview.from.getTime() &&
                      t < preview.to.getTime()

                    let wrap = ""
                    if (inRange) wrap = "bg-primary-lightest rounded-sm"
                    else if (isStart && preview.to)
                      wrap = `bg-[linear-gradient(to_left,transparent_50%,${P100}_50%)]`
                    else if (isEnd)
                      wrap = `bg-[linear-gradient(to_right,transparent_50%,${P100}_50%)]`

                    let btn =
                      "w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors cursor-pointer hover:bg-primary-dark hover:text-white"
                    if (isDisabled)
                      btn =
                        "w-9 h-9 flex items-center justify-center rounded-md text-sm opacity-35 line-through text-muted-foreground cursor-not-allowed"
                    else if (isStart || isEnd)
                      btn =
                        "w-9 h-9 flex items-center justify-center rounded-md text-sm bg-primary text-white font-bold shadow-sm cursor-pointer"
                    else if (isToday)
                      btn =
                        "w-9 h-9 flex items-center justify-center rounded-md text-sm border-2 border-primary text-primary-dark font-bold cursor-pointer"

                    return (
                      <div
                        key={i}
                        className={`flex h-9 items-center justify-center ${wrap}`}
                        onMouseEnter={() => !isDisabled && setHover(d)}
                        onMouseLeave={() => setHover(null)}
                      >
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => pick(d)}
                          className={btn}
                        >
                          {calendar === "fa" ? faNum(cal.getDate(d)) : cal.getDate(d)}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* فوتر */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="text-xs font-medium text-muted-foreground">
            {mode === "range" ? (
              <>
                <span className="ml-2 font-bold text-foreground">
                  {pending.from ? fmtStatus(pending.from) : fromLabel}
                </span>
                <span className="text-slate-400">→</span>
                <span className="mr-2 ml-2 font-bold text-foreground">
                  {pending.to ? fmtStatus(pending.to) : toLabel}
                </span>
                {showNights && nights > 0 && (
                  <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-bold text-primary-dark">
                    {calendar === "fa" ? faNum(nights) : nights} شب
                  </span>
                )}
              </>
            ) : (
              <span className="font-bold text-foreground">
                {pending.from ? formatJalaliLong(pending.from) : placeholder}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clear}
              className="rounded-sm"
            >
              پاک کردن
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canConfirm}
              onClick={confirm}
              className="rounded-sm bg-gradient-to-l from-primary to-primary-dark text-white shadow"
            >
              تایید
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
