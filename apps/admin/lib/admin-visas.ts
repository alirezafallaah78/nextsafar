/* ═══ ویزا از وردپرس + پرونده‌های داخلی ═══ */

export interface VisaPrice {
  type: string
  duration: string
  person: string
  amount: number
  currency: string
}

export interface VisaDocument {
  name: string
  description?: string
  required: boolean
}

export interface VisaRecord {
  id: string
  wp_post_id?: number
  slug: string
  country: string
  title: string
  banner?: string
  shortDescription?: string
  fullDescription?: string
  issueTime?: string
  validityTime?: string
  prices: VisaPrice[]
  documents: VisaDocument[]
  minPrice?: number
  source: "wordpress" | "manual"
  createdAt: string
}

export type VisaCaseStatus =
  | "initial"
  | "documents_incomplete"
  | "documents_complete"
  | "under_review"
  | "appointment_needed"
  | "appointment_done"
  | "submitted"
  | "in_process"
  | "biometrics_done"
  | "approved"
  | "rejected"
  | "needs_correction"
  | "completed"
  | "cancelled"

export interface VisaCaseDocument {
  id: string
  name: string
  fileName: string
  uploadedAt: string
  verified: boolean
}

export interface VisaCaseTimeline {
  id: string
  status: VisaCaseStatus
  note?: string
  author: string
  createdAt: string
}

export interface VisaCaseRecord {
  id: string
  visaId: string
  visaTitle: string
  customer: { name: string; mobile: string; email?: string }
  passengers: number
  totalAmount: number
  status: VisaCaseStatus
  documents: VisaCaseDocument[]
  timeline: VisaCaseTimeline[]
  assignedAgent?: string
  createdAt: string
}

const CASES_KEY = "nextsafar_admin_visa_cases_v1"

export const visaCaseStatusMap: Record<VisaCaseStatus, { label: string; variant: "outline" | "info" | "secondary" | "success" | "destructive" }> = {
  initial: { label: "شروع", variant: "outline" },
  documents_incomplete: { label: "نقص مدارک", variant: "destructive" },
  documents_complete: { label: "مدارک کامل", variant: "info" },
  under_review: { label: "در حال بررسی", variant: "secondary" },
  appointment_needed: { label: "نیاز به وقت سفارت", variant: "outline" },
  appointment_done: { label: "وقت سفارت انجام شد", variant: "info" },
  submitted: { label: "ارسال به سفارت", variant: "info" },
  in_process: { label: "در حال پردازش", variant: "secondary" },
  biometrics_done: { label: "بیومتریک انجام شد", variant: "info" },
  approved: { label: "تأیید شده", variant: "success" },
  rejected: { label: "رد شده", variant: "destructive" },
  needs_correction: { label: "نیاز به اصلاح", variant: "outline" },
  completed: { label: "تکمیل شده", variant: "success" },
  cancelled: { label: "لغو شده", variant: "destructive" },
}

/* ─── ویزاهای نمونه (مطابق ساختار وردپرس) ─── */
export const sampleVisas: VisaRecord[] = [
  {
    id: "visa-1",
    wp_post_id: 101,
    slug: "schengen-tourist",
    country: "حوزه شنگن",
    title: "ویزای توریستی شنگن",
    banner: "/visa-banners/schengen.jpg",
    shortDescription: "ویزای توریستی یکبار ورود برای ۹۰ روز اقامت",
    issueTime: "۱۵ تا ۲۰ روز کاری",
    validityTime: "۶ ماه",
    prices: [
      { type: "توریستی یکبار ورود", duration: "۳ ماهه", person: "بزرگسال", amount: 85000000, currency: "ریال" },
      { type: "توریستی یکبار ورود", duration: "۳ ماهه", person: "کودک", amount: 45000000, currency: "ریال" },
      { type: "مولتی", duration: "۶ ماهه", person: "بزرگسال", amount: 120000000, currency: "ریال" },
    ],
    documents: [
      { name: "پاسپورت با حداقل ۶ ماه اعتبار", required: true },
      { name: "دو قطعه عکس ۳.۵×۴.۵", required: true },
      { name: "نامه تمکن مالی", required: true },
      { name: "بیمه مسافرتی", required: true },
      { name: "رزرو هتل", required: false },
      { name: "بلیط رفت‌وبرگشت", required: false },
    ],
    minPrice: 45000000,
    source: "wordpress",
    createdAt: "۱۴۰۴/۰۷/۰۱",
  },
  {
    id: "visa-2",
    wp_post_id: 102,
    slug: "turkey-visa",
    country: "ترکیه",
    title: "ویزای الکترونیکی ترکیه",
    banner: "/visa-banners/turkey.jpg",
    shortDescription: "ویزای الکترونیکی سریع بدون نیاز به سفارت",
    issueTime: "۲ تا ۳ روز کاری",
    validityTime: "۶ ماه",
    prices: [
      { type: "الکترونیک", duration: "۱ ماهه", person: "بزرگسال", amount: 3500000, currency: "ریال" },
      { type: "الکترونیک", duration: "۱ ماهه", person: "کودک", amount: 2500000, currency: "ریال" },
    ],
    documents: [
      { name: "پاسپورت با حداقل ۶ ماه اعتبار", required: true },
      { name: "عکس پاسپورتی", required: true },
    ],
    minPrice: 2500000,
    source: "wordpress",
    createdAt: "۱۴۴/۰۷/۰۵",
  },
  {
    id: "visa-3",
    wp_post_id: 103,
    slug: "dubai-visa",
    country: "امارات",
    title: "ویزای توریستی دبی",
    banner: "/visa-banners/dubai.jpg",
    shortDescription: "ویزای توریستی ۳۰ روزه با امکان تمدید",
    issueTime: "۳ تا ۵ روز کاری",
    validityTime: "۲ ماه",
    prices: [
      { type: "توریستی", duration: "۱ ماهه", person: "بزرگسال", amount: 8500000, currency: "ریال" },
      { type: "توریستی", duration: "۱ ماهه", person: "کودک", amount: 5500000, currency: "ریال" },
      { type: "توریستی", duration: "۲ ماهه", person: "بزرگسال", amount: 12500000, currency: "ریال" },
    ],
    documents: [
      { name: "پاسپورت با حداقل ۶ ماه اعتبار", required: true },
      { name: "دو قطعه عکس", required: true },
      { name: "فرم درخواست تکمیل‌شده", required: true },
    ],
    minPrice: 5500000,
    source: "wordpress",
    createdAt: "۱۴۰۴/۰۷/۱۰",
  },
]

function seedCases(): VisaCaseRecord[] {
  return [
    {
      id: "VC-101",
      visaId: "visa-1",
      visaTitle: "ویزای توریستی شنگن",
      customer: { name: "علی رضایی", mobile: "09121234567", email: "ali@example.com" },
      passengers: 2,
      totalAmount: 170000000,
      status: "documents_incomplete",
      documents: [
        { id: "d1", name: "پاسپورت", fileName: "passport.pdf", uploadedAt: "۱۴۰۴/۰۸/۰۵", verified: true },
        { id: "d2", name: "عکس", fileName: "photo.jpg", uploadedAt: "۱۴۴/۰۸/۰۵", verified: false },
      ],
      timeline: [
        { id: "t1", status: "initial", note: "درخواست ثبت شد", author: "سیستم", createdAt: "۱۴۰۴/۰۸/۰۵" },
        { id: "t2", status: "documents_incomplete", note: "عکس ناقص است", author: "کارشناس ویزا", createdAt: "۱۴۰۴/۰۸/۰۶" },
      ],
      assignedAgent: "حسین موسوی",
      createdAt: "۱۴۰۴/۰۸/۰۵",
    },
    {
      id: "VC-102",
      visaId: "visa-2",
      visaTitle: "ویزای الکترونیکی ترکیه",
      customer: { name: "مریم کریمی", mobile: "09351112233" },
      passengers: 1,
      totalAmount: 3500000,
      status: "approved",
      documents: [
        { id: "d3", name: "پاسپورت", fileName: "passport.pdf", uploadedAt: "۱۴۰۴/۰۸/۰۱", verified: true },
        { id: "d4", name: "عکس", fileName: "photo.jpg", uploadedAt: "۱۴۴/۰۸/۰۱", verified: true },
      ],
      timeline: [
        { id: "t3", status: "initial", note: "درخواست ثبت شد", author: "سیستم", createdAt: "۱۴۰۴/۰۸/۰۱" },
        { id: "t4", status: "submitted", note: "ارسال شد", author: "کارشناس ویزا", createdAt: "۱۴۴/۰۸/۰۲" },
        { id: "t5", status: "approved", note: "ویزا تأیید شد", author: "سیستم", createdAt: "۱۴۴/۰۸/۰۴" },
      ],
      createdAt: "۱۴۰۴/۰۸/۰۱",
    },
  ]
}

function readCases(): VisaCaseRecord[] {
  if (typeof window === "undefined") return seedCases()
  try {
    const raw = localStorage.getItem(CASES_KEY)
    if (!raw) {
      localStorage.setItem(CASES_KEY, JSON.stringify(seedCases()))
      return seedCases()
    }
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : seedCases()
  } catch {
    return seedCases()
  }
}

function writeCases(list: VisaCaseRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(CASES_KEY, JSON.stringify(list))
}

export const listVisas = () => sampleVisas
export const getVisa = (id: string) => sampleVisas.find((v) => v.id === id) || null

export const listVisaCases = () => readCases()
export const getVisaCase = (id: string) => readCases().find((c) => c.id === id) || null

export function updateVisaCaseStatus(id: string, status: VisaCaseStatus, note?: string): void {
  const cases = readCases()
  const updated = cases.map((c) => {
    if (c.id !== id) return c
    const timeline: VisaCaseTimeline = {
      id: `t-${Date.now()}`,
      status,
      note: note || visaCaseStatusMap[status].label,
      author: "مدیر",
      createdAt: new Date().toLocaleString("fa-IR"),
    }
    return { ...c, status, timeline: [...c.timeline, timeline] }
  })
  writeCases(updated)
}

export function assignAgent(id: string, agent: string): void {
  writeCases(readCases().map((c) => (c.id === id ? { ...c, assignedAgent: agent } : c)))
}
