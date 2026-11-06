"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, CheckCircle2, Clock, Download, Eye, FileText, User } from "lucide-react"
import { DocumentPreview } from "@/components/documents/document-preview"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getVisaCase, updateVisaCaseStatus, visaCaseStatusMap, type VisaCaseRecord, type VisaCaseStatus } from "@/lib/admin-visas"
import { faNum } from "@/lib/jalali"

function faPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

export default function VisaCaseDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [caseData, setCaseData] = useState<VisaCaseRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<VisaCaseStatus>("initial")
  const [previewDoc, setPreviewDoc] = useState<{ url: string; fileName: string; name: string } | null>(null)

  const load = () => {
    setCaseData(getVisaCase(id))
    setLoading(false)
  }

  useEffect(load, [id])

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />

  if (!caseData) {
    return (
      <div className="rounded-lg border border-border bg-card p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">پرونده یافت نشد</h2>
        <Button asChild className="mt-6 rounded-sm"><Link href="/visas/cases">بازگشت</Link></Button>
      </div>
    )
  }

  const changeStatus = () => {
    if (newStatus === caseData.status) return
    updateVisaCaseStatus(caseData.id, newStatus)
    toast({ title: "وضعیت بروزرسانی شد", description: visaCaseStatusMap[newStatus].label })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-sm"><Link href="/visas/cases"><ArrowRight className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <span className="font-mono">{caseData.id}</span>
            <Badge variant={visaCaseStatusMap[caseData.status].variant}>{visaCaseStatusMap[caseData.status].label}</Badge>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{caseData.visaTitle} · {caseData.createdAt}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="مشتری">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><User className="h-4 w-4 text-primary" />نام</p>
                <p className="mt-1 font-bold text-foreground">{caseData.customer.name}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs font-bold text-muted-foreground">موبایل</p>
                <p className="mt-1 font-mono font-bold text-foreground" dir="ltr">{caseData.customer.mobile}</p>
              </div>
              {caseData.customer.email && (
                <div className="rounded-md border border-border p-3 md:col-span-2">
                  <p className="text-xs font-bold text-muted-foreground">ایمیل</p>
                  <p className="mt-1 font-mono text-sm text-foreground" dir="ltr">{caseData.customer.email}</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="مدارک بارگذاری‌شده" description={`${faNum(caseData.documents.length)} مدرک`}>
            <div className="space-y-3">
              {caseData.documents.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">مدرکی بارگذاری نشده.</p>}
              {caseData.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground">{d.fileName} · {d.uploadedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewDoc({ url: d.url, fileName: d.fileName, name: d.name })}
                      className="h-9 w-9 rounded-sm hover:bg-primary/10 hover:text-primary"
                      aria-label="مشاهده"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = d.url
                        link.download = d.fileName
                        link.target = "_blank"
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                      className="h-9 w-9 rounded-sm hover:bg-primary/10 hover:text-primary"
                      aria-label="دانلود"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Badge variant={d.verified ? "success" : "outline"}>
                      {d.verified ? "تأیید شده" : "در انتظار بررسی"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="تایم‌لاین" description={`${faNum(caseData.timeline.length)} رویداد`}>
            <div className="space-y-4">
              {caseData.timeline.map((t, i) => (
                <div key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${t.status === caseData.status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    {i < caseData.timeline.length - 1 && <div className="mt-1 h-full w-0.5 bg-border" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={visaCaseStatusMap[t.status].variant}>{visaCaseStatusMap[t.status].label}</Badge>
                      <span className="text-[11px] text-muted-foreground">{t.createdAt}</span>
                    </div>
                    {t.note && <p className="mt-1 text-xs text-foreground">{t.note}</p>}
                    <p className="mt-1 text-[11px] text-muted-foreground">توسط: {t.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="تغییر وضعیت">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">وضعیت جدید</label>
                <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as VisaCaseStatus)} className="h-10">
                  {Object.entries(visaCaseStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
              </div>
              <Button onClick={changeStatus} disabled={newStatus === caseData.status} className="h-10 w-full rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark disabled:opacity-50">
                <CheckCircle2 className="ml-2 h-4 w-4" />
                بروزرسانی وضعیت
              </Button>
            </div>
          </Panel>

          <Panel title="خلاصه">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">مسافران:</span><span className="font-bold text-foreground">{faNum(caseData.passengers)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">مبلغ کل:</span><span className="font-bold tabular-nums text-primary">{faPrice(caseData.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">کارشناس:</span><span className="font-bold text-foreground">{caseData.assignedAgent || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">تاریخ ثبت:</span><span className="font-bold text-foreground">{caseData.createdAt}</span></div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Modal Preview */}
      {previewDoc && (
        <DocumentPreview
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          url={previewDoc.url}
          fileName={previewDoc.fileName}
          name={previewDoc.name}
        />
      )}
    </div>
  )
}
