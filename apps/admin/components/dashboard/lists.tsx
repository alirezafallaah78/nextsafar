"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  ActivityRow,
  LeadRow,
  OrderRow,
  TripRow,
} from "@/lib/admin-dashboard"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  XCircle,
  Circle,
} from "lucide-react"

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

function formatCurrency(value: number) {
  return `${formatNumber(value)} ریال`
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" | "outline" }> = {
    confirmed: { label: "تأیید شده", variant: "success" },
    paid: { label: "پرداخت شده", variant: "success" },
    pending: { label: "در انتظار", variant: "outline" },
    processing: { label: "در حال پردازش", variant: "info" },
    cancelled: { label: "لغو شده", variant: "secondary" },
    failed: { label: "ناموفق", variant: "secondary" },
  }
  const item = map[status] || { label: status, variant: "outline" as const }
  return <Badge variant={item.variant}>{item.label}</Badge>
}

export function RecentOrders({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-right text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="pb-3 font-medium">شناسه</th>
            <th className="pb-3 font-medium">مشتری</th>
            <th className="pb-3 font-medium">تور</th>
            <th className="pb-3 font-medium">تاریخ</th>
            <th className="pb-3 font-medium">مبلغ</th>
            <th className="pb-3 font-medium">وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
              <td className="py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
              <td className="py-3 font-medium text-foreground">{order.customer}</td>
              <td className="py-3 text-muted-foreground">{order.tour}</td>
              <td className="py-3 text-muted-foreground">{order.date}</td>
              <td className="py-3 font-semibold text-foreground">{formatCurrency(order.amount)}</td>
              <td className="py-3">{getStatusBadge(order.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function UpcomingTrips({ trips }: { trips: TripRow[] }) {
  return (
    <div className="space-y-4">
      {trips.map((trip) => {
        const percent = Math.min(100, Math.round((trip.booked / trip.capacity) * 100))
        const isFull = trip.booked >= trip.capacity
        return (
          <div key={trip.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-gradient-to-br from-primary to-primary-dark" />
                <div>
                  <h4 className="font-bold text-foreground">{trip.destination}</h4>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {trip.startDate} تا {trip.endDate}
                  </p>
                </div>
              </div>
              <Badge variant={isFull ? "destructive" : "secondary"}>
                {isFull ? "تکمیل ظرفیت" : `${formatNumber(trip.booked)} / ${formatNumber(trip.capacity)}`}
              </Badge>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>پرشدگی</span>
                <span>{formatNumber(percent)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function LeadMessages({ leads }: { leads: LeadRow[] }) {
  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <div key={lead.id} className="rounded-md border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">{lead.name}</h4>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground" dir="ltr">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{lead.createdAt}</span>
          </div>
          <div className="mt-3 rounded-sm bg-muted p-3 text-sm text-foreground">
            {lead.message}
          </div>
          <div className="mt-3">
            <Badge variant="secondary">{lead.type}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityFeed({ items }: { items: ActivityRow[] }) {
  const iconMap = {
    success: <CheckCircle2 className="h-4 w-4 text-primary" />,
    info: <Circle className="h-4 w-4 text-primary" />,
    warning: <Clock className="h-4 w-4 text-muted-foreground" />,
    danger: <XCircle className="h-4 w-4 text-destructive" />,
  }
  const bgMap = {
    success: "bg-primary/10",
    info: "bg-primary/10",
    warning: "bg-muted",
    danger: "bg-destructive/10",
  }
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className={cn("mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", bgMap[item.type])}>
            {iconMap[item.type]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TripStatus({ stats }: { stats: { done: number; booked: number; cancelled: number } }) {
  const total = stats.done + stats.booked + stats.cancelled || 1
  const donePercent = Math.round((stats.done / total) * 100)
  const bookedPercent = Math.round((stats.booked / total) * 100)
  const cancelledPercent = Math.max(0, 100 - donePercent - bookedPercent)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">کل سفرها</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{formatNumber(total)}</p>
        </div>
        <Badge variant="secondary">این ماه</Badge>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${donePercent}%` }} />
        <div className="h-full bg-muted-foreground" style={{ width: `${bookedPercent}%` }} />
        <div className="h-full bg-border" style={{ width: `${cancelledPercent}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">تکمیل شده</p>
          <p className="mt-1 text-lg font-bold text-foreground">{formatNumber(stats.done)}</p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">رزرو شده</p>
          <p className="mt-1 text-lg font-bold text-foreground">{formatNumber(stats.booked)}</p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">لغو شده</p>
          <p className="mt-1 text-lg font-bold text-foreground">{formatNumber(stats.cancelled)}</p>
        </div>
      </div>
    </div>
  )
}
