"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, Save, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { RichEditor } from "./rich-editor"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"
import {
  createPage,
  generateSlug,
  pageStatusMap,
  pageTemplateMap,
  updatePage,
  type PageRecord,
  type PageStatus,
  type PageTemplate,
} from "@/lib/admin-pages"
import { useAuth } from "@/hooks/use-auth"

type FormState = Omit<PageRecord, "id" | "createdAt" | "updatedAt">

const defaultForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  template: "default",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  author: "",
}

interface PageFormProps {
  mode: "create" | "edit"
  initial?: PageRecord
  pageId?: string
}

export function PageForm({ mode, initial, pageId }: PageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { log } = useOperationLogger()
  const { user } = useAuth()

  const [form, setForm] = useState<FormState>(
    initial ? { ...initial } : { ...defaultForm, author: user ? `${user.firstName} ${user.lastName}`.trim() : "Admin" }
  )
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [autoSlug, setAutoSlug] = useState(!initial)

  const update = (patch: Partial<FormState>) => {
    setForm((f) => {
      const next = { ...f, ...patch }
      if (autoSlug && patch.title !== undefined) {
        next.slug = generateSlug(patch.title)
      }
      return next
    })
  }

  const save = () => {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "خطا", description: "عنوان صفحه الزامی است" })
      return
    }
    if (!form.slug.trim()) {
      toast({ variant: "destructive", title: "خطا", description: "Slug الزامی است" })
      return
    }

    setSaving(true)
    setTimeout(() => {
      if (mode === "create") {
        const page = createPage(form)
        log({
          action: "create",
          entity: "settings",
          entityId: page.id,
          entityLabel: form.title,
          description: `صفحه جدید «${form.title}» ایجاد شد`,
        })
        toast({ title: "صفحه ایجاد شد", description: form.title })
        router.push("/pages")
      } else if (pageId) {
        updatePage(pageId, form)
        log({
          action: "update",
          entity: "settings",
          entityId: pageId,
          entityLabel: form.title,
          description: `صفحه «${form.title}» بروزرسانی شد`,
        })
        toast({ title: "ذخیره شد", description: form.title })
      }
      setSaving(false)
    }, 400)
  }

  const template = pageTemplateMap[form.template]
  const status = pageStatusMap[form.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-sm">
            <button onClick={() => router.push("/pages")}><ArrowRight className="h-5 w-5" /></button>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "create" ? "ایجاد صفحه جدید" : `ویرایش: ${form.title}`}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              محتوای صفحه را با ویرایشگر زیر تکمیل کنید
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)} className="rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
            <Eye className="ml-2 h-4 w-4" />
            {preview ? "بستن پیش‌نمایش" : "پیش‌نمایش"}
          </Button>
          <Button onClick={save} disabled={saving} className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark">
            {saving ? "در حال ذخیره..." : <><Save className="ml-2 h-4 w-4" />ذخیره</>}
          </Button>
        </div>
      </div>

      {initial?.isSystem && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">صفحه سیستمی</p>
            <p className="mt-1 text-xs text-muted-foreground">
              این صفحه یکی از صفحات اصلی سیستم است و <strong className="text-foreground">قابل حذف نیست</strong>.
              فقط می‌توانید محتوای آن را ویرایش کنید. Slug این صفحه نیز ثابت است و نباید تغییر کند.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ستون اصلی */}
        <div className="space-y-6 xl:col-span-2">
          <Panel title="محتوای صفحه">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  عنوان صفحه <span className="text-danger">*</span>
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="مثال: درباره ما"
                  className="h-11 text-base font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">خلاصه (excerpt)</Label>
                <Input
                  value={form.excerpt}
                  onChange={(e) => update({ excerpt: e.target.value })}
                  placeholder="توضیح کوتاه برای نمایش در لیست"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>محتوای کامل</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {form.content.length} کاراکتر
                  </span>
                </Label>
                {preview ? (
                  <div className="rounded-md border border-border bg-background p-6">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: form.content || "<p class='text-muted-foreground'>هنوز محتوایی نوشته نشده...</p>" }}
                    />
                  </div>
                ) : (
                  <RichEditor
                    value={form.content}
                    onChange={(html) => update({ content: html })}
                    placeholder="محتوای صفحه را اینجا بنویسید..."
                    minHeight={400}
                  />
                )}
              </div>
            </div>
          </Panel>
        </div>

        {/* ستون کناری */}
        <div className="space-y-6">
          <Panel title="قالب و وضعیت">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">قالب صفحه</Label>
                <Select 
                  value={form.template} 
                  onChange={(e) => update({ template: e.target.value as PageTemplate })}
                  disabled={initial?.isSystem}
                >
                  {Object.entries(pageTemplateMap).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </Select>
                <p className="text-[11px] text-muted-foreground">{template.desc}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">وضعیت</Label>
                <Select value={form.status} onChange={(e) => update({ status: e.target.value as PageStatus })}>
                  {Object.entries(pageStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
              </div>
            </div>
          </Panel>

          <Panel title="Slug و سئو">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>Slug (URL)</span>
                  {initial?.isSystem ? (
                    <span className="text-[10px] font-bold text-danger">🔒 ثابت (سیستمی)</span>
                  ) : (
                    <label className="flex cursor-pointer items-center gap-1 text-[10px] font-normal">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="h-3 w-3 accent-primary"
                      />
                      تولید خودکار
                    </label>
                  )}
                </Label>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    if (initial?.isSystem) return
                    setAutoSlug(false)
                    update({ slug: e.target.value })
                  }}
                  dir="ltr"
                  placeholder="about-us"
                  disabled={initial?.isSystem}
                  className="h-10 font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground" dir="ltr">
                  https://nextsafar.ir/{form.slug || "..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">عنوان سئو (Meta Title)</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => update({ metaTitle: e.target.value })}
                  placeholder={form.title || "عنوان پیش‌فرض"}
                  className="h-10"
                />
                <p className="text-[10px] text-muted-foreground">
                  {(form.metaTitle || form.title).length}/70 کاراکتر (توصیه)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">توضیحات سئو</Label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => update({ metaDescription: e.target.value })}
                  rows={3}
                  placeholder={form.excerpt || "توضیحات برای موتورهای جستجو"}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <p className="text-[10px] text-muted-foreground">
                  {form.metaDescription.length}/160 کاراکتر
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">کلمات کلیدی</Label>
                <Input
                  value={form.metaKeywords}
                  onChange={(e) => update({ metaKeywords: e.target.value })}
                  placeholder="کلمه۱، کلمه۲، کلمه۳"
                  className="h-10"
                />
              </div>
            </div>
          </Panel>

          <Panel title="پیش‌نمایش گوگل">
            <div className="rounded-md border border-border bg-background p-3 text-left" dir="ltr">
              <p className="truncate text-sm font-bold text-[#1a0dab]">
                {form.metaTitle || form.title || "Page Title"}
              </p>
              <p className="mt-1 truncate text-xs text-[#006621]">
                https://nextsafar.ir/{form.slug || "..."}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-[#545454]">
                {form.metaDescription || form.excerpt || "Meta description will appear here..."}
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
