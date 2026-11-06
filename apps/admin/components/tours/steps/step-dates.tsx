"use client"

import { Calendar, Coins, Plus, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { MoneyInput } from "@/components/ui/money-input"
import { Panel } from "@/components/dashboard/panel"
import { PersianDatePicker } from "@/components/ui/persian-date-picker"
import {
  emptyDate,
  foreignCurrencyOptions,
  priceKeys,
  type TourDate,
  type TourDatePrices,
} from "@/lib/tour-form"
import { parseJalaliDate, formatJalaliDate } from "@/lib/jalali"
import { cn } from "@/lib/utils"

interface StepDatesProps {
  data: any
  onChange: (data: any) => void
}

export function StepDates({ data, onChange }: StepDatesProps) {
  const dates: TourDate[] = data.dates || []

  const update = (newDates: TourDate[]) => onChange({ ...data, dates: newDates })
  const addDate = () => update([...dates, emptyDate()])
  const removeDate = (i: number) => update(dates.filter((_, idx) => idx !== i))

  const patchDate = (i: number, patch: Partial<TourDate>) => {
    const next = [...dates]
    next[i] = { ...next[i], ...patch }
    update(next)
  }

  const patchPrice = (i: number, key: keyof TourDatePrices, field: "rial" | "foreign", value: number) => {
    const next = [...dates]
    next[i] = {
      ...next[i],
      prices: {
        ...next[i].prices,
        [key]: { ...next[i].prices[key], [field]: value },
      },
    }
    update(next)
  }

  const handleRange = (i: number, range: any) => {
    const from = range?.from instanceof Date ? range.from : null
    const to = range?.to instanceof Date ? range.to : null
    patchDate(i, {
      startDate: from ? formatJalaliDate(from) : "",
      endDate: to ? formatJalaliDate(to) : "",
    })
  }

  return (
    <div className="space-y-6">
      <Panel
        title="تاریخ‌های حرکت و قیمت‌گذاری"
        description="برای هر تاریخ، ظرفیت و ۵ سطح قیمتی را مشخص کنید"
        action={
          <Button onClick={addDate} size="sm" className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
            <Plus className="ml-2 h-4 w-4" />
            تاریخ جدید
          </Button>
        }
      >
        {dates.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">هنوز تاریخی اضافه نشده</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              برای شروع، روی دکمه «تاریخ جدید» کلیک کنید
            </p>
            <Button onClick={addDate} className="mt-4 rounded-sm bg-primary hover:bg-primary-dark">
              <Plus className="ml-2 h-4 w-4" />
              افزودن اولین تاریخ
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {dates.map((date, i) => {
              const from = parseJalaliDate(date.startDate) || null
              const to = parseJalaliDate(date.endDate) || null
              const foreign = foreignCurrencyOptions.find((c) => c.value === date.foreignCurrency)

              return (
                <div key={i} className="rounded-lg border border-border bg-card p-5 shadow-card">
                  {/* سربرگ */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                        {i + 1}
                      </div>
                      <h4 className="font-bold text-foreground">بازه حرکت #{i + 1}</h4>
                      <Badge variant={date.status === "published" ? "success" : "secondary"}>
                        {date.status === "published" ? "فعال" : date.status === "cancelled" ? "لغو شده" : "پیش‌نویس"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDate(i)}
                      className="h-8 w-8 text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* ردیف ۱: تاریخ + ظرفیت + وضعیت (تراز یکدست) */}
                  <div className="mt-4 grid items-end gap-4 md:grid-cols-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        بازه حرکت (شمسی)
                      </Label>
                      <PersianDatePicker
                        mode="range"
                        value={{ from, to }}
                        onChange={(v) => handleRange(i, v)}
                        fromLabel="شروع"
                        toLabel="پایان"
                        showNights
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        ظرفیت کل
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={date.totalCapacity}
                        onChange={(e) => patchDate(i, { totalCapacity: Math.max(1, Number(e.target.value)) })}
                        className="h-10 rounded-md tabular-nums"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">وضعیت</Label>
                      <Select
                        value={date.status}
                        onChange={(e) => patchDate(i, { status: e.target.value as TourDate["status"] })}
                      >
                        <option value="draft">پیش‌نویس</option>
                        <option value="published">فعال</option>
                        <option value="cancelled">لغو شده</option>
                      </Select>
                    </div>
                  </div>

                  {/* ردیف ۲: تنظیمات ارز */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
                    <button
                      type="button"
                      onClick={() => patchDate(i, { foreignEnabled: !date.foreignEnabled })}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold transition",
                        date.foreignEnabled
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      <Coins className="h-4 w-4" />
                      قیمت ارزی (دلار و...)
                    </button>

                    {date.foreignEnabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">نوع ارز:</span>
                        <Select
                          value={date.foreignCurrency}
                          onChange={(e) => patchDate(i, { foreignCurrency: e.target.value as any })}
                          className="h-9 w-40"
                        >
                          {foreignCurrencyOptions.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label} ({c.symbol})
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* ردیف ۳: ۵ سطح قیمت */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {priceKeys.map((pk) => (
                      <div key={pk.key} className="space-y-2">
                        <Label className="flex flex-col text-xs font-bold text-foreground">
                          {pk.label}
                          <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">{pk.hint}</span>
                        </Label>

                        <MoneyInput
                          value={date.prices?.[pk.key]?.rial ?? 0}
                          onChange={(v) => patchPrice(i, pk.key, "rial", v)}
                          suffix="ریال"
                        />

                        {date.foreignEnabled && (
                          <MoneyInput
                            value={date.prices?.[pk.key]?.foreign ?? 0}
                            onChange={(v) => patchPrice(i, pk.key, "foreign", v)}
                            suffix={foreign?.symbol || "$"}
                            placeholder="0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
