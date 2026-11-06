"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { DestinationPoint, RevenuePoint } from "@/lib/admin-dashboard"

const PRIMARY = "#43abff"

/* ═══════════════════════════════════════════════════════════════
   توابع فرمت اعداد — ریال با جداکننده ۳ رقمی
═══════════════════════════════════════════════════════════════ */

/** عدد فارسی با جداکننده ۳ رقمی: ۱۸,۵۰۰,۰۰۰ */
export function faNum(value: number, maxFraction = 0): string {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: maxFraction }).format(value)
}

/** فرمت کامل ریال: ۱۸,۵۰۰,۰۰۰ ریال */
export function formatRial(value: number): string {
  return `${faNum(Math.round(value))} ریال`
}

/** فرمت فشرده برای محور چارت: ۱۸.۵ میلیون */
export function formatRialCompact(value: number): string {
  if (value >= 1_000_000_000) return `${faNum(value / 1_000_000_000, 1)} میلیارد`
  if (value >= 1_000_000) return `${faNum(value / 1_000_000, 1)} میلیون`
  if (value >= 1_000) return `${faNum(value / 1_000, 1)} هزار`
  return faNum(value)
}

/* ═══════════════════════════════════════════════════════════════
   Tooltip سفارشی درآمد — RTL با جداکننده کامل
═══════════════════════════════════════════════════════════════ */
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  const value = Number(payload[0]?.value ?? 0)

  return (
    <div
      dir="rtl"
      className="rounded-md border border-border bg-card px-3 py-2 shadow-card-hover"
    >
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-foreground">{formatRial(value)}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   چارت خطی درآمد — RTL-safe + حالت شب
═══════════════════════════════════════════════════════════════ */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
        داده‌ای برای نمایش وجود ندارد
      </div>
    )
  }

  return (
    /* wrapper با dir=ltr: جلوگیری از باگ‌های محاسبه عرض Recharts در RTL */
    <div dir="ltr" className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.35} />
              <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />

          {/* محور X: معکوس → اولین نقطه سمت راست (حس RTL) */}
          <XAxis
            dataKey="label"
            reversed
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            interval="preserveStartEnd"
          />

          {/* محور Y: سمت راست + فرمت فشرده ریال */}
          <YAxis
            orientation="right"
            width={72}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatRialCompact(v)}
          />

          <Tooltip
            content={<RevenueTooltip />}
            cursor={{ stroke: PRIMARY, strokeDasharray: "4 4", strokeOpacity: 0.4 }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={PRIMARY}
            strokeWidth={3}
            fill="url(#revenueGradient)"
            dot={{ r: 3.5, fill: PRIMARY, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: PRIMARY, stroke: "hsl(var(--card))", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   چارت دایره‌ای مقاصد
═══════════════════════════════════════════════════════════════ */
const destinationColors = ["#43abff", "#3384c6", "#7cc4ff", "#b9e0ff", "#dbeefe"]

function DestinationsTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null
  const { name, value } = payload[0]

  return (
    <div
      dir="rtl"
      className="rounded-md border border-border bg-card px-3 py-2 shadow-card-hover"
    >
      <p className="text-sm font-bold text-foreground">{name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{faNum(value)}٪ سهم فروش</p>
    </div>
  )
}

export function DestinationsChart({ data }: { data: DestinationPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        داده‌ای برای نمایش وجود ندارد
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div dir="ltr" className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={destinationColors[index % destinationColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<DestinationsTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* راهنمای مقاصد */}
      <div className="w-full space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: destinationColors[index % destinationColors.length] }}
              />
              <span className="text-sm font-medium text-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-muted-foreground">
              {faNum(item.value)}٪
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
