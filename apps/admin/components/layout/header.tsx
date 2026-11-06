"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { getPageTitle } from "@/config/nav"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"
import { useTheme } from "@/hooks/use-theme"
import { auth } from "@/lib/auth"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { channelMap } from "@/lib/admin-notifications"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { isDark, setTheme, mounted } = useTheme()
  const { notifications, unreadCount, readOne, readAll } = useNotifications()

  const title = getPageTitle(pathname)
  const initials = user?.firstName?.[0] || user?.mobile?.slice(-2) || "AD"

  const toggleTheme = () => {
    document.documentElement.classList.add("theme-transitioning")
    setTheme(isDark ? "light" : "dark")
    setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 250)
  }

  const handleLogout = async () => {
    await auth.logout()
    router.push("/login")
  }

  const topNotifications = notifications.slice(0, 5)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
      {/* ═══ ارتفاع ثابت ۶۰px ═══ */}
      <div className="flex h-[60px] items-center justify-between gap-4 px-4 md:px-6">
        {/* راست: عنوان */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-accent"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground md:text-xl">{title}</h1>
        </div>

        {/* وسط: جستجو */}
        <div className="relative mx-6 hidden max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="جستجو در پنل..."
            className="h-10 w-full rounded-md border border-input bg-background pr-10 pl-12 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <kbd className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 hidden rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-block">
            ⌘K
          </kbd>
        </div>

        {/* چپ: اکشن‌ها */}
        <div className="flex items-center gap-2">
          {/* تم */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-accent hover:text-accent-foreground"
            onClick={toggleTheme}
            aria-label="تغییر تم"
          >
            {!mounted ? (
              <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            ) : isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* ═══ اعلان‌ها — هماهنگ با صفحه /notifications ═══ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-accent">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                    {unreadCount > 9 ? "+۹" : unreadCount.toLocaleString("fa-IR")}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} collisionPadding={16} className="w-80 p-0">
              {/* Header با badge و دکمه علامت‌گذاری همه */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">اعلان‌ها</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">
                      {unreadCount.toLocaleString("fa-IR")} جدید
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      readAll()
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-dark"
                  >
                    <Check className="h-3.5 w-3.5" />
                    خواندن همه
                  </button>
                )}
              </div>

              {/* لیست اعلان‌ها */}
              <div className="max-h-[320px] overflow-y-auto p-1.5">
                {topNotifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">اعلانی وجود ندارد</p>
                  </div>
                ) : (
                  topNotifications.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => !item.read && readOne(item.id)}
                      className={`block rounded-md px-3 py-3 ${item.read ? "bg-background" : "bg-primary/5"}`}
                    >
                      <div className="flex w-full items-start gap-3">
                        <div className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${item.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                          {channelMap[item.channel]?.icon || "🔔"}
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-foreground">
                              {item.title}
                            </p>
                            {!item.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground/70">{item.sentAt}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>

              {/* فوتر: مشاهده همه */}
              <div className="border-t border-border p-1.5">
                <DropdownMenuItem asChild className="justify-center rounded-md py-2 text-center font-bold text-primary">
                  <Link href="/notifications">مشاهده همه اعلان‌ها</Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* اقدام سریع */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary md:flex"
              >
                <Plus className="ml-1 h-4 w-4" />
                اقدام سریع
                <ChevronDown className="mr-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 text-right">
              <DropdownMenuItem asChild>
                <Link href="/tours/new" className="w-full justify-start text-right">تور جدید</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hotels/new" className="w-full justify-start text-right">هتل جدید</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/sync" className="w-full justify-start text-right">همگام‌سازی وردپرس</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leads" className="w-full justify-start text-right">درخواست‌های جدید</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-8" />

          {/* ═══ منوی کاربر (مدرن) ═══ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:ring-2 hover:ring-primary/40 focus:outline-none">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="آواتار"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <Avatar className="h-10 w-10 ring-2 ring-border">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              avoidCollisions
              collisionPadding={16}
              className="w-72 overflow-hidden rounded-lg border-border bg-card p-0 shadow-card-hover"
            >
              {/* بنر بالای منو */}
              <div className="relative bg-gradient-to-l from-primary to-primary-dark p-5">
                <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="آواتار"
                      className="h-14 w-14 rounded-full object-cover ring-4 ring-white/25"
                    />
                  ) : (
                    <Avatar className="h-14 w-14 ring-4 ring-white/25">
                      <AvatarFallback className="bg-white/20 text-lg font-extrabold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-extrabold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-white/80" dir="ltr">
                      {user?.mobile}
                    </p>
                  </div>
                </div>
                {user?.roles?.[0] && (
                  <span className="relative mt-3 inline-block rounded-sm bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {user.roles[0].displayName || user.roles[0].name}
                  </span>
                )}
              </div>

              {/* بدنه منو */}
              <div className="p-2">
                <DropdownMenuItem asChild className="rounded-md px-3 py-2.5">
                  <Link href="/settings/profile" className="w-full justify-start gap-3 text-right">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium">پروفایل من</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-md px-3 py-2.5">
                  <Link href="/settings" className="w-full justify-start gap-3 text-right">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Settings className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium">تنظیمات</span>
                  </Link>
                </DropdownMenuItem>

                <div className="my-1.5 h-px bg-border" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2.5 text-danger focus:bg-danger/10 focus:text-danger"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-danger/10">
                    <LogOut className="h-4 w-4 text-danger" />
                  </span>
                  <span className="w-full justify-start text-right font-medium">خروج از حساب</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
