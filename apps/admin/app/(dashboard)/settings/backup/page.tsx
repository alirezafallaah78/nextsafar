"use client"

import { useState } from "react"
import { CheckCircle2, Database, Download, Loader2, Save } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"
import { getSettings, runBackup, saveSettings, type BackupSettings } from "@/lib/admin-settings"
import { faNum } from "@/lib/jalali"

export default function BackupSettingsPage() {
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const [form, setForm] = useState<BackupSettings>(getSettings().backup)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)

  const update = (patch: Partial<BackupSettings>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      saveSettings("backup", form)
      log({ action: "update", entity: "settings", entityLabel: "تنظیمات پشتیبان‌گیری", description: "تنظیمات Backup بروزرسانی شد" })
      toast({ title: "ذخیره شد" })
      setSaving(false)
    }, 400)
  }

  const runBackupNow = async () => {
    setRunning(true)
    const result = await runBackup()
    if (result.success) {
      const now = new Date().toLocaleString("fa-IR")
      update({ lastBackup: now })
      saveSettings("backup", { ...form, lastBackup: now })
      log({ action: "export", entity: "settings", entityLabel: "پشتیبان‌گیری", description: `پشتیبان‌گیری دستی انجام شد (${result.size})` })
      toast({ title: "پشتیبان‌گیری موفق", description: `${result.message} (${result.size})` })
    }
    setRunning(false)
  }

  const storageLabels = {
    local: "ذخیره‌سازی محلی",
    s3: "Amazon S3",
    dropbox: "Dropbox",
  }

  const frequencyLabels = {
    daily: "روزانه",
    weekly: "هفتگی",
    monthly: "ماهانه",
  }

  return (
    <SettingsLayout title="پشتیبان‌گیری" description="تنظیمات Backup خودکار و دستی">
      <Panel title="پشتیبان‌گیری فوری">
        <div className="flex flex-col items-start gap-4 rounded-md border border-border bg-background p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">اجرای پشتیبان‌گیری دستی</p>
              <p className="mt-1 text-xs text-muted-foreground">
                آخرین پشتیبان: {form.lastBackup || "هرگز"}
              </p>
            </div>
          </div>
          <Button onClick={runBackupNow} disabled={running} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
            {running ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />در حال پشتیبان‌گیری...</> : <><Download className="ml-2 h-4 w-4" />پشتیبان‌گیری اکنون</>}
          </Button>
        </div>
      </Panel>

      <Panel title="تنظیمات خودکار">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">فرکانس پشتیبان‌گیری</Label>
            <Select value={form.frequency} onChange={(e) => update({ frequency: e.target.value as any })}>
              <option value="daily">روزانه</option>
              <option value="weekly">هفتگی</option>
              <option value="monthly">ماهانه</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">مدت نگهداری (روز)</Label>
            <Input type="number" min={1} max={365} value={form.retentionDays} onChange={(e) => update({ retentionDays: Number(e.target.value) })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold text-muted-foreground">محل ذخیره‌سازی</Label>
            <Select value={form.storage} onChange={(e) => update({ storage: e.target.value as any })}>
              {Object.entries(storageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">وضعیت</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-foreground">
              {form.autoBackup ? <><CheckCircle2 className="h-4 w-4 text-success" />فعال</> : "غیرفعال"}
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">فرکانس</p>
            <p className="mt-1 text-sm font-bold text-foreground">{frequencyLabels[form.frequency]}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">نگهداری</p>
            <p className="mt-1 text-sm font-bold text-foreground">{faNum(form.retentionDays)} روز</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="autoBackup"
            checked={form.autoBackup}
            onChange={(e) => update({ autoBackup: e.target.checked })}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <Label htmlFor="autoBackup" className="cursor-pointer text-sm">
            فعال‌سازی پشتیبان‌گیری خودکار
          </Label>
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
          {saving ? "در حال ذخیره..." : <><Save className="ml-2 h-4 w-4" />ذخیره</>}
        </Button>
      </div>
    </SettingsLayout>
  )
}
