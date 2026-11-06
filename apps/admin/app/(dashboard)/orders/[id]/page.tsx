"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, PlayCircle, User, XCircle } from "lucide-react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  getOrder, orderStatusMap, paymentStateMap, paymentStatusMap,
  paymentsOf, refundsOf, updateOrderStatus,
  type OrderRecord, type OrderStatus,
} from "@/lib/admin-orders"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

const passengerType: Record<string, string> = { adult: "بزرگسال", child: "کودک", infant: "نوزاد" }

const nextAction: Partial<Record<OrderStatus, { label: string; to: OrderStatus; icon: any }>> = {
  pending: { label: "تأیید سفارش", to: "confirmed", icon: CheckCircle2 },
  confirmed: { label: "شروع انجام", to: "processing", icon: PlayCircle },
  processing: { label: "تکمیل سفارش", to: "completed", icon: CheckCircle2 },
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [order, setOrder] = useState<OrderRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)

  const load = () => {
    setOrder(getOrder(id))
    setLoading(false)
  }

  useEffect(load, [id])

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />

  if (!order) {
    return (
      <div className="rounded-lg border border-border bg-card p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">سفارش یافت نشد</h2>
        <Button asChild className="mt-6 rounded-sm"><Link href="/orders">بازگشت به لیست</Link></Button>
      </div>
    )
  }

  const payments = paymentsOf(order.id)
  const refunds = refundsOf(order.id)
  const action = nextAction[order.status]
  const remaining = order.totalAmount - order.paidAmount

  const changeStatus = (to: OrderStatus) => {
    updateOrderStatus(order.id, to)
    toast({ title: "وضعیت بروزرسانی شد", description: orderStatusMap[to].label })
    load()
  }

  return (
    <div className="space-y-6">
      {/* سربرگ */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-sm"><Link href="/orders"><ArrowRight className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
              <span className="font-mono">{order.id}</span>
              <Badge variant={orderStatusMap[order.status].variant}>{orderStatusMap[order.status].label}</Badge>
              <Badge variant={paymentStatusMap[order.paymentStatus].variant}>{paymentStatusMap[order.paymentStatus].label}</Badge>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">ثبت شده در {order.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <Button onClick={() => changeStatus(action.to)} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
              <action.icon className="ml-2 h-4 w-4" />
              {action.label}
            </Button>
          )}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <Button variant="outline" onClick={() => setCancelOpen(true)} className="rounded-sm border-danger/30 text-danger hover:bg-danger/10">
              <XCircle className="ml-2 h-4 w-4" />
              لغو سفارش
            </Button>
          )}
        </div>
      </div>

      {/* کارت‌های خلاصه */}
      <div className="grid gap-6 md:grid-cols-3">
        <Panel title="مشتری">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 font-bold text-foreground"><User className="h-4 w-4 text-primary" />{order.customer.name}</p>
            <p className="font-mono text-xs text-muted-foreground" dir="ltr">{order.customer.mobile}</p>
          </div>
        </Panel>
        <Panel title="تور">
          <div className="space-y-2 text-sm">
            <p className="font-bold text-foreground">{order.tourTitle}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />حرکت: {order.departureDate}</p>
          </div>
        </Panel>
        <Panel title="مبالغ">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">مبلغ کل:</span><span className="font-bold tabular-nums text-foreground">{faPrice(order.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">پرداخت شده:</span><span className="font-bold tabular-nums text-primary">{faPrice(order.paidAmount)}</span></div>
            <div className="flex justify-between border-t border-border pt-1.5"><span className="text-muted-foreground">باقی‌مانده:</span><span className="font-bold tabular-nums text-foreground">{faPrice(remaining)}</span></div>
          </div>
        </Panel>
      </div>

      {/* مسافران */}
      <Panel title="مسافران" description={`${faNum(order.passengers.length)} مسافر`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-right text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">نام</th>
                <th className="pb-3 font-medium">نوع</th>
                <th className="pb-3 font-medium">قیمت</th>
              </tr>
            </thead>
            <tbody>
              {order.passengers.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 font-bold text-foreground">{p.name}</td>
                  <td className="py-3"><Badge variant="secondary">{passengerType[p.type]}</Badge></td>
                  <td className="py-3 tabular-nums text-muted-foreground">{faPrice(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* پرداخت‌ها و استردادها */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="پرداخت‌ها" description={`${faNum(payments.length)} تراکنش`}>
          <div className="space-y-3">
            {payments.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">پرداختی ثبت نشده.</p>}
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10"><CreditCard className="h-4 w-4 text-primary" /></span>
                  <div>
                    <p className="font-mono text-xs font-bold text-foreground">{p.id}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{p.createdAt} · کد رهگیری: {p.trackingCode}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tabular-nums text-foreground">{faPrice(p.amount)}</p>
                  <Badge variant={paymentStateMap[p.status].variant} className="mt-1">{paymentStateMap[p.status].label}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="استردادها" description={`${faNum(refunds.length)} درخواست`}>
          <div className="space-y-3">
            {refunds.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">درخواست استردادی ثبت نشده.</p>}
            {refunds.map((r) => (
              <div key={r.id} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-bold text-foreground">{r.id}</p>
                  <Badge variant={refundStatusBadge(r.status)}>{r.status === "requested" ? "درخواست شده" : r.status === "approved" ? "تأیید شده" : r.status === "completed" ? "انجام شده" : "رد شده"}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{r.reason}</p>
                <p className="mt-1 text-sm font-bold tabular-nums text-foreground">{faPrice(r.amount)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* دیالوگ لغو */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>لغو سفارش {order.id}</AlertDialogTitle>
            <AlertDialogDescription>
              با لغو سفارش، مبالغ پرداخت‌شده وارد فرآیند استرداد می‌شود. ادامه می‌دهید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelOpen(false)}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={() => { changeStatus("cancelled"); setCancelOpen(false) }} className="bg-danger text-white hover:bg-danger/90">
              لغو سفارش
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function refundStatusBadge(s: string): "outline" | "info" | "success" | "destructive" {
  if (s === "requested") return "outline"
  if (s === "approved") return "info"
  if (s === "completed") return "success"
  return "destructive"
}
