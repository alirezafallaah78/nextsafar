"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Save, Send, ToggleLeft, ToggleRight, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"
import { emailProviderMap, getSettings, saveSettings, testEmailConnection, type EmailSettings } from "@/lib/admin-settings"

export default function EmailSettingsPage() {
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const [form, setForm] = useState<EmailSettings>(getSettings().email)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const update = (patch: Partial<EmailSettings>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      saveSettings("email", form)
      log({
        action: "update",
        entity: "settings",
        entityLabel: "تنظیمات ایمیل",
        description: "تنظیمات SMTP بروزرسانی شد",
      })
      toast({ title: "ذخیره شد", description: "تنظیمات ایمیل ذخیره شد" })
      setSaving(false)
    }, 400)
  }

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testEmailConnection(form)
    setTestResult(result)
    setTesting(false)
  }

  return (
    <SettingsLayout title="تنظیمات ایمیل" description="پیکربندی SMTP برای ارسال ایمیل به کاربران">
      <Panel title="وضعیت سرویس">
        <div className="flex items-center justify-between rounded-md border border-border bg-background p-4">
          <div>
            <p className="text-sm font-bold text-foreground">فعال‌سازی سرویس ایمیل</p>
            <p className="mt-1 text-xs text-muted-foreground">
              غیرفعال کردن این گزینه، ارسال تمام ایمیل‌ها را متوقف می‌کند
            </p>
          </div>
          <button type="button" onClick={() => update({ enabled: !form.enabled })} className="text-muted-foreground hover:text-primary">
            {form.enabled ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8" />}
          </button>
        </div>
      </Panel>

      <Panel title="پروایدر ایمیل">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">انتخاب پروایدر</Label>
            <Select value={form.provider} onChange={(e) => update({ provider: e.target.value as any })}>
              {Object.entries(emailProviderMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>

          {form.provider === "smtp" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">SMTP Host</Label>
                <Input value={form.host} onChange={(e) => update({ host: e.target.value })} dir="ltr" placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">پورت</Label>
                <Input type="number" value={form.port} onChange={(e) => update({ port: Number(e.target.value) })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">نام کاربری</Label>
                <Input value={form.username} onChange={(e) => update({ username: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">رمز عبور</Label>
                <Input type="password" value={form.password} onChange={(e) => update({ password: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">رمزنگاری</Label>
                <Select value={form.encryption} onChange={(e) => update({ encryption: e.target.value as any })}>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">بدون رمزنگاری</option>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">ایمیل ارسال‌کننده (From)</Label>
                <Input value={form.fromEmail} onChange={(e) => update({ fromEmail: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">نام ارسال‌کننده</Label>
                <Input value={form.fromName} onChange={(e) => update({ fromName: e.target.value })} />
              </div>
            </div>
          )}

          {(form.provider === "mailgun" || form.provider === "sendgrid") && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">API Key</Label>
                <Input value={form.username} onChange={(e) => update({ username: e.target.value })} dir="ltr" type="password" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">Domain / Subdomain</Label>
                <Input value={form.host} onChange={(e) => update({ host: e.target.value })} dir="ltr" />
              </div>
            </div>
          )}
        </div>
      </Panel>

      {testResult && (
        <div className={`flex items-start gap-3 rounded-md border p-4 ${testResult.success ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"}`}>
          {testResult.success ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" /> : <XCircle className="mt-0.5 h-5 w-5 text-danger" />}
          <div>
            <p className={`text-sm font-bold ${testResult.success ? "text-success" : "text-danger"}`}>
              {testResult.success ? "اتصال موفق" : "اتصال ناموفق"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{testResult.message}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button onClick={test} disabled={testing || !form.enabled} variant="outline" className="rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
          {testing ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />در حال تست...</> : <><Send className="ml-2 h-4 w-4" />تست اتصال</>}
        </Button>
        <Button onClick={save} disabled={saving} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
          {saving ? "در حال ذخیره..." : <><Save className="ml-2 h-4 w-4" />ذخیره</>}
        </Button>
      </div>
    </SettingsLayout>
  )
}
