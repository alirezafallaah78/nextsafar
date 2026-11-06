"use client"

import { useState } from "react"
import { CheckCircle2, Globe, RefreshCw, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/dashboard/panel"
import { useToast } from "@/hooks/use-toast"
import { faNum } from "@/lib/jalali"

interface SyncLog {
  id: string
  time: string
  type: string
  added: number
  updated: number
  status: "success" | "failed"
}

const seedLogs: SyncLog[] = [
  { id: "s1", time: "۱۴۰۴/۰۸/۰۷ ۱۲:۳۰", type: "هتل‌ها", added: 3, updated: 3, status: "success" },
  { id: "s2", time: "۱۴۴/۰۸/۰۶ ۰۹:۱۵", type: "تورها", added: 3, updated: 3, status: "success" },
  { id: "s3", time: "۱۴۰۴/۰۸/۰۵ ۲۲:۴۰", type: "انواع ویزا", added: 0, updated: 0, status: "failed" },
]

export default function SyncPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<SyncLog[]>(seedLogs)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState("۱۴۰۴/۰۸/۰۷ ۱۲:۳۰")

  const runSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      const now = new Date().toLocaleString("fa-IR")
      setLogs([
        { id: `s${Date.now()}`, time: now, type: "هتل‌ها", added: 3, updated: 3, status: "success" },
        ...logs,
      ])
      setLastSync(now)
      toast({ title: "همگام‌سازی کامل شد", description: "۳ مورد جدید، ۳ مورد بروزرسانی" })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">همگام‌سازی وردپرس</h1>
        <p className="mt-1 text-sm text-muted-foreground">دریافت هتل‌ها، تورها و انواع ویزا از سایت وردپرسی</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="وضعیت اتصال" className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">اتصال برقرار است</p>
              <p className="mt-0.5 text-xs text-muted-foreground">آخرین همگام‌سازی: {lastSync}</p>
            </div>
            <Badge variant="success">آنلاین</Badge>
          </div>
        </Panel>

        <Panel title="عملیات">
          <Button onClick={runSync} disabled={syncing} className="h-12 w-full rounded-sm bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-dark">
            {syncing ? (<><RefreshCw className="ml-2 h-4 w-4 animate-spin" />در حال همگام‌سازی...</>) : (<><RefreshCw className="ml-2 h-4 w-4" />همگام‌سازی اکنون</>)}
          </Button>
        </Panel>
      </div>

      <Panel title="تاریخچه همگام‌سازی" description="آخرین عملیات دریافت داده">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-right text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">زمان</th>
                <th className="pb-3 font-medium">نوع داده</th>
                <th className="pb-3 font-medium">افزوده</th>
                <th className="pb-3 font-medium">بروزرسانی</th>
                <th className="pb-3 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-muted-foreground">{l.time}</td>
                  <td className="py-3 font-bold text-foreground">{l.type}</td>
                  <td className="py-3 tabular-nums text-muted-foreground">{faNum(l.added)}</td>
                  <td className="py-3 tabular-nums text-muted-foreground">{faNum(l.updated)}</td>
                  <td className="py-3">
                    {l.status === "success" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-primary"><CheckCircle2 className="h-4 w-4" />موفق</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-danger"><XCircle className="h-4 w-4" />ناموفق</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
