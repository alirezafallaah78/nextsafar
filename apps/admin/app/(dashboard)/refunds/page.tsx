"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import { useToast } from "@/hooks/use-toast"
import { approveRefund, listRefunds, refundStatusMap, rejectRefund, type RefundRecord } from "@/lib/admin-orders"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export default function RefundsPage() {
  const { toast } = useToast()
  const [refunds, setRefunds] = useState<RefundRecord[]>([])
  const [target, setTarget] = useState<{ ref: RefundRecord; action: "approve" | "reject" } | null>(null)

  const load = () => setRefunds(listRefunds())
  useEffect(load, [])

  const confirm = () => {
    if (!target) return
    if (target.action === "approve") {
      approveRefund(target.ref.id)
      toast({ title: "استرداد تأیید شد", description: `${target.ref.id} وارد فرآیند بازگشت وجه شد` })
    } else {
      rejectRefund(target.ref.id)
      toast({ title: "استرداد رد شد", description: target.ref.id })
    }
    setTarget(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">استردادها</h1>
        <p className="mt-1 text-sm text-muted-foreground">مدیریت درخواست‌های بازگشت وجه</p>
      </div>

      <Panel title="درخواست‌های استرداد" description={`${faNum(refunds.length)} درخواست`}>
        <div className="space-y-4">
          {refunds.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">درخواستی ثبت نشده.</p>}
          {refunds.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <RotateCcw className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{r.id}</span>
                      <Link href={`/orders/${r.orderId}`} className="font-mono text-xs font-bold text-primary hover:underline">{r.orderId}</Link>
                      <Badge variant={refundStatusMap[r.status].variant}>{refundStatusMap[r.status].label}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{r.reason}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{r.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-extrabold tabular-nums text-foreground">{faPrice(r.amount)}</p>
                  {r.status === "requested" && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setTarget({ ref: r, action: "approve" })} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
                        <CheckCircle2 className="ml-1 h-4 w-4" />
                        تأیید
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setTarget({ ref: r, action: "reject" })} className="rounded-sm border-danger/30 text-danger hover:bg-danger/10">
                        <XCircle className="ml-1 h-4 w-4" />
                        رد
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{target?.action === "approve" ? "تأیید استرداد" : "رد درخواست استرداد"}</AlertDialogTitle>
            <AlertDialogDescription>
              {target?.action === "approve"
                ? `مبلغ ${target ? faPrice(target.ref.amount) : ""} به مشتری بازگردانده می‌شود و وضعیت پرداخت سفارش «مسترد شده» می‌گردد.`
                : "درخواست استرداد مشتری رد خواهد شد."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTarget(null)}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={confirm} className={target?.action === "approve" ? "bg-primary text-primary-foreground hover:bg-primary-dark" : "bg-danger text-white hover:bg-danger/90"}>
              {target?.action === "approve" ? "تأیید استرداد" : "رد درخواست"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
