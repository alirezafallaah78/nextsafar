"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, Save, Send, ToggleLeft, ToggleRight, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"
import { getSettings, paymentProviderMap, saveSettings, testPaymentConnection, type PaymentSettings } from "@/lib/admin-settings"
import { faNum, faPrice } from "@/lib/jalali"

export default function PaymentSettingsPage() {
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const [form, setForm] = useState<PaymentSettings>(getSettings().payment)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const update = (patch: Partial<PaymentSettings>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      saveSettings("payment", form)
      log({
        action: "update",
        entity: "settings",
        entityLabel: "تنظیمات درگاه پرداخت",
        description: `درگاه پرداخت ${paymentProviderMap[form.provider].label} بروزرسانی شد`,
      })
      toast({ title: "ذخیره شد", description: "تنظیمات درگاه پرداخت ذخیره شد" })
      setSaving(false)
    }, 400)
  }

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testPaymentConnection(form)
    setTestResult(result)
    setTesting(false)
  }

  const provider = paymentProviderMap[form.provider]

  return (
    <SettingsLayout title="تنظیمات درگاه پرداخت" description="پیکربندی درگاه پرداخت آنلاین">
      <Panel title="وضعیت درگاه">
        <div className="flex items-center justify-between rounded-md border border-border bg-background p-4">
          <div>
            <p className="text-sm font-bold text-foreground">فعال‌سازی پرداخت آنلاین</p>
            <p className="mt-1 text-xs text-muted-foreground">
              در صورت غیرفعال بودن، کاربران فقط می‌توانند سفارش ثبت کنند ولی پرداخت انجام نمی‌شود
            </p>
          </div>
          <button type="button" onClick={() => update({ enabled: !form.enabled })} className="text-muted-foreground hover:text-primary">
            {form.enabled ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8" />}
          </button>
        </div>
      </Panel>

      <Panel title="انتخاب پروایدر">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(paymentProviderMap).filter(([k]) => k !== "disabled").map(([key, prov]) => (
              <button
                key={key}
                type="button"
                onClick={() => update({ provider: key as any })}
                className={`rounded-md border-2 p-4 text-right transition ${form.provider === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <p className="text-sm font-bold text-foreground">{prov.label}</p>
                <a href={prov.url} target="_blank" rel="noreferrer" className="mt-1 block text-[11px] text-primary hover:underline">
                  {prov.url.replace("https://", "")} ↗
                </a>
              </button>
            ))}
          </div>

          <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              <p className="text-xs text-muted-foreground">
                در حالت <strong>Sandbox</strong> پرداخت‌ها واقعی نیستند و فقط برای تست استفاده می‌شوند.
                قبل از انتشار در پروداکشن، این گزینه را غیرفعال کنید.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold text-muted-foreground">شناسه پذیرنده (Merchant ID)</Label>
              <Input value={form.merchantId} onChange={(e) => update({ merchantId: e.target.value })} dir="ltr" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold text-muted-foreground">آدرس Callback</Label>
              <Input value={form.callbackUrl} onChange={(e) => update({ callbackUrl: e.target.value })} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">حداقل مبلغ (ریال)</Label>
              <Input type="number" value={form.minAmount} onChange={(e) => update({ minAmount: Number(e.target.value) })} dir="ltr" />
              <p className="text-[10px] text-muted-foreground">{faPrice(form.minAmount)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">حداکثر مبلغ (ریال)</Label>
              <Input type="number" value={form.maxAmount} onChange={(e) => update({ maxAmount: Number(e.target.value) })} dir="ltr" />
              <p className="text-[10px] text-muted-foreground">{faPrice(form.maxAmount)}</p>
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <button type="button" onClick={() => update({ sandboxMode: !form.sandboxMode })} className="text-muted-foreground hover:text-primary">
                {form.sandboxMode ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
              <div>
                <p className="text-sm font-bold text-foreground">حالت Sandbox (تست)</p>
                <p className="text-xs text-muted-foreground">
                  {form.sandboxMode ? "پرداخت‌ها واقعی نیستند" : "پرداخت‌ها واقعی انجام می‌شوند"}
                </p>
              </div>
            </div>
          </div>
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
