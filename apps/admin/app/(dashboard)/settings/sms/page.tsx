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
import { getSettings, saveSettings, smsProviderMap, testSmsConnection, type SmsSettings } from "@/lib/admin-settings"

export default function SmsSettingsPage() {
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const [form, setForm] = useState<SmsSettings>(getSettings().sms)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const update = (patch: Partial<SmsSettings>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      saveSettings("sms", form)
      log({
        action: "update",
        entity: "settings",
        entityLabel: "تنظیمات SMS",
        description: `پروایدر SMS به ${smsProviderMap[form.provider].label} تغییر کرد`,
        metadata: { provider: form.provider },
      })
      toast({ title: "ذخیره شد", description: "تنظیمات SMS ذخیره شد" })
      setSaving(false)
    }, 400)
  }

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testSmsConnection(form)
    setTestResult(result)
    setTesting(false)
  }

  const provider = smsProviderMap[form.provider]

  return (
    <SettingsLayout title="تنظیمات پیامک (SMS)" description="پیکربندی پروایدر SMS برای ارسال OTP و اعلان‌ها">
      <Panel title="وضعیت سرویس">
        <div className="flex items-center justify-between rounded-md border border-border bg-background p-4">
          <div>
            <p className="text-sm font-bold text-foreground">فعال‌سازی سرویس پیامک</p>
            <p className="mt-1 text-xs text-muted-foreground">
              در صورت غیرفعال بودن، پیامی به کاربران ارسال نخواهد شد
            </p>
          </div>
          <button type="button" onClick={() => update({ enabled: !form.enabled })} className="text-muted-foreground hover:text-primary">
            {form.enabled ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8" />}
          </button>
        </div>
      </Panel>

      <Panel title="پروایدر SMS">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">انتخاب پروایدر</Label>
            <Select value={form.provider} onChange={(e) => update({ provider: e.target.value as any })}>
              {Object.entries(smsProviderMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>

          {form.provider !== "disabled" && (
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{provider.label}</span>
                <Badge variant="secondary">فعال</Badge>
                {provider.url && (
                  <a href={provider.url} target="_blank" rel="noreferrer" className="mr-auto text-xs text-primary hover:underline">
                    سایت پروایدر ↗
                  </a>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold text-muted-foreground">کلید API</Label>
                  <Input value={form.apiKey} onChange={(e) => update({ apiKey: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" dir="ltr" type="password" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">شماره ارسال‌کننده</Label>
                  <Input value={form.senderNumber} onChange={(e) => update({ senderNumber: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">امضای پیامک</Label>
                  <Input value={form.signature} onChange={(e) => update({ signature: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* نتیجه تست */}
      {testResult && (
        <div className={`flex items-start gap-3 rounded-md border p-4 ${testResult.success ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"}`}>
          {testResult.success ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 text-danger" />
          )}
          <div>
            <p className={`text-sm font-bold ${testResult.success ? "text-success" : "text-danger"}`}>
              {testResult.success ? "تست موفق" : "تست ناموفق"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{testResult.message}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button onClick={test} disabled={testing || !form.enabled} variant="outline" className="rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
          {testing ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />در حال تست...</> : <><Send className="ml-2 h-4 w-4" />ارسال پیامک تست</>}
        </Button>
        <Button onClick={save} disabled={saving} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
          {saving ? "در حال ذخیره..." : <><Save className="ml-2 h-4 w-4" />ذخیره</>}
        </Button>
      </div>
    </SettingsLayout>
  )
}
