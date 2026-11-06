"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Loader2, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import {
  getRevenueSeries,
  revenueRanges,
  type RevenueRange,
  type RevenuePoint,
} from "@/lib/admin-dashboard"
import { faNum, faPrice } from "@/lib/jalali"
import { cn } from "@/lib/utils"

export function RevenueTrendChart() {
  const [range, setRange] = useState<RevenueRange>("weekly")
  const [data, setData] = useState<RevenuePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        const series = await getRevenueSeries(range)
        if (mounted) {
          setData(series)
        }
      } catch (error) {
        console.error("Revenue chart error:", error)
        if (mounted) {
          setData([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [range])

  const total = data.reduce((sum, point) => sum + point.value, 0)

  return (
    <Panel
      title="روند درآمد"
      description={`مجموع: ${faPrice(total)}`}
      icon={TrendingUp}
      action={
        <div className="flex gap-1 rounded-md border border-border bg-background p-1">
          {revenueRanges.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setRange(r.value)}
              className={cn(
                "h-7 rounded-sm px-3 text-xs",
                range === r.value && "bg-primary text-primary-foreground"
              )}
            >
              {r.label}
            </Button>
          ))}
        </div>
      }
    >
      <div className="h-[300px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <TrendingUp className="mb-2 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-bold text-foreground">داده‌ای برای نمایش نیست</p>
            <p className="mt-1 text-xs text-muted-foreground">
              هنوز درآمدی ثبت نشده است
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => {
                  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                  return value.toString()
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [faPrice(value), "درآمد"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  )
}
