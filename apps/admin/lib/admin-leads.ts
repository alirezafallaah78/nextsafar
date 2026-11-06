export type LeadStatus = "new" | "contacted" | "converted" | "closed"
export type LeadType = "tour" | "hotel" | "visa" | "general"

export interface LeadNote {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface LeadRecord {
  id: string
  name: string
  mobile: string
  email?: string
  type: LeadType
  subject: string
  message: string
  source: string
  status: LeadStatus
  notes: LeadNote[]
  createdAt: string
}

const KEY = "nextsafar_admin_leads_v1"

export const leadStatusMap: Record<LeadStatus, { label: string; variant: "info" | "outline" | "success" | "secondary" }> = {
  new: { label: "جدید", variant: "info" },
  contacted: { label: "تماس گرفته شد", variant: "outline" },
  converted: { label: "تبدیل به سفارش", variant: "success" },
  closed: { label: "بسته شده", variant: "secondary" },
}

export const leadTypeMap: Record<LeadType, string> = {
  tour: "درخواست تور",
  hotel: "رزرو هتل",
  visa: "مشاوره ویزا",
  general: "عمومی",
}

function seed(): LeadRecord[] {
  return [
    { id: "LEAD-101", name: "محمد حسینی", mobile: "09121234567", type: "tour", subject: "تور استانبول ۵ روزه", message: "سلام، برای دو نفر بزرگسال و یک کودک قیمت تمام‌شده چقدر می‌شود؟", source: "صفحه تور", status: "new", notes: [], createdAt: "۱۴۴/۰۸/۰۸ ۰۹:۱۵" },
    { id: "LEAD-102", name: "سارا محمدی", mobile: "09351112233", type: "visa", subject: "ویزای شینگن", message: "برای ویزای شینگن مشاوره می‌خواهم، سابقه ریجکتی دارم.", source: "فرم تماس", status: "contacted", notes: [ { id: "n1", text: "تماس اول انجام شد، مدارک ارسال شد", author: "پشتیبانی", createdAt: "۱۴۴/۰۸/۰۷ ۱۴:۰۰" } ], createdAt: "۱۴۰۴/۰۸/۰۷ ۱۱:۴۰" },
    { id: "LEAD-103", name: "امیر تهرانی", mobile: "09903334455", type: "hotel", subject: "هتل ترنج کیش", message: "اتاق دبل با ویو دریا برای ۳ شب می‌خواهم.", source: "صفحه هتل", status: "converted", notes: [ { id: "n2", text: "تبدیل به سفارش ORD-1020 شد", author: "فروش", createdAt: "۱۴۴/۰۸/۰۱ ۱۱:۱۰" } ], createdAt: "۱۴۴/۰۸/۰۱ ۱۰:۰۰" },
    { id: "LEAD-104", name: "نگار محمدی", mobile: "09120001122", type: "tour", subject: "تور مشهد زیارتی", message: "تاریخ حرکت بعدی چه زمانی است؟", source: "واتساپ", status: "closed", notes: [], createdAt: "۱۴۴/۰۷/۲۹ ۱۶:۲۰" },
    { id: "LEAD-105", name: "رضا کاظمی", mobile: "09364445566", type: "tour", subject: "تور کیش لوکس", message: "امکان پرداخت اقساطی وجود دارد؟", source: "صفحه تور", status: "new", notes: [], createdAt: "۱۴۰۴/۰۸/۰۸ ۱۲:۰۵" },
    { id: "LEAD-106", name: "الهام صادقی", mobile: "09127778899", type: "general", subject: "همکاری سازمانی", message: "برای پرسنل شرکت تور گروهی می‌خواهیم، لطفاً پیش‌فاکتور بفرستید.", source: "فرم تماس", status: "contacted", notes: [], createdAt: "۱۴۴/۰۸/۰۶ ۰۸:۳۰" },
  ]
}

function read(): LeadRecord[] {
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

function write(list: LeadRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export const listLeads = () => read()
export const getLead = (id: string) => read().find((l) => l.id === id) || null

export function updateLeadStatus(id: string, status: LeadStatus): void {
  write(read().map((l) => (l.id === id ? { ...l, status } : l)))
}

export function addLeadNote(id: string, text: string): void {
  const note: LeadNote = {
    id: `n-${Date.now()}`,
    text,
    author: "مدیر",
    createdAt: new Date().toLocaleString("fa-IR"),
  }
  write(read().map((l) => (l.id === id ? { ...l, notes: [...l.notes, note] } : l)))
}
