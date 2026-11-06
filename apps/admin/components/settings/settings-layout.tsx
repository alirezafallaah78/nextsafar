"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Database,
  Globe,
  Mail,
  MessageSquare,
  Search as SearchIcon,
  Settings as SettingsIcon,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

const settingLinks = [
  { href: "/settings", label: "نمای کلی", icon: SettingsIcon, exact: true },
  { href: "/settings/general", label: "عمومی", icon: SettingsIcon },
  { href: "/settings/sms", label: "پیامک (SMS)", icon: MessageSquare },
  { href: "/settings/email", label: "ایمیل", icon: Mail },
  { href: "/settings/payment", label: "درگاه پرداخت", icon: CreditCard },
  { href: "/settings/seo", label: "سئو و آنالیتیکس", icon: SearchIcon },
  { href: "/settings/backup", label: "پشتیبان‌گیری", icon: Database },
]

interface SettingsLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

export function SettingsLayout({ title, description, children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">تنظیمات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          پیکربندی سیستم، پروایدرها و تنظیمات پیشرفته
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
        {/* سایدبار */}
        <aside className="space-y-1 xl:sticky xl:top-24 xl:self-start">
          {settingLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </aside>

        {/* محتوا */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
