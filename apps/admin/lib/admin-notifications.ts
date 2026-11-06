/* ═══ ماژول اطلاع‌رسانی‌ها — SMS/Email/Internal ═══ */

export type NotificationChannel = "sms" | "email" | "internal" | "whatsapp"
export type NotificationEvent =
  | "order_created"
  | "payment_success"
  | "payment_failed"
  | "refund_requested"
  | "refund_approved"
  | "lead_received"
  | "visa_status_changed"
  | "visa_document_missing"
  | "trip_reminder"
  | "admin_login"
export type NotificationStatus = "sent" | "failed" | "pending" | "queued"

export interface NotificationRecord {
  id: string
  channel: NotificationChannel
  event: NotificationEvent
  recipient: { name: string; contact: string }
  title: string
  body: string
  status: NotificationStatus
  read: boolean
  sentAt: string
  relatedId?: string
  relatedType?: "order" | "lead" | "visa"
}

export interface NotificationTemplate {
  id: string
  event: NotificationEvent
  channel: NotificationChannel
  subject: string
  body: string
  active: boolean
}

const KEY = "nextsafar_admin_notifications_v1"
const TEMPLATES_KEY = "nextsafar_admin_notification_templates_v1"

export const channelMap: Record<NotificationChannel, { label: string; icon: string }> = {
  sms: { label: "پیامک", icon: "📱" },
  email: { label: "ایمیل", icon: "✉️" },
  internal: { label: "داخلی", icon: "🔔" },
  whatsapp: { label: "واتساپ", icon: "💬" },
}

export const eventMap: Record<NotificationEvent, string> = {
  order_created: "ثبت سفارش",
  payment_success: "پرداخت موفق",
  payment_failed: "پرداخت ناموفق",
  refund_requested: "درخواست استرداد",
  refund_approved: "تأیید استرداد",
  lead_received: "درخواست جدید",
  visa_status_changed: "تغییر وضعیت ویزا",
  visa_document_missing: "نقص مدرک ویزا",
  trip_reminder: "یادآوری سفر",
  admin_login: "ورود ادمین",
}

export const statusMap: Record<NotificationStatus, { label: string; variant: "success" | "destructive" | "outline" | "secondary" }> = {
  sent: { label: "ارسال شده", variant: "success" },
  failed: { label: "ناموفق", variant: "destructive" },
  pending: { label: "در انتظار", variant: "outline" },
  queued: { label: "در صف", variant: "secondary" },
}

function seed(): NotificationRecord[] {
  return [
    { id: "n1", channel: "sms", event: "payment_success", recipient: { name: "علی رضایی", contact: "09121234567" }, title: "پرداخت موفق", body: "پرداخت سفارش ORD-1024 با موفقیت انجام شد", status: "sent", read: false, sentAt: "۱۴۰۴/۰۸/۰۸ ۱۲:۳۰", relatedId: "ORD-1024", relatedType: "order" },
    { id: "n2", channel: "email", event: "order_created", recipient: { name: "مریم کریمی", contact: "maryam@example.com" }, title: "سفارش شما ثبت شد", body: "سفارش ORD-1023 با موفقیت ثبت شد. برای تکمیل فرآیند پرداخت را انجام دهید.", status: "sent", read: true, sentAt: "۱۴۰۴/۰۸/۰۸ ۱۰:۱۵", relatedId: "ORD-1023", relatedType: "order" },
    { id: "n3", channel: "internal", event: "lead_received", recipient: { name: "پنل ادمین", contact: "admin" }, title: "درخواست جدید تور", body: "محمد حسینی درخواست تور استانبول را ثبت کرد", status: "sent", read: false, sentAt: "۱۴۰۴/۰۸/۰۸ ۰۹:۱۵", relatedId: "LEAD-101", relatedType: "lead" },
    { id: "n4", channel: "sms", event: "visa_status_changed", recipient: { name: "سارا محمدی", contact: "09351112233" }, title: "تغییر وضعیت پرونده ویزا", body: "وضعیت پرونده ویزای شنگن شما به «در حال بررسی» تغییر کرد", status: "sent", read: false, sentAt: "۱۴۰۴/۰۸/۰۷ ۱۴:۲۰", relatedId: "VC-101", relatedType: "visa" },
    { id: "n5", channel: "email", event: "refund_approved", recipient: { name: "زهرا احمدی", contact: "zahra@example.com" }, title: "استرداد شما تأیید شد", body: "درخواست استرداد سفارش ORD-1021 تأیید و مبلغ به حساب شما برگشت داده شد", status: "sent", read: true, sentAt: "۱۴۰۴/۰۸/۰۶ ۱۶:۴۵", relatedId: "ORD-1021", relatedType: "order" },
    { id: "n6", channel: "sms", event: "payment_failed", recipient: { name: "امیر تهرانی", contact: "09364445566" }, title: "پرداخت ناموفق", body: "پرداخت سفارش شما ناموفق بود. لطفاً مجدداً تلاش کنید", status: "failed", read: false, sentAt: "۱۴۰۴/۰۸/۰۵ ۱۱:۰۰" },
    { id: "n7", channel: "whatsapp", event: "trip_reminder", recipient: { name: "نگار محمدی", contact: "+989120001122" }, title: "یادآوری سفر", body: "فردا تور استانبول شما آغاز می‌شود. مدارک را آماده داشته باشید", status: "pending", read: false, sentAt: "۱۴۰۴/۰۸/۰۹ ۱۸:۰۰" },
    { id: "n8", channel: "internal", event: "admin_login", recipient: { name: "سیستم", contact: "admin" }, title: "ورود ادمین", body: "Super Admin از IP 192.168.1.1 وارد شد", status: "sent", read: true, sentAt: "۱۴۴/۰۸/۰۸ ۰۸:۳۰" },
  ]
}

function seedTemplates(): NotificationTemplate[] {
  return [
    { id: "t1", event: "payment_success", channel: "sms", subject: "پرداخت موفق", body: "پرداخت {{order_id}} به مبلغ {{amount}} ریال با موفقیت انجام شد", active: true },
    { id: "t2", event: "payment_failed", channel: "sms", subject: "پرداخت ناموفق", body: "پرداخت سفارش {{order_id}} ناموفق بود", active: true },
    { id: "t3", event: "order_created", channel: "email", subject: "سفارش شما ثبت شد", body: "سلام {{customer_name}}، سفارش شما با کد {{order_id}} ثبت شد", active: true },
    { id: "t4", event: "visa_status_changed", channel: "sms", subject: "تغییر وضعیت ویزا", body: "وضعیت پرونده ویزای {{visa_type}} شما تغییر کرد", active: true },
    { id: "t5", event: "lead_received", channel: "internal", subject: "درخواست جدید", body: "درخواست جدید از {{customer_name}} دریافت شد", active: true },
    { id: "t6", event: "refund_approved", channel: "email", subject: "استرداد تأیید شد", body: "استرداد سفارش {{order_id}} تأیید شد", active: true },
    { id: "t7", event: "trip_reminder", channel: "whatsapp", subject: "یادآوری سفر", body: "فردا سفر {{tour_name}} شما آغاز می‌شود", active: false },
    { id: "t8", event: "admin_login", channel: "internal", subject: "ورود ادمین", body: "ورود {{admin_name}} از {{ip}}", active: true },
  ]
}

function read(): NotificationRecord[] {
  if (typeof window === "undefined") return seed()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed()))
      return seed()
    }
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : seed()
  } catch {
    return seed()
  }
}

function write(list: NotificationRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list))
}

function readTemplates(): NotificationTemplate[] {
  if (typeof window === "undefined") return seedTemplates()
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    if (!raw) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(seedTemplates()))
      return seedTemplates()
    }
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : seedTemplates()
  } catch {
    return seedTemplates()
  }
}

function writeTemplates(list: NotificationTemplate[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list))
}

export const listNotifications = () => read()
export const listTemplates = () => readTemplates()

export function markAsRead(id: string): void {
  write(read().map((n) => (n.id === id ? { ...n, read: true } : n)))
}

export function markAllAsRead(): void {
  write(read().map((n) => ({ ...n, read: true })))
}

export function toggleTemplate(id: string): void {
  writeTemplates(readTemplates().map((t) => (t.id === id ? { ...t, active: !t.active } : t)))
}

export function sendTestNotification(templateId: string): NotificationRecord {
  const tpl = readTemplates().find((t) => t.id === templateId)
  if (!tpl) throw new Error("Template not found")
  const test: NotificationRecord = {
    id: `n-test-${Date.now()}`,
    channel: tpl.channel,
    event: tpl.event,
    recipient: { name: "تست", contact: tpl.channel === "sms" ? "09120000000" : "test@example.com" },
    title: `[تست] ${tpl.subject}`,
    body: tpl.body,
    status: "sent",
    read: false,
    sentAt: new Date().toLocaleString("fa-IR"),
  }
  write([test, ...read()])
  return test
}
