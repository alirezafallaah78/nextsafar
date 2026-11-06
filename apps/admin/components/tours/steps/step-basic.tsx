"use client"

import { FileText, Globe, MapPin, Tag, Type } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { destinations, tourCategories, tourTypes } from "@/lib/tour-form"

interface StepBasicProps {
  data: any
  onChange: (data: any) => void
}

export function StepBasic({ data, onChange }: StepBasicProps) {
  const update = (field: string, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    update("title", newTitle)
    if (!data.slug || data.slug === generateSlug(data.title || "")) {
      onChange({ ...data, title: newTitle, slug: generateSlug(newTitle) })
    }
  }

  return (
    <div className="space-y-6">
      <Panel title="اطلاعات پایه تور" description="عنوان، مقصد و توضیحات اصلی تور">
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Type className="h-3.5 w-3.5 text-primary" />
              عنوان تور
            </Label>
            <Input
              value={data.title}
              onChange={handleTitleChange}
              placeholder="مثال: تور استانبول ۵ روزه"
              className="h-10 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Slug (آدرس URL)
            </Label>
            <Input
              value={data.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="istanbul-5d"
              dir="ltr"
              className="h-10 rounded-md font-mono text-left"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                مقصد
              </Label>
              <Select value={data.destination} onChange={(e) => update("destination", e.target.value)}>
                <option value="">انتخاب مقصد...</option>
                {destinations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Tag className="h-3.5 w-3.5 text-primary" />
                دسته‌بندی
              </Label>
              <Select value={data.category} onChange={(e) => update("category", e.target.value)}>
                <option value="">انتخاب دسته...</option>
                {tourCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-primary" />
                نوع تور
              </Label>
              <Select value={data.tourType} onChange={(e) => update("tourType", e.target.value)}>
                <option value="">انتخاب نوع...</option>
                {tourTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                وضعیت
              </Label>
              <Select value={data.status} onChange={(e) => update("status", e.target.value)}>
                <option value="draft">پیش‌نویس</option>
                <option value="ready">آماده انتشار</option>
                <option value="published">منتشر شده</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">توضیح کوتاه (نمایش در لیست)</Label>
            <Input
              value={data.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              placeholder="یک خط توضیح جذاب..."
              className="h-10 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">توضیحات کامل</Label>
            <textarea
              value={data.fullDescription}
              onChange={(e) => update("fullDescription", e.target.value)}
              rows={6}
              placeholder="توضیحات کامل تور..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>
      </Panel>
    </div>
  )
}
