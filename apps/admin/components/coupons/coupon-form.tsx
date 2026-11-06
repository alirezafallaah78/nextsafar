"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Save } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { MoneyInput } from "@/components/ui/money-input"
import { Panel } from "@/components/dashboard/panel"
import { PersianDatePicker } from "@/components/ui/persian-date-picker"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"
import { createCoupon, updateCoupon, type CouponRecord, type CouponType } from "@/lib/admin-coupons"
import { listTours, toViewModel } from "@/lib/admin-tours"
import { formatJalaliDate, parseJalaliDate } from "@/lib/jalali"

type FormState = Omit<CouponRecord, "id" | "usedCount" | "createdAt">

const defaultState: FormState = {
  code: "",
  type: "percent",
  value: 10,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 100,
  perUserLimit: 1,
  validTours: [],
  startsAt: "",
  expiresAt: "",
  status: "active",
  description: "",
}

interface CouponFormProps {
  mode: "create" | "edit"
  initial?: CouponRecord
  couponId?: string
}

export function CouponForm({ mode, initial, couponId }: CouponFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const [form, setForm] = useState<FormState>(initial ? { ...initial } : defaultState)
  const [saving, setSaving] = useState(false)

  const tours = listTours().map(toViewModel)
  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const toggleTour = (tourId: string) => {
    const list = form.validTours.includes(tourId)
      ? form.validTours.filter((id) => id !== tourId)
      : [...form.validTours, tourId]
    update({ validTours: list })
  }

  const submit = () => {
    if (!form.code.trim()) {
      toast({ variant: "destructive", title: "خطا", description: "کد تخفیف الزامی است" })
      return
    }
    if (form.code.trim().length < 3) {
      toast({ variant: "destructive", title: "خطا", description: "کد باید حداقل ۳ کاراکتر باشد" })
      return
    }
    setSaving(true)
    const payload = { ...form, code: form.code.trim().toUpperCase().replace(/\s/g, "-") }
    setTimeout(() => {
      if (mode === "create") {
        createCoupon(payload)
        log({
          action: "create",
          entity: "coupon",
          entityId: payload.code,
          entityLabel: payload.code,
          description: `کد تخفیف ${payload.code} ایجاد شد (${payload.type === "percent" ? payload.value + "٪" : "مبلغ ثابت"})`,
          metadata: { type: payload.type, value: payload.value },
        })
      }
      else if (couponId) {
        updateCoupon(couponId, { ...payload, usedCount: initial?.usedCount ?? 0 } as any)
        log({
          action: "update",
          entity: "coupon",
          entityId: couponId,
          entityLabel: payload.code,
          description: `کد تخفیف ${payload.code} بروزرسانی شد`,
        })
      }
      toast({ title: mode === "create" ? "کد ایجاد شد" : "کد بروزرسانی شد", description: payload.code })
      router.push("/coupons")
    }, 300)
  }

  const previewDiscount = () => {
    const sample = 20000000
    let discount = 0
    if (form.type === "percent") {
      discount = (sample * form.value) / 100
      if (form.maxDiscount > 0) discount = Math.min(discount, form.maxDiscount)
    } else {
      discount = form.value
    }
    return discount
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-sm">
            <button onClick={() => router.push("/coupons")}><ArrowRight className="h-5 w-5" /></button>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "create" ? "ایجاد کد تخفیف" : `ویرایش ${form.code}`}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">اطلاعات کوپن را تکمیل کنید</p>
          </div>
        </div>
        <Button onClick={submit} disabled={saving} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
          {saving ? "در حال ذخیره..." : <><Save className="ml-2 h-4 w-4" />ذخیره</>}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ستون اصلی */}
        <div className="space-y-6 xl:col-span-2">
          <Panel title="اطلاعات کد">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">کد تخفیف (حروف انگلیسی)</Label>
                <Input value={form.code} onChange={(e) => update({ code: e.target.value.toUpperCase() })} placeholder="SUMMER20" dir="ltr" className="h-10 rounded-md font-mono text-left tracking-wider" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">نوع تخفیف</Label>
                <Select value={form.type} onChange={(e) => update({ type: e.target.value as CouponType })} className="h-10">
                  <option value="percent">درصدی</option>
                  <option value="fixed">مبلغ ثابت</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">
                  مقدار {form.type === "percent" ? "(درصد)" : "(ریال)"}
                </Label>
                {form.type === "percent" ? (
                  <div className="relative">
                    <Input type="number" min={1} max={100} value={form.value} onChange={(e) => update({ value: Number(e.target.value) })} className="h-10 rounded-md pl-10 tabular-nums" />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">٪</span>
                  </div>
                ) : (
                  <MoneyInput value={form.value} onChange={(v) => update({ value: v })} />
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">توضیحات (اختیاری)</Label>
                <Input value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="مثلاً: تخفیف ویژه تابستان" className="h-10 rounded-md" />
              </div>
            </div>
          </Panel>

          <Panel title="محدودیت‌های مالی">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">حداقل مبلغ سفارش (ریال)</Label>
                <MoneyInput value={form.minOrderAmount} onChange={(v) => update({ minOrderAmount: v })} />
              </div>
              {form.type === "percent" && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">سقف تخفیف (ریال)</Label>
                  <MoneyInput value={form.maxDiscount} onChange={(v) => update({ maxDiscount: v })} />
                </div>
              )}
            </div>
          </Panel>

          <Panel title="محدودیت‌های استفاده">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">تعداد کل قابل استفاده</Label>
                <Input type="number" min={1} value={form.usageLimit} onChange={(e) => update({ usageLimit: Number(e.target.value) })} className="h-10 rounded-md tabular-nums" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">محدودیت هر کاربر</Label>
                <Input type="number" min={1} value={form.perUserLimit} onChange={(e) => update({ perUserLimit: Number(e.target.value) })} className="h-10 rounded-md tabular-nums" />
              </div>
            </div>
          </Panel>

          <Panel title="تورهای مجاز" description="اگر خالی باشد، برای همه تورها قابل استفاده است">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {tours.map((t) => {
                const selected = form.validTours.includes(t.id)
                return (
                  <button key={t.id} type="button" onClick={() => toggleTour(t.id)} className={`flex items-center gap-2 rounded-md border p-2.5 text-right text-xs transition ${selected ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background hover:border-primary/30"}`}>
                    <span className={`flex h-4 w-4 items-center justify-center rounded-sm border ${selected ? "border-primary bg-primary text-white" : "border-border"}`}>
                      {selected && <span className="text-[10px]">✓</span>}
                    </span>
                    <span className="truncate">{t.title}</span>
                  </button>
                )
              })}
              {tours.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground md:col-span-2 xl:col-span-3">توری تعریف نشده.</p>}
            </div>
            {form.validTours.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <span className="text-xs font-bold text-muted-foreground">انتخاب‌شده:</span>
                <Badge variant="secondary">{form.validTours.length} تور</Badge>
                <button type="button" onClick={() => update({ validTours: [] })} className="text-[11px] font-bold text-danger hover:underline">
                  پاک کردن همه
                </button>
              </div>
            )}
          </Panel>
        </div>

        {/* ستون کناری */}
        <div className="space-y-6">
          <Panel title="بازه اعتبار">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">شروع</Label>
                <PersianDatePicker mode="single" value={parseJalaliDate(form.startsAt) || null} onChange={(d) => update({ startsAt: d instanceof Date ? formatJalaliDate(d) : "" })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">پایان</Label>
                <PersianDatePicker mode="single" value={parseJalaliDate(form.expiresAt) || null} onChange={(d) => update({ expiresAt: d instanceof Date ? formatJalaliDate(d) : "" })} />
              </div>
            </div>
          </Panel>

          <Panel title="وضعیت">
            <Select value={form.status} onChange={(e) => update({ status: e.target.value as any })} className="h-10">
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </Select>
          </Panel>

          <Panel title="پیش‌نمایش">
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-primary/10 p-3 text-center">
                <p className="text-xs text-muted-foreground">برای سفارش نمونه ۲۰,۰۰۰,۰۰۰ ریال:</p>
                <p className="mt-2 text-xl font-extrabold text-primary">{formatPrice(previewDiscount())}</p>
                <p className="text-xs text-muted-foreground">تخفیف اعمال می‌شود</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">کد:</span><span className="font-mono font-bold text-foreground" dir="ltr">{form.code || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">نوع:</span><span className="font-bold text-foreground">{form.type === "percent" ? "درصدی" : "مبلغ ثابت"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">مقدار:</span><span className="font-bold text-foreground">{form.type === "percent" ? `${formatNum(form.value)}٪` : formatPrice(form.value)}</span></div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function formatPrice(v: number) {
  return `${new Intl.NumberFormat("fa-IR").format(v)} ریال`
}

function formatNum(v: number) {
  return new Intl.NumberFormat("fa-IR").format(v)
}
