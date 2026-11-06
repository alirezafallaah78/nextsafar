import { addDays } from "date-fns"
import {
  defaultTourState,
  emptyDate,
  type TourFormState,
  type TourDate,
  type TourService,
} from "./tour-form"
import { formatJalaliDate, todayStart } from "./jalali"

export interface TourRecord {
  id: string
  booked: number
  createdAt: string
  updatedAt: string
  form: TourFormState
}

export interface TourViewModel {
  id: string
  title: string
  slug: string
  destination: string
  status: string
  startDate?: string
  endDate?: string
  capacity: number
  booked: number
  adultPrice: number
  createdAt: string
}

const STORAGE_KEY = "nextsafar_admin_tours_v3"
const LEGACY_KEYS = ["nextsafar_admin_tours_v2", "nextsafar_admin_tours_v1"]

export const tourStatusMap: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" }
> = {
  published: { label: "منتشر شده", variant: "success" },
  selling: { label: "در حال فروش", variant: "info" },
  draft: { label: "پیش‌نویس", variant: "secondary" },
  ready: { label: "آماده", variant: "info" },
  sold_out: { label: "تکمیل ظرفیت", variant: "warning" },
  expired: { label: "منقضی", variant: "destructive" },
  cancelled: { label: "لغو شده", variant: "destructive" },
  inactive: { label: "غیرفعال", variant: "secondary" },
}


/* ═══ نرمال‌سازی داده‌های قدیمی → ساختار جدید ═══ */
export function normalizeDate(d: any): TourDate {
  const base = emptyDate()
  if (!d) return base
  if (d.prices) return { ...base, ...d }
  return {
    ...base,
    startDate: d.startDate || "",
    endDate: d.endDate || "",
    totalCapacity: d.totalCapacity ?? 30,
    status: d.status || "draft",
    prices: {
      double: { rial: d.adultPrice ?? 0, foreign: 0 },
      single: { rial: d.singlePrice ?? 0, foreign: 0 },
      childWithBed: { rial: d.childPrice ?? 0, foreign: 0 },
      childNoBed: { rial: d.childNoBedPrice ?? 0, foreign: 0 },
      infant: { rial: d.infantPrice ?? 0, foreign: 0 },
    },
  }
}

export function normalizeServices(list: any): TourService[] {
  if (!Array.isArray(list) || list.length === 0) return defaultTourState.services.map((s) => ({ ...s }))
  return list.map((s) => ({
    id: s.id || `svc-${Math.random().toString(36).slice(2, 8)}`,
    name: s.name || "",
    included: !!s.included,
    category: s.category || "other",
  }))
}

export function normalizeForm(form: any): TourFormState {
  return {
    ...defaultTourState,
    ...form,
    dates: Array.isArray(form?.dates) ? form.dates.map(normalizeDate) : [],
    services: normalizeServices(form?.services),
    hotels: Array.isArray(form?.hotels)
      ? form.hotels.map((h: any, i: number) => ({
          id: h.id || `h-${i}-${Math.random().toString(36).slice(2, 6)}`,
          hotelName: h.hotelName || h.name || "",
          nights: h.nights ?? 1,
          roomType: h.roomType || "double",
          priority: h.priority ?? i + 1,
        }))
      : [],
  }
}

/* ═══ تاریخ پویا: نسبت به امروز ═══ */
function j(offset: number): string {
  return formatJalaliDate(addDays(todayStart(), offset))
}

function makeDate(
  startOffset: number,
  endOffset: number,
  capacity: number,
  double: number,
  single: number,
  childWithBed: number,
  childNoBed: number,
  infant: number
): TourDate {
  return {
    startDate: j(startOffset),
    endDate: j(endOffset),
    totalCapacity: capacity,
    status: "published",
    foreignEnabled: false,
    foreignCurrency: "USD",
    prices: {
      double: { rial: double, foreign: 0 },
      single: { rial: single, foreign: 0 },
      childWithBed: { rial: childWithBed, foreign: 0 },
      childNoBed: { rial: childNoBed, foreign: 0 },
      infant: { rial: infant, foreign: 0 },
    },
  }
}

function rec(
  id: string,
  booked: number,
  over: Partial<TourFormState>
): TourRecord {
  const now = new Date().toISOString()
  return { id, booked, createdAt: now, updatedAt: now, form: { ...defaultTourState, ...over } }
}

function seed(): TourRecord[] {
  return [
    rec("t1", 38, {
      title: "تور استانبول ۵ روزه",
      slug: "istanbul-5d",
      destination: "استانبول، ترکیه",
      status: "selling",
      category: "تفریحی",
      tourType: "هوایی",
      shortDescription: "گشت کامل استانبول با هتل ۴ ستاره",
      basePrice: 18500000,
      dates: [makeDate(2, 6, 45, 18500000, 24000000, 14000000, 12000000, 5000000)],
    }),
    rec("t2", 22, {
      title: "تور شیراز و پرسپولیس",
      slug: "shiraz-3d",
      destination: "شیراز، ایران",
      status: "published",
      category: "خانوادگی",
      tourType: "زمینی",
      shortDescription: "سفر فرهنگی به تخت جمشید و باغ ارم",
      basePrice: 7200000,
      dates: [makeDate(4, 6, 30, 7200000, 6760000, 5200000, 4160000, 2000000)],
    }),
    rec("t3", 40, {
      title: "تور کیش لوکس",
      slug: "kish-lux",
      destination: "کیش، ایران",
      status: "sold_out",
      category: "لوکس",
      tourType: "هوایی",
      shortDescription: "اقامت در هتل ۵ ستاره با صبحانه",
      basePrice: 24800000,
      dates: [makeDate(6, 9, 40, 24800000, 23400000, 18000000, 14400000, 6000000)],
    }),
    rec("t4", 31, {
      title: "تور مشهد زیارتی",
      slug: "mashhad-4d",
      destination: "مشهد، ایران",
      status: "selling",
      category: "زیارتی",
      tourType: "زمینی",
      shortDescription: "زیارت حرم با اقامت نزدیک حرم",
      basePrice: 12400000,
      dates: [makeDate(3, 7, 50, 12400000, 11700000, 9000000, 7200000, 3000000)],
    }),
    rec("t5", 0, {
      title: "تور شمال ۳ روزه",
      slug: "north-3d",
      destination: "مازندران، ایران",
      status: "draft",
      category: "تفریحی",
      tourType: "زمینی",
      shortDescription: "جنگل‌نوردی و ساحل",
      basePrice: 5900000,
      dates: [makeDate(20, 22, 35, 5900000, 5460000, 4200000, 3360000, 1500000)],
    }),
  ]
}

function write(records: TourRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

/* ═══ مهاجرت از نسخه قدیمی: تورهای کاربر حفظ می‌شوند ═══ */
function migrateFromLegacy(): TourRecord[] | null {
  if (typeof window === "undefined") return null
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const old: TourRecord[] = JSON.parse(raw)
      const seedIds = new Set(["t1", "t2", "t3", "t4", "t5"])
      const userTours = old
        .filter((r) => !seedIds.has(r.id))
        .map((r) => ({ ...r, form: normalizeForm(r.form) }))
      return [...seed(), ...userTours]
    } catch {
      continue
    }
  }
  return null
}

export function listTours(): TourRecord[] {
  if (typeof window === "undefined") return seed()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const migrated = migrateFromLegacy()
      const result = migrated || seed()
      write(result)
      return result
    }
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : seed()
    return list.map((r: TourRecord) => ({ ...r, form: normalizeForm(r.form) }))
  } catch {
    return seed()
  }
}

export function getTour(id: string): TourRecord | null {
  return listTours().find((r) => r.id === id) || null
}

export function createTour(form: TourFormState): TourRecord {
  const now = new Date().toISOString()
  const record: TourRecord = {
    id: `t${Date.now()}`,
    booked: 0,
    createdAt: now,
    updatedAt: now,
    form,
  }
  write([record, ...listTours()])
  return record
}

export function updateTour(id: string, form: TourFormState): void {
  const records = listTours().map((r) =>
    r.id === id ? { ...r, form, updatedAt: new Date().toISOString() } : r
  )
  write(records)
}

export function deleteTour(id: string): void {
  write(listTours().filter((r) => r.id !== id))
}

export function toViewModel(r: TourRecord): TourViewModel {
  const f = r.form
  const first = f.dates?.[0]
  return {
    id: r.id,
    title: f.title || "بدون عنوان",
    slug: f.slug || "-",
    destination: f.destination || "-",
    status: f.status,
    startDate: first?.startDate,
    endDate: first?.endDate,
    capacity: first?.totalCapacity ?? f.maxPassengers ?? 0,
    booked: r.booked ?? 0,
    adultPrice: first?.prices?.double?.rial ?? (first as any)?.adultPrice ?? f.basePrice ?? 0,
    createdAt: r.createdAt,
  }
}

export function formatDateSafe(value?: string): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d)
}
