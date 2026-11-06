"use client"

import { useState } from "react"
import { Save, ToggleLeft, ToggleRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/dashboard/panel"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"
import { getSettings, saveSettings, type SeoSettings } from "@/lib/admin-settings"

export default function SeoSettingsPage() {
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const [form, setForm] = useState<SeoSettings>(getSettings().seo)
  const [saving, setSaving] = useState(false)

  const update = (patch: Partial<SeoSettings>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      saveSettings("seo", form)
      log({ action: "update", entity: "settings", entityLabel: "تنظیمات SEO", description: "تنظیمات SEO بروزرسانی شد" })
      toast({ title: "ذخیره شد", description: "تنظیمات SEO ذخیره شد" })
      setSaving(false)
    }, 400)
  }

  return (
    <SettingsLayout title="سئو و آنالیتیکس" description="تنظیمات SEO و ابزارهای تحلیلی">
      <Panel title="متا تگ‌های پیش‌فرض">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">عنوان پیش‌فرض (Title)</Label>
            <Input value={form.defaultTitle} onChange={(e) => update({ defaultTitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">توضیحات پیش‌فرض (Description)</Label>
            <textarea
              value={form.defaultDescription}
              onChange={(e) => update({ defaultDescription: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-[10px] text-muted-foreground">{form.defaultDescription.length}/160 کاراکتر (توصیه شده)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">کلمات کلیدی</Label>
            <Input value={form.defaultKeywords} onChange={(e) => update({ defaultKeywords: e.target.value })} placeholder="کلمه۱، کلمه۲، کلمه۳" />
          </div>
        </div>
      </Panel>

      <Panel title="ابزارهای گوگل">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">Google Analytics ID</Label>
            <Input value={form.googleAnalyticsId} onChange={(e) => update({ googleAnalyticsId: e.target.value })} dir="ltr" placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">Search Console Code</Label>
            <Input value={form.googleSearchConsole} onChange={(e) => update({ googleSearchConsole: e.target.value })} dir="ltr" />
          </div>
        </div>
      </Panel>

      <Panel title="فایل‌های سیستمی">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">robots.txt</Label>
            <textarea
              value={form.robotsTxt}
              onChange={(e) => update({ robotsTxt: e.target.value })}
              rows={5}
              dir="ltr"
              className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-background p-4">
            <div>
              <p className="text-sm font-bold text-foreground">Sitemap خودکار</p>
              <p className="mt-1 text-xs text-muted-foreground">تولید sitemap.xml به‌صورت خودکار</p>
            </div>
            <button type="button" onClick={() => update({ sitemapEnabled: !form.sitemapEnabled })} className="text-muted-foreground hover:text-primary">
              {form.sitemapEnabled ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8" />}
            </button>
          </div>
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
