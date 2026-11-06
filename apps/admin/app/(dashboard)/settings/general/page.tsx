"use client"

import { useState } from "react"
import { Save, ToggleLeft, ToggleRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"
import {
  currencyOptions,
  getSettings,
  languageOptions,
  saveSettings,
  timezoneOptions,
  type GeneralSettings,
} from "@/lib/admin-settings"

export default function GeneralSettingsPage() {
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const [form, setForm] = useState<GeneralSettings>(getSettings().general)
  const [saving, setSaving] = useState(false)

  const update = (patch: Partial<GeneralSettings>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      saveSettings("general", form)
      log({
        action: "update",
        entity: "settings",
        entityLabel: "تنظیمات عمومی",
        description: "تنظیمات عمومی سایت بروزرسانی شد",
      })
      toast({ title: "ذخیره شد", description: "تنظیمات عمومی با موفقیت ذخیره شد" })
      setSaving(false)
    }, 400)
  }

  return (
    <SettingsLayout title="تنظیمات عمومی" description="اطلاعات پایه سایت و پیکربندی‌های اصلی">
      <Panel title="اطلاعات سایت">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold text-muted-foreground">نام سایت</Label>
            <Input value={form.siteName} onChange={(e) => update({ siteName: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold text-muted-foreground">آدرس سایت (URL)</Label>
            <Input value={form.siteUrl} onChange={(e) => update({ siteUrl: e.target.value })} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">تلفن پشتیبانی</Label>
            <Input value={form.supportPhone} onChange={(e) => update({ supportPhone: e.target.value })} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">ایمیل پشتیبانی</Label>
            <Input value={form.supportEmail} onChange={(e) => update({ supportEmail: e.target.value })} dir="ltr" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold text-muted-foreground">آدرس پستی</Label>
            <Input value={form.address} onChange={(e) => update({ address: e.target.value })} />
          </div>
        </div>
      </Panel>

      <Panel title="محلی‌سازی">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">منطقه زمانی</Label>
            <Select value={form.timezone} onChange={(e) => update({ timezone: e.target.value })}>
              {timezoneOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">زبان پیش‌فرض</Label>
            <Select value={form.language} onChange={(e) => update({ language: e.target.value })}>
              {languageOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">واحد پول</Label>
            <Select value={form.currency} onChange={(e) => update({ currency: e.target.value })}>
              {currencyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
        </div>
      </Panel>

      <Panel title="حالت تعمیر و نگهداری">
        <div className="flex items-center justify-between rounded-md border border-border bg-background p-4">
          <div>
            <p className="text-sm font-bold text-foreground">فعال‌سازی Maintenance Mode</p>
            <p className="mt-1 text-xs text-muted-foreground">
              در حالت تعمیر، سایت برای کاربران عادی غیرقابل دسترس خواهد بود
            </p>
          </div>
          <button
            type="button"
            onClick={() => update({ maintenanceMode: !form.maintenanceMode })}
            className="text-muted-foreground hover:text-primary"
          >
            {form.maintenanceMode ? (
              <ToggleRight className="h-8 w-8 text-primary" />
            ) : (
              <ToggleLeft className="h-8 w-8" />
            )}
          </button>
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
          {saving ? "در حال ذخیره..." : <><Save className="ml-2 h-4 w-4" />ذخیره تنظیمات</>}
        </Button>
      </div>
    </SettingsLayout>
  )
}
