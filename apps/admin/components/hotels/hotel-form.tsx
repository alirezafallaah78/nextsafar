"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { MoneyInput } from "@/components/ui/money-input"
import { Panel } from "@/components/dashboard/panel"
import { useToast } from "@/hooks/use-toast"
import {
  cities, createHotel, hotelAmenities, updateHotel, type HotelRecord,
} from "@/lib/admin-hotels"
import { cn } from "@/lib/utils"

type HotelFormState = Omit<HotelRecord, "id" | "createdAt" | "updatedAt">

const defaultState: HotelFormState = {
  name: "",
  slug: "",
  city: "",
  country: "ایران",
  address: "",
  stars: 4,
  status: "active",
  source: "manual",
  description: "",
  amenities: ["wifi"],
  roomsCount: 0,
  priceRange: { min: 0, max: 0 },
}

interface HotelFormProps {
  mode: "create" | "edit"
  initial?: HotelRecord
  hotelId?: string
}

export function HotelForm({ mode, initial, hotelId }: HotelFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<HotelFormState>(initial ?? defaultState)
  const [saving, setSaving] = useState(false)

  const update = (patch: Partial<HotelFormState>) => setForm((f) => ({ ...f, ...patch }))

  const toggleAmenity = (id: string) =>
    update({
      amenities: form.amenities.includes(id)
        ? form.amenities.filter((a) => a !== id)
        : [...form.amenities, id],
    })

  const save = () => {
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "خطا", description: "نام هتل الزامی است" })
      return
    }
    setSaving(true)
    const slug = form.slug.trim() || form.name.trim().replace(/\s+/g, "-")
    const payload = { ...form, slug }
    setTimeout(() => {
      if (mode === "create") createHotel(payload)
      else if (hotelId) updateHotel(hotelId, payload)
      toast({ title: mode === "create" ? "هتل ایجاد شد" : "هتل ذخیره شد", description: form.name })
      router.push("/hotels")
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "create" ? "افزودن هتل جدید" : `ویرایش ${form.name}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">اطلاعات هتل را تکمیل کنید</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/hotels")} className="rounded-sm">
          <ArrowRight className="ml-2 h-4 w-4" />
          بازگشت
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ستون اصلی */}
        <div className="space-y-6 xl:col-span-2">
          <Panel title="اطلاعات پایه" description="نام، موقعیت و رتبه هتل">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">نام هتل</Label>
                <Input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="مثال: هتل اسپیناس پالاس" className="h-10 rounded-md" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Slug</Label>
                <Input value={form.slug} onChange={(e) => update({ slug: e.target.value })} placeholder="espina-palace" dir="ltr" className="h-10 rounded-md font-mono text-left" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">ستاره</Label>
                <Select value={String(form.stars)} onChange={(e) => update({ stars: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} ستاره</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">شهر</Label>
                <Select value={form.city} onChange={(e) => update({ city: e.target.value })}>
                  <option value="">انتخاب شهر...</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">کشور</Label>
                <Input value={form.country} onChange={(e) => update({ country: e.target.value })} className="h-10 rounded-md" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">آدرس</Label>
                <Input value={form.address} onChange={(e) => update({ address: e.target.value })} placeholder="آدرس کامل هتل..." className="h-10 rounded-md" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">توضیحات</Label>
                <textarea value={form.description} onChange={(e) => update({ description: e.target.value })} rows={4} placeholder="توضیحات هتل..." className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
            </div>
          </Panel>

          <Panel title="امکانات هتل" description="امکانات موجود را تیک بزنید">
            <div className="grid gap-x-6 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
              {hotelAmenities.map((a) => {
                const on = form.amenities.includes(a.id)
                return (
                  <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                    className={cn("flex items-center gap-2.5 rounded-md px-2 py-2 text-right text-sm transition", on ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    <span className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border transition", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}>
                      {on && <Check className="h-3.5 w-3.5" />}
                    </span>
                    {a.name}
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>

        {/* ستون کناری */}
        <div className="space-y-6">
          <Panel title="وضعیت و ظرفیت" description="تنظیمات operasional هتل">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">وضعیت</Label>
                <Select value={form.status} onChange={(e) => update({ status: e.target.value as any })}>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                  <option value="pending">در انتظار بررسی</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">تعداد اتاق</Label>
                <Input type="number" min={0} value={form.roomsCount} onChange={(e) => update({ roomsCount: Math.max(0, Number(e.target.value)) })} className="h-10 rounded-md tabular-nums" />
              </div>
            </div>
          </Panel>

          <Panel title="بازه قیمت هر شب" description="حداقل و حداکثر قیمت اتاق">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">از</Label>
                <MoneyInput value={form.priceRange.min} onChange={(v) => update({ priceRange: { ...form.priceRange, min: v } })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">تا</Label>
                <MoneyInput value={form.priceRange.max} onChange={(v) => update({ priceRange: { ...form.priceRange, max: v } })} />
              </div>
            </div>
          </Panel>

          <Button onClick={save} disabled={saving} className="h-12 w-full rounded-sm bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-dark">
            {saving ? "در حال ذخیره..." : (<><Save className="ml-2 h-4 w-4" />ذخیره هتل</>)}
          </Button>
        </div>
      </div>
    </div>
  )
}
