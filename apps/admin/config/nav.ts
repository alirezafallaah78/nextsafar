import {
  LayoutDashboard,
  Plane,
  Hotel,
  RefreshCw,
  MessageSquare,
  ShoppingCart,
  CreditCard,
  RotateCcw,
  Users,
  UserRound,
  ShieldCheck,
  FileText,
  Files,
  Bell,
  Tag,
  Settings,
  BarChart3,
  ScrollText,
  LogIn,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: any
  badge?: number | string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: "اصلی",
    items: [
      { title: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "کاتالوگ",
    items: [
      { title: "تورها", href: "/tours", icon: Plane },
      { title: "هتل‌ها", href: "/hotels", icon: Hotel },
      { title: "همگام‌سازی وردپرس", href: "/settings/sync", icon: RefreshCw },
    ],
  },
  {
    title: "فروش",
    items: [
      { title: "درخواست‌ها", href: "/leads", icon: MessageSquare, badge: 7 },
      { title: "سفارش‌ها", href: "/orders", icon: ShoppingCart },
      { title: "پرداخت‌ها", href: "/payments", icon: CreditCard },
      { title: "استردادها", href: "/refunds", icon: RotateCcw },
      { title: "کدهای تخفیف", href: "/coupons", icon: Tag },
    ],
  },
  {
    title: "مشتریان",
    items: [
      { title: "کاربران", href: "/users", icon: Users },
      { title: "مسافران", href: "/users/passengers", icon: UserRound },
      { title: "نقش‌ها", href: "/users/roles", icon: ShieldCheck },
    ],
  },
  {
    title: "ویزا",
    items: [
      { title: "پرونده‌های ویزا", href: "/visas/cases", icon: FileText },
    ],
  },
  {
    title: "ارتباطات",
    items: [
      { title: "اطلاع‌رسانی‌ها", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "سیستم",
    items: [
      { title: "صفحات", href: "/pages", icon: Files },
      { title: "گزارش‌ها", href: "/reports", icon: BarChart3 },
      { title: "تنظیمات", href: "/settings", icon: Settings },
      { title: "لاگ عملیات", href: "/logs/operations", icon: ScrollText },
      { title: "لاگ ورود ادمین", href: "/logs/admin", icon: LogIn },
    ],
  },
]

export function getPageTitle(pathname: string): string {
  for (const section of navSections) {
    for (const item of section.items) {
      if (pathname === item.href) return item.title
      if (pathname.startsWith(item.href + "/")) return item.title
    }
  }
  return "داشبورد"
}
