"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Save, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichEditor } from "@/components/pages/rich-editor"
import { getPage, updatePage, type Page } from "@/lib/admin-pages"
import { useToast } from "@/hooks/use-toast"
import { useOperationLogger } from "@/hooks/use-operation-logger"

const templates = [
  { value: "default", label: "پیش‌فرض" },
  { value: "about", label: "درباره ما" },
  { value: "contact", label: "تماس با ما" },
  { value: "terms", label: "قوانین و مقررات" },
  { value: "privacy", label: "حریم خصوصی" },
  { value: "faq", label: "سوالات متداول" },
]

const statusOptions = [
  { value: "draft", label: "پیش‌نویس" },
  { value: "published", label: "منتشر شده" },
  { value: "archived", label: "آرشیو" },
]

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const { log } = useOperationLogger()

  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [template, setTemplate] = useState("default")
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [metaKeywords, setMetaKeywords] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const p = getPage(id)
    if (p) {
      setPage(p)
      setTitle(p.title)
      setSlug(p.slug)
      setContent(p.content)
      setTemplate(p.template)
      setStatus(p.status)
      setMetaTitle(p.metaTitle || "")
      setMetaDescription(p.metaDescription || "")
      setMetaKeywords(p.metaKeywords || "")
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-border bg-card p-16 text-center">
          <h2 className="text-xl font-bold text-foreground">صفحه یافت نشد</h2>
          <Button asChild className="mt-6 rounded-sm">
            <Link href="/pages">بازگشت</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (!title.trim() || !slug.trim()) {
      toast({ variant: "destructive", title: "خطا", description: "عنوان و Slug الزامی هستند" })
      return
    }
    setSaving(true)
    setTimeout(() => {
      updatePage(id, {
        title,
        slug,
        content,
        template,
        status,
        metaTitle,
        metaDescription,
        metaKeywords,
      })
      log({
        action: "update",
        entity: "settings",
        entityId: id,
        entityLabel: title,
        description: `صفحه «${title}» بروزرسانی شد`,
      })
      toast({ title: "ذخیره شد", description: title })
      router.push("/pages")
    }, 400)
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* سربرگ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-sm">
              <Link href="/pages">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">ویرایش صفحه</h1>
                {page.isSystem && (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    <Shield className="h-3 w-3" />
                    سیستمی
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{page.title}</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark"
          >
            {saving ? "در حال ذخیره..." : <><Save className="ml-2 h-4 w-4" />ذخیره</>}
          </Button>
        </div>

        {/* بنر هشدار صفحات سیستمی */}
        {page.isSystem && (
          <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold text-foreground">صفحه سیستمی</p>
              <p className="mt-1 text-xs text-muted-foreground">
                این صفحه یکی از صفحات اصلی سیستم است و <strong className="text-foreground">قابل حذف نیست</strong>.
                فقط می‌توانید محتوای آن را ویرایش کنید. Slug و قالب نیز قفل هستند.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ستون اصلی */}
          <div className="space-y-6 lg:col-span-2">
            {/* اطلاعات پایه */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-bold text-foreground">اطلاعات پایه</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">عنوان</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 text-base font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Slug (URL)</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={page.isSystem}
                    dir="ltr"
                    className="h-10 font-mono text-xs"
                    placeholder="page-slug"
                  />
                  {page.isSystem && (
                    <p className="text-[11px] text-danger">
                      🔒 Slug صفحات سیستمی قابل تغییر نیست
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* محتوا */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-bold text-foreground">محتوا</h3>
              <RichEditor content={content} onChange={setContent} />
            </div>

            {/* سئو */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-bold text-foreground">سئو</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">عنوان سئو</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title}
                    className="h-10"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {(metaTitle || title).length}/70 کاراکتر (توصیه)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">توضیحات سئو</Label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {metaDescription.length}/160 کاراکتر
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">کلمات کلیدی</Label>
                  <Input
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="کلمه۱، کلمه۲، کلمه۳"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ستون کناری */}
          <div className="space-y-6">
            {/* تنظیمات */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-bold text-foreground">تنظیمات</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">قالب</Label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    disabled={page.isSystem}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {templates.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {page.isSystem && (
                    <p className="text-[11px] text-danger">
                      🔒 قالب صفحات سیستمی قابل تغییر نیست
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">وضعیت</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* اطلاعات صفحه */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-bold text-foreground">اطلاعات</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">شناسه:</span>
                  <span className="font-mono font-bold text-foreground">{page.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ایجاد:</span>
                  <span className="font-bold text-foreground">
                    {new Date(page.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">آخرین ویرایش:</span>
                  <span className="font-bold text-foreground">
                    {new Date(page.updatedAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>
            </div>

            {/* پیش‌نمایش گوگل */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-bold text-foreground">پیش‌نمایش گوگل</h3>
              <div className="rounded-md border border-border bg-background p-3 text-left" dir="ltr">
                <p className="truncate text-sm font-bold text-[#1a0dab]">
                  {metaTitle || title || "Page Title"}
                </p>
                <p className="mt-1 truncate text-xs text-[#006621]">
                  https://nextsafar.ir/{slug || "..."}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-[#545454]">
                  {metaDescription || "Meta description will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
