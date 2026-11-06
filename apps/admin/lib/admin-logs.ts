/* ═══ ماژول لاگ — Audit Trail حرفه‌ای ═══ */

export type OperationAction = "create" | "update" | "delete" | "login" | "logout" | "export" | "import" | "sync" | "status_change"
export type OperationEntity = "tour" | "hotel" | "order" | "payment" | "refund" | "lead" | "user" | "coupon" | "visa_case" | "notification" | "settings"
export type LogLevel = "info" | "warning" | "error" | "critical"

export interface OperationLog {
  id: string
  userId: string
  userName: string
  action: OperationAction
  entity: OperationEntity
  entityId?: string
  entityLabel?: string
  description: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AdminLoginLog {
  id: string
  userId: string
  userName: string
  mobile: string
  role: string
  ipAddress: string
  userAgent: string
  location?: string
  status: "success" | "failed"
  failedReason?: string
  createdAt: string
}

const OPS_KEY = "nextsafar_admin_operation_logs_v1"
const LOGIN_KEY = "nextsafar_admin_login_logs_v1"

export const actionMap: Record<OperationAction, { label: string; icon: string; color: string }> = {
  create: { label: "ایجاد", icon: "➕", color: "bg-success/10 text-success" },
  update: { label: "بروزرسانی", icon: "✏️", color: "bg-primary/10 text-primary" },
  delete: { label: "حذف", icon: "🗑️", color: "bg-danger/10 text-danger" },
  login: { label: "ورود", icon: "🔑", color: "bg-primary/10 text-primary" },
  logout: { label: "خروج", icon: "🚪", color: "bg-muted text-muted-foreground" },
  export: { label: "خروجی", icon: "📤", color: "bg-info/10 text-info" },
  import: { label: "ورود داده", icon: "📥", color: "bg-info/10 text-info" },
  sync: { label: "همگام‌سازی", icon: "🔄", color: "bg-warning/10 text-warning" },
  status_change: { label: "تغییر وضعیت", icon: "🔁", color: "bg-warning/10 text-warning" },
}

export const entityMap: Record<OperationEntity, string> = {
  tour: "تور",
  hotel: "هتل",
  order: "سفارش",
  payment: "پرداخت",
  refund: "استرداد",
  lead: "درخواست",
  user: "کاربر",
  coupon: "کد تخفیف",
  visa_case: "پرونده ویزا",
  notification: "اعلان",
  settings: "تنظیمات",
}

export const logLevelMap: Record<LogLevel, { label: string; variant: "info" | "outline" | "destructive" | "success" }> = {
  info: { label: "عادی", variant: "info" },
  warning: { label: "هشدار", variant: "outline" },
  error: { label: "خطا", variant: "destructive" },
  critical: { label: "بحرانی", variant: "destructive" },
}

/* ═══ داده نمونه ═══ */
function seedOperationLogs(): OperationLog[] {
  return [
    {
      id: "op-1",
      userId: "u1",
      userName: "Super Admin",
      action: "create",
      entity: "tour",
      entityId: "t1",
      entityLabel: "تور استانبول ۵ روزه",
      description: "تور جدید با ۲ تاریخ حرکت ایجاد شد",
      metadata: { dates: 2, capacity: 45 },
      ipAddress: "192.168.1.1",
      createdAt: "۱۴۰۴/۰۸/۰۸ ۱۴:۳۰",
    },
    {
      id: "op-2",
      userId: "u4",
      userName: "حسین موسوی",
      action: "status_change",
      entity: "lead",
      entityId: "LEAD-101",
      entityLabel: "درخواست محمد حسینی",
      description: "وضعیت از «جدید» به «تماس گرفته شد» تغییر کرد",
      metadata: { from: "new", to: "contacted" },
      ipAddress: "192.168.1.50",
      createdAt: "۱۴۰۴/۰۸/۰۸ ۱۳:۱۵",
    },
    {
      id: "op-3",
      userId: "u5",
      userName: "زهرا احمدی",
      action: "update",
      entity: "hotel",
      entityId: "h2",
      entityLabel: "هتل هما شیراز",
      description: "قیمت‌های هتل بروزرسانی شد",
      ipAddress: "192.168.1.100",
      createdAt: "۱۴۰۴/۰۸/۰۸ ۱۱:۴۵",
    },
    {
      id: "op-4",
      userId: "u1",
      userName: "Super Admin",
      action: "sync",
      entity: "settings",
      entityLabel: "وردپرس",
      description: "همگام‌سازی با وردپرس انجام شد (۳ هتل جدید)",
      metadata: { added: 3, updated: 1 },
      ipAddress: "192.168.1.1",
      createdAt: "۱۴۰۴/۰۸/۰۸ ۱۰:۰۰",
    },
    {
      id: "op-5",
      userId: "u1",
      userName: "Super Admin",
      action: "delete",
      entity: "coupon",
      entityId: "cpn-5",
      entityLabel: "OLDYEAR",
      description: "کد تخفیف منقضی حذف شد",
      ipAddress: "192.168.1.1",
      createdAt: "۱۴۰۴/۰۸/۰۷ ۱۶:۲۰",
    },
    {
      id: "op-6",
      userId: "u4",
      userName: "حسین موسوی",
      action: "update",
      entity: "visa_case",
      entityId: "VC-101",
      entityLabel: "پرونده ویزای علی رضایی",
      description: "وضعیت پرونده به «در حال بررسی» تغییر کرد",
      ipAddress: "192.168.1.50",
      createdAt: "۱۴۰۴/۰۸/۰۷ ۱۵:۳۰",
    },
    {
      id: "op-7",
      userId: "u1",
      userName: "Super Admin",
      action: "create",
      entity: "user",
      entityId: "u7",
      entityLabel: "نگار محمدی",
      description: "کاربر جدید به‌عنوان مشتری ثبت شد",
      ipAddress: "192.168.1.1",
      createdAt: "۱۴۰۴/۰۸/۰۷ ۱۴:۰۰",
    },
  ]
}

function seedLoginLogs(): AdminLoginLog[] {
  return [
    {
      id: "lg-1",
      userId: "u1",
      userName: "Super Admin",
      mobile: "09120000000",
      role: "سوپر ادمین",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 120 / Windows 11",
      location: "تهران، ایران",
      status: "success",
      createdAt: "۱۴۰۴/۰۸/۰۸ ۰۸:۳۰",
    },
    {
      id: "lg-2",
      userId: "u4",
      userName: "حسین موسوی",
      mobile: "09903334455",
      role: "پشتیبانی",
      ipAddress: "192.168.1.50",
      userAgent: "Firefox 121 / macOS",
      location: "اصفهان، ایران",
      status: "success",
      createdAt: "۱۴۰۴/۰۸/۰۸ ۰۹:۱۵",
    },
    {
      id: "lg-3",
      userId: "unknown",
      userName: "—",
      mobile: "09129999999",
      role: "—",
      ipAddress: "85.185.100.50",
      userAgent: "Chrome 119 / Android",
      location: "نامشخص",
      status: "failed",
      failedReason: "رمز عبور اشتباه",
      createdAt: "۱۴۰۴/۰۸/۰۸ ۱۰:۴۰",
    },
    {
      id: "lg-4",
      userId: "u5",
      userName: "زهرا احمدی",
      mobile: "09127778899",
      role: "آژانس تور",
      ipAddress: "192.168.1.100",
      userAgent: "Safari 17 / iOS 17",
      location: "مشهد، ایران",
      status: "success",
      createdAt: "۱۴۰۴/۰۸/۰۷ ۱۸:۲۰",
    },
    {
      id: "lg-5",
      userId: "unknown",
      userName: "—",
      mobile: "09120000000",
      role: "—",
      ipAddress: "45.33.22.11",
      userAgent: "Unknown",
      location: "خارج از ایران",
      status: "failed",
      failedReason: "حساب کاربری مسدود",
      createdAt: "۱۴۰۴/۰۸/۰۷ ۱۶:۰۰",
    },
    {
      id: "lg-6",
      userId: "u1",
      userName: "Super Admin",
      mobile: "09120000000",
      role: "سوپر ادمین",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 120 / Windows 11",
      location: "تهران، ایران",
      status: "success",
      createdAt: "۱۴۰۴/۰۸/۰۷ ۰۸:۱۵",
    },
  ]
}

/* ═══ خواندن و نوشتن ═══ */
function readOps(): OperationLog[] {
  if (typeof window === "undefined") return seedOperationLogs()
  try {
    const raw = localStorage.getItem(OPS_KEY)
    if (!raw) {
      localStorage.setItem(OPS_KEY, JSON.stringify(seedOperationLogs()))
      return seedOperationLogs()
    }
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : seedOperationLogs()
  } catch {
    return seedOperationLogs()
  }
}

function writeOps(list: OperationLog[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(OPS_KEY, JSON.stringify(list))
}

function readLogins(): AdminLoginLog[] {
  if (typeof window === "undefined") return seedLoginLogs()
  try {
    const raw = localStorage.getItem(LOGIN_KEY)
    if (!raw) {
      localStorage.setItem(LOGIN_KEY, JSON.stringify(seedLoginLogs()))
      return seedLoginLogs()
    }
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : seedLoginLogs()
  } catch {
    return seedLoginLogs()
  }
}

function writeLogins(list: AdminLoginLog[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOGIN_KEY, JSON.stringify(list))
}

/* ═══ API ═══ */
export const listOperationLogs = () => readOps()
export const listLoginLogs = () => readLogins()

/** ثبت لاگ عملیات (برای استفاده در صفحات CRUD) */
export function logOperation(data: Omit<OperationLog, "id" | "createdAt">): void {
  const record: OperationLog = {
    ...data,
    id: `op-${Date.now()}`,
    createdAt: new Date().toLocaleString("fa-IR"),
  }
  const list = readOps()
  list.unshift(record)
  // محدود کردن به ۱۰۰۰ لاگ اخیر
  writeOps(list.slice(0, 1000))
}

/** ثبت لاگ ورود ادمین */
export function logAdminLogin(data: Omit<AdminLoginLog, "id" | "createdAt">): void {
  const record: AdminLoginLog = {
    ...data,
    id: `lg-${Date.now()}`,
    createdAt: new Date().toLocaleString("fa-IR"),
  }
  const list = readLogins()
  list.unshift(record)
  writeLogins(list.slice(0, 500))
}

/** آمار سریع برای داشبورد */
export function getLogStats() {
  const ops = readOps()
  const logins = readLogins()
  const today = new Date().toLocaleDateString("fa-IR")

  return {
    totalOperations: ops.length,
    totalLogins: logins.length,
    failedLogins: logins.filter((l) => l.status === "failed").length,
    todayOperations: ops.filter((o) => o.createdAt.startsWith(today)).length,
    criticalOps: ops.filter((o) => o.action === "delete").length,
  }
}

export function faNum(n: number | string | null | undefined): string {
  const num = typeof n === "number" ? n : Number(n) || 0
  return Number.isFinite(num) ? num.toLocaleString("fa-IR") : "۰"
}
