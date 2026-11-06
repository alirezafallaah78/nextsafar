"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Bell,
  CreditCard,
  Database,
  Globe,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
} from "lucide-react"

import { Panel } from "@/components/dashboard/panel"
import InfoItem from "@/components/settings/InfoItem"
import { getSettings, type AllSettings } from "@/lib/admin-settings"

export default function SettingsOverviewPage() {
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<AllSettings | null>(null)

  useEffect(() => {
    setMounted(true)
    setSettings(getSettings())
  }, [])

  const modules = [
    {
      icon: SettingsIcon,
      title: "تنظیمات عمومی",
      desc: "نام سایت، لوگو، اطلاعات تماس و تنظیمات پایه",
      href: "/settings/general",
      colorClass: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Mail,
      title: "تنظیمات ایمیل",
      desc: "SMTP، قالب‌های ایمیل و تنظیمات ارسال",
      href: "/settings/email",
      colorClass: "bg-green-500/10 text-green-500",
    },
    {
      icon: MessageSquare,
      title: "تنظیمات پیامک",
      desc: "درگاه پیامک، قالب‌ها و تنظیمات ارسال SMS",
      href: "/settings/sms",
      colorClass: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: CreditCard,
      title: "تنظیمات پرداخت",
      desc: "درگاه‌های بانکی، API Key ها و تنظیمات مالی",
      href: "/settings/payment",
      colorClass: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Search,
      title: "تنظیمات سئو",
      desc: "متا تگ‌ها، نقشه سایت و بهینه‌سازی موتورهای جستجو",
      href: "/settings/seo",
      colorClass: "bg-pink-500/10 text-pink-500",
    },
    {
      icon: RefreshCw,
      title: "همگام‌سازی وردپرس",
      desc: "اتصال به وردپرس، تنظیمات webhook و sync",
      href: "/settings/sync",
      colorClass: "bg-cyan-500/10 text-cyan-500",
    },
    {
      icon: Database,
      title: "پشتیبان‌گیری",
      desc: "بکاپ خودکار از دیتابیس و فایل‌ها",
      href: "/settings/backup",
      colorClass: "bg-red-500/10 text-red-500",
    },
    {
      icon: Bell,
      title: "تنظیمات اطلاع‌رسانی",
      desc: "تنظیمات ارسال نوتیفیکیشن و اعلان‌ها",
      href: "/settings/notifications",
      colorClass: "bg-yellow-500/10 text-yellow-500",
    },
  ]

  // Skeleton در زمان SSR
  if (!mounted || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تنظیمات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت پیکربندی سیستم
          </p>
        </div>
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">تنظیمات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مدیریت پیکربندی سیستم و ماژول‌های مختلف
        </p>
      </div>

      {/* اطلاعات کلی سایت */}
      <Panel
        title="اطلاعات کلی سایت"
        description="تنظیمات پایه پلتفرم"
        icon={Globe}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="نام سایت" value={settings.general.siteName} />
          <InfoItem label="آدرس سایت" value={settings.general.siteUrl} ltr />
          <InfoItem label="تلفن پشتیبانی" value={settings.general.supportPhone} ltr />
          <InfoItem label="ایمیل پشتیبانی" value={settings.general.supportEmail} ltr />
          <InfoItem label="منطقه زمانی" value={settings.general.timezone} />
          <InfoItem
            label="زبان"
            value={settings.general.language === "fa" ? "فارسی" : "انگلیسی"}
          />
        </div>
      </Panel>

      {/* ماژول‌های تنظیمات */}
      <Panel
        title="ماژول‌های تنظیمات"
        description="برای ویرایش هر بخش روی کارت مربوطه کلیک کنید"
        icon={SettingsIcon}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((m) => {
            const Icon = m.icon
            const [bgClass, textClass] = m.colorClass.split(" ")
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${bgClass} transition group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${textClass}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
