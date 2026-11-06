"use client"

import { DollarSign, Percent, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import { Panel } from "@/components/dashboard/panel"

interface StepPricingProps {
  data: any
  onChange: (data: any) => void
}

function faNum(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

export function StepPricing({ data, onChange }: StepPricingProps) {
  const update = (field: string, value: any) => onChange({ ...data, [field]: value })

  const basePrice = data.basePrice || 0
  const discount = data.discountPercent || 0
  const finalPrice = Math.round(basePrice - (basePrice * discount) / 100)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* قیمت پایه */}
        <Panel title="قیمت پایه" description="قیمت اصلی هر نفر (ریال)">
          <div className="space-y-3">
            <MoneyInput
              value={basePrice}
              onChange={(v) => update("basePrice", v)}
              suffix="ریال"
              className="h-12 text-base font-bold"
            />
            <p className="text-xs text-muted-foreground">
              معادل: <span className="font-bold text-foreground">{faNum(basePrice)}</span> ریال
            </p>
          </div>
        </Panel>

        {/* تخفیف */}
        <Panel title="تخفیف" description="درصد تخفیف روی قیمت پایه">
          <div className="space-y-4">
            <div className="relative">
              <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => update("discountPercent", Math.min(100, Math.max(0, Number(e.target.value))))}
                className="h-12 rounded-md pr-10 text-base font-bold tabular-nums"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => update("discountPercent", Number(e.target.value))}
              className="w-full accent-[#43abff]"
            />
          </div>
        </Panel>

        {/* قیمت نهایی */}
        <Panel title="قیمت نهایی" description="پس از اعمال تخفیف">
          <div className="rounded-md bg-primary/10 p-4">
            <p className="text-xs font-bold text-primary">قیمت نهایی هر نفر</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-foreground">
              {faNum(finalPrice)}
              <span className="mr-1 text-sm font-bold text-muted-foreground">ریال</span>
            </p>
            {discount > 0 && (
              <p className="mt-2 text-xs">
                <span className="text-muted-foreground line-through">{faNum(basePrice)}</span>
                <span className="mr-2 font-bold text-primary">{faNum(discount)}٪ تخفیف</span>
              </p>
            )}
          </div>
        </Panel>
      </div>

      {/* محدوده مسافران */}
      <Panel title="محدوده مسافران" description="حداقل و حداکثر تعداد مسافر">
        <div className="grid items-end gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              حداقل تعداد مسافر
            </Label>
            <Input
              type="number"
              min={1}
              value={data.minPassengers}
              onChange={(e) => update("minPassengers", Math.max(1, Number(e.target.value)))}
              className="h-10 rounded-md tabular-nums"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              حداکثر تعداد مسافر
            </Label>
            <Input
              type="number"
              min={data.minPassengers}
              value={data.maxPassengers}
              onChange={(e) => update("maxPassengers", Math.max(data.minPassengers, Number(e.target.value)))}
              className="h-10 rounded-md tabular-nums"
            />
          </div>
        </div>
      </Panel>
    </div>
  )
}
