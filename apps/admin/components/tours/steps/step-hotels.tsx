"use client"

import { useMemo } from "react"
import { ArrowDown, ArrowUp, BedDouble, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { emptyHotel, roomTypes, type TourHotelRelation } from "@/lib/tour-form"
import { faNum, parseJalaliDate } from "@/lib/jalali"

interface StepHotelsProps {
  data: any
  onChange: (data: any) => void
}

export function StepHotels({ data, onChange }: StepHotelsProps) {
  const hotels: TourHotelRelation[] = data.hotels || []

  /* ─── محاسبه شب‌های تور از بازه تاریخ ─── */
  const tourNights = useMemo(() => {
    const d = data.dates?.[0]
    if (!d?.startDate || !d?.endDate) return null
    const s = parseJalaliDate(d.startDate)
    const e = parseJalaliDate(d.endDate)
    if (!s || !e) return null
    const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000)
    return diff > 0 ? diff : null
  }, [data.dates])

  const totalNights = hotels.reduce((sum, h) => sum + (h.nights || 0), 0)

  const set = (list: TourHotelRelation[]) => onChange({ ...data, hotels: list })
  const add = () => set([...hotels, emptyHotel(hotels.length + 1)])
  const remove = (id: string) =>
    set(hotels.filter((h) => h.id !== id).map((h, i) => ({ ...h, priority: i + 1 })))
  const patch = (id: string, p: Partial<TourHotelRelation>) =>
    set(hotels.map((h) => (h.id === id ? { ...h, ...p } : h)))
  const move = (id: string, dir: -1 | 1) => {
    const idx = hotels.findIndex((h) => h.id === id)
    const target = idx + dir
    if (idx < 0 || target < 0 || target >= hotels.length) return
    const list = [...hotels]
    ;[list[idx], list[target]] = [list[target], list[idx]]
    set(list.map((h, i) => ({ ...h, priority: i + 1 })))
  }

  return (
    <Panel
      title="هتل‌های تور"
      description="تور تک‌هتلی (استانبول، دبی) یا چندهتلی (ویتنام، تایلند) — شب‌ها را تقسیم کنید"
      action={
        <Button onClick={add} size="sm" className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
          <Plus className="ml-2 h-4 w-4" />
          افزودن هتل
        </Button>
      }
    >
      {/* ─── خلاصه شب‌ها ─── */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/40 p-3 text-xs">
        <span className="flex items-center gap-1.5 font-bold text-foreground">
          <BedDouble className="h-4 w-4 text-primary" />
          مجموع شب‌های تنظیم‌شده: {faNum(totalNights)}
        </span>
        {tourNights !== null && (
          <>
            <span className="text-muted-foreground">|</span>
            <span className="font-bold text-muted-foreground">شب‌های تور: {faNum(tourNights)}</span>
            {totalNights === tourNights ? (
              <Badge variant="success">تطبیق دارد</Badge>
            ) : (
              <Badge variant="warning">اختلاف: {faNum(Math.abs(tourNights - totalNights))} شب</Badge>
            )}
          </>
        )}
      </div>

      {hotels.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BedDouble className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">هنوز هتلی اضافه نشده</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            مثال: ویتنام ۹ شب = ۳ شب هانوی + ۲ شب هالونگ + ۲ شب دانانگ + ۲ شب هوچی‌مین
          </p>
          <Button onClick={add} className="mt-4 rounded-sm bg-primary hover:bg-primary-dark">
            <Plus className="ml-2 h-4 w-4" />
            افزودن اولین هتل
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {hotels.map((h, i) => (
            <div key={h.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              {/* سربرگ ردیف */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                    {faNum(i + 1)}
                  </span>
                  <h4 className="text-sm font-bold text-foreground">هتل {faNum(i + 1)}</h4>
                  {h.nights > 0 && (
                    <Badge variant="secondary">{faNum(h.nights)} شب</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => move(h.id, -1)}
                    disabled={i === 0}
                    aria-label="انتقال به بالا"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => move(h.id, 1)}
                    disabled={i === hotels.length - 1}
                    aria-label="انتقال به پایین"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-danger hover:bg-danger/10"
                    onClick={() => remove(h.id)}
                    aria-label="حذف هتل"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* فیلدها */}
              <div className="grid items-end gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">نام هتل</Label>
                  <Input
                    value={h.hotelName}
                    onChange={(e) => patch(h.id, { hotelName: e.target.value })}
                    placeholder="مثال: هتل هیلتون استانبول"
                    className="h-10 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">تعداد شب</Label>
                  <Input
                    type="number"
                    min={1}
                    value={h.nights}
                    onChange={(e) => patch(h.id, { nights: Math.max(1, Number(e.target.value)) })}
                    className="h-10 rounded-md tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">نوع اتاق</Label>
                  <Select value={h.roomType} onChange={(e) => patch(h.id, { roomType: e.target.value })}>
                    {roomTypes.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
