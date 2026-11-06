"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, MessageSquare, Phone, Plus, ShoppingCart, XCircle } from "lucide-react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { addLeadNote, getLead, leadStatusMap, leadTypeMap, updateLeadStatus, type LeadRecord } from "@/lib/admin-leads"
import { createOrder } from "@/lib/admin-orders"
import { listTours, toViewModel } from "@/lib/admin-tours"
import { faNum } from "@/lib/jalali"

export default function LeadDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [lead, setLead] = useState<LeadRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState("")
  const [convertOpen, setConvertOpen] = useState(false)
  const [tourId, setTourId] = useState("")

  const tours = listTours().map(toViewModel)

  const load = () => {
    setLead(getLead(id))
    setLoading(false)
  }
  useEffect(load, [id])

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />
  if (!lead) {
    return (
      <div className="rounded-lg border border-border bg-card p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">درخواست یافت نشد</h2>
        <Button asChild className="mt-6 rounded-sm"><Link href="/leads">بازگشت</Link></Button>
      </div>
    )
  }

  const setStatus = (s: LeadRecord["status"], msg: string) => {
    updateLeadStatus(lead.id, s)
    toast({ title: msg })
    load()
  }

  const submitNote = () => {
    if (!note.trim()) return
    addLeadNote(lead.id, note.trim())
    setNote("")
    toast({ title: "یادداشت ثبت شد" })
    load()
  }

  const convert = () => {
    const tour = tours.find((t) => t.id === tourId)
    if (!tour) {
      toast({ variant: "destructive", title: "خطا", description: "تور را انتخاب کنید" })
      return
    }
    const order = createOrder({
      customer: { name: lead.name, mobile: lead.mobile },
      tourTitle: tour.title,
      tourId: tour.id,
      departureDate: tour.startDate || "-",
      passengers: [{ name: lead.name, type: "adult", price: tour.adultPrice }],
      totalAmount: tour.adultPrice,
      paidAmount: 0,
      discount: 0,
      status: "pending",
      paymentStatus: "unpaid",
    })
    updateLeadStatus(lead.id, "converted")
    addLeadNote(lead.id, `تبدیل به سفارش ${order.id} شد`)
    setConvertOpen(false)
    toast({ title: "تبدیل به سفارش شد", description: order.id })
    load()
  }

  return (
    <div className="space-y-6">
      {/* سربرگ */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-sm"><Link href="/leads"><ArrowRight className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
              {lead.name}
              <Badge variant={leadStatusMap[lead.status].variant}>{leadStatusMap[lead.status].label}</Badge>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {leadTypeMap[lead.type]} · {lead.subject} · {lead.createdAt}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lead.status === "new" && (
            <Button onClick={() => setStatus("contacted", "وضعیت: تماس گرفته شد")} variant="outline" className="rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
              <Phone className="ml-2 h-4 w-4" />
              ثبت تماس
            </Button>
          )}
          {lead.status !== "converted" && lead.status !== "closed" && (
            <>
              <Button onClick={() => setConvertOpen(true)} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
                <ShoppingCart className="ml-2 h-4 w-4" />
                تبدیل به سفارش
              </Button>
              <Button onClick={() => setStatus("closed", "درخواست بسته شد")} variant="outline" className="rounded-sm border-danger/30 text-danger hover:bg-danger/10">
                <XCircle className="ml-2 h-4 w-4" />
                بستن
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* پیام و اطلاعات */}
        <div className="space-y-6 xl:col-span-2">
          <Panel title="پیام مشتری">
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm leading-7 text-foreground">
              {lead.message}
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] text-muted-foreground">موبایل</p>
                <p className="mt-1 font-mono font-bold text-foreground" dir="ltr">{lead.mobile}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] text-muted-foreground">منبع</p>
                <p className="mt-1 font-bold text-foreground">{lead.source}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] text-muted-foreground">ایمیل</p>
                <p className="mt-1 font-bold text-foreground">{lead.email || "—"}</p>
              </div>
            </div>
          </Panel>

          <Panel title="یادداشت‌های پیگیری" description={`${faNum(lead.notes.length)} یادداشت`}>
            <div className="space-y-3">
              {lead.notes.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">هنوز یادداشتی ثبت نشده.</p>
              )}
              {lead.notes.map((n) => (
                <div key={n.id} className="rounded-md border border-border bg-background p-3">
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{n.author} · {n.createdAt}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 border-t border-border pt-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="نتیجه پیگیری را بنویسید..."
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <Button onClick={submitNote} className="h-10 rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
                <Plus className="ml-1 h-4 w-4" />
                ثبت
              </Button>
            </div>
          </Panel>
        </div>

        {/* کارت وضعیت */}
        <Panel title="چرخه پیگیری">
          <div className="space-y-2">
            {(["new", "contacted", "converted", "closed"] as const).map((s, i) => {
              const active = lead.status === s
              const passed = ["new", "contacted", "converted", "closed"].indexOf(lead.status) > i
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className={cnDot(active, passed)} />
                  <span className={active ? "text-sm font-bold text-foreground" : "text-sm text-muted-foreground"}>
                    {leadStatusMap[s].label}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      {/* دیالوگ تبدیل به سفارش */}
      <AlertDialog open={convertOpen} onOpenChange={setConvertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تبدیل درخواست به سفارش</AlertDialogTitle>
            <AlertDialogDescription>
              یک سفارش پیش‌نویس برای «{lead.name}» با تور انتخاب‌شده ساخته می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={tourId} onChange={(e) => setTourId(e.target.value)} className="my-3">
            <option value="">انتخاب تور...</option>
            {tours.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConvertOpen(false)}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={convert} className="bg-primary text-primary-foreground hover:bg-primary-dark">
              ایجاد سفارش
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function cnDot(active: boolean, passed: boolean) {
  if (active) return "h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20"
  if (passed) return "h-3 w-3 rounded-full bg-primary/50"
  return "h-3 w-3 rounded-full bg-border"
}
