/* ═══════════════════════════════════════════════════════════════
   مدل داده فرم تور — مطابق سند مرجع (بخش ۱۱)
═══════════════════════════════════════════════════════════════ */

export interface PricePair {
  rial: number
  foreign: number
}

export interface TourDatePrices {
  double: PricePair        // دبل (بزرگسال)
  single: PricePair        //_single
  childWithBed: PricePair  // کودک با تخت
  childNoBed: PricePair    // کودک بدون تخت
  infant: PricePair        // نوزاد
}

export type ForeignCurrency = "USD" | "EUR" | "AED" | "TRY"

export interface TourDate {
  id?: string
  startDate: string
  endDate: string
  totalCapacity: number
  status: "draft" | "published" | "cancelled"
  foreignEnabled: boolean
  foreignCurrency: ForeignCurrency
  prices: TourDatePrices
}

export const foreignCurrencyOptions: { value: ForeignCurrency; label: string; symbol: string }[] = [
  { value: "USD", label: "دلار آمریکا", symbol: "$" },
  { value: "EUR", label: "یورو", symbol: "€" },
  { value: "AED", label: "درهم امارات", symbol: "AED" },
  { value: "TRY", label: "لیر ترکیه", symbol: "₺" },
]

export const priceKeys: { key: keyof TourDatePrices; label: string; hint: string }[] = [
  { key: "double", label: "دبل (بزرگسال)", hint: "هر نفر" },
  { key: "single", label: "سینگل", hint: "اتاق یک‌نفره" },
  { key: "childWithBed", label: "کودک با تخت", hint: "۲ تا ۱۲ سال" },
  { key: "childNoBed", label: "کودک بدون تخت", hint: "۲ تا ۱۲ سال" },
  { key: "infant", label: "نوزاد", hint: "زیر ۲ سال" },
]

export function emptyPrices(): TourDatePrices {
  return {
    double: { rial: 0, foreign: 0 },
    single: { rial: 0, foreign: 0 },
    childWithBed: { rial: 0, foreign: 0 },
    childNoBed: { rial: 0, foreign: 0 },
    infant: { rial: 0, foreign: 0 },
  }
}

export function emptyDate(): TourDate {
  return {
    startDate: "",
    endDate: "",
    totalCapacity: 30,
    status: "draft",
    foreignEnabled: false,
    foreignCurrency: "USD",
    prices: emptyPrices(),
  }
}

/* ─── برنامه سفر ─── */
export interface ItineraryDay {
  id: string
  day: number
  title: string
  description: string
  city?: string
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean }
}

/* ─── هتل‌ها: پشتیبانی ۱ تا N هتل بر اساس مقصد ─── */
export interface TourHotelRelation {
  id: string
  hotelName: string
  nights: number
  roomType: string
  priority: number
}

export const roomTypes = [
  { value: "double", label: "دبل" },
  { value: "twin", label: "توئین" },
  { value: "single", label: "سینگل" },
  { value: "triple", label: "تریپل" },
  { value: "suite", label: "سوئیت" },
]

export function emptyHotel(priority: number): TourHotelRelation {
  return {
    id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    hotelName: "",
    nights: 1,
    roomType: "double",
    priority,
  }
}

/* ═══════════════════════════════════════════════════════════════
   خدمات تور — جامع و دسته‌بندی‌شده (tour_services)
═══════════════════════════════════════════════════════════════ */
export interface TourService {
  id: string
  name: string
  included: boolean
  category: string
}

export const serviceCategories = [
  { id: "transport", title: "حمل‌ونقل" },
  { id: "hotel", title: "اقامت" },
  { id: "meals", title: "وعده‌های غذایی" },
  { id: "guide", title: "راهنما و پشتیبانی" },
  { id: "insurance", title: "بیمه و مدارک" },
  { id: "activities", title: "گشت و فعالیت‌ها" },
  { id: "other", title: "سایر خدمات" },
]

export const defaultServices: TourService[] = [
  // حمل‌ونقل
  { id: "t1", name: "بلیط رفت‌وبرگشت هواپیما", included: false, category: "transport" },
  { id: "t2", name: "بلیط پرواز داخلی", included: false, category: "transport" },
  { id: "t3", name: "بلیط قطار", included: false, category: "transport" },
  { id: "t4", name: "بلیط اتوبوس VIP", included: false, category: "transport" },
  { id: "t5", name: "ترانسفر فرودگاهی", included: true, category: "transport" },
  { id: "t6", name: "ترانسفر بین‌شهری", included: false, category: "transport" },
  { id: "t7", name: "وسیله نقلیه اختصاصی در طول تور", included: false, category: "transport" },
  // اقامت
  { id: "h1", name: "اقامت در هتل", included: true, category: "hotel" },
  { id: "h2", name: "اقامت در سوئیت / ویلا", included: false, category: "hotel" },
  { id: "h3", name: "چک‌این زودهنگام / چک‌اوت دیرهنگام", included: false, category: "hotel" },
  // وعده‌ها
  { id: "m1", name: "صبحانه", included: true, category: "meals" },
  { id: "m2", name: "ناهار", included: false, category: "meals" },
  { id: "m3", name: "شام", included: false, category: "meals" },
  { id: "m4", name: "شام خوش‌آمدگویی", included: false, category: "meals" },
  // راهنما
  { id: "g1", name: "راهنمای تور فارسی‌زبان", included: true, category: "guide" },
  { id: "g2", name: "راهنمای محلی", included: false, category: "guide" },
  { id: "g3", name: "پشتیبانی ۲۴ ساعته", included: false, category: "guide" },
  { id: "g4", name: "مشاور آنلاین", included: false, category: "guide" },
  // بیمه و مدارک
  { id: "i1", name: "بیمه مسافرتی", included: true, category: "insurance" },
  { id: "i2", name: "خدمات ویزا", included: false, category: "insurance" },
  { id: "i3", name: "مشاوره پاسپورت", included: false, category: "insurance" },
  { id: "i4", name: "بیمه مدارک", included: false, category: "insurance" },
  // گشت و فعالیت‌ها
  { id: "a1", name: "گشت کامل شهری", included: false, category: "activities" },
  { id: "a2", name: "بلیط ورودی موزه‌ها و جاذبه‌ها", included: false, category: "activities" },
  { id: "a3", name: "فعالیت‌های تفریحی", included: false, category: "activities" },
  { id: "a4", name: "گشت خرید", included: false, category: "activities" },
]

/* ─── گزینه‌های فرم ─── */
export const destinations = [
  "استانبول، ترکیه",
  "دبی، امارات",
  "شیراز، ایران",
  "مشهد، ایران",
  "کیش، ایران",
  "تفلیس، گرجستان",
  "آنتالیا، ترکیه",
  "باتومی، گرجستان",
  "ایروان، ارمنستان",
  "بانکوک، تایلند",
]

export const tourCategories = [
  "تفریحی",
  "زیارتی",
  "ماجراجویی",
  "ماه عسل",
  "خانوادگی",
  "اقتصادی",
  "لوکس",
]

export const tourTypes = ["زمینی", "هوایی", "ترکیبی", "کشتی کروز"]

/* ─── وضعیت کل فرم ─── */
export interface TourFormState {
  title: string
  slug: string
  destination: string
  shortDescription: string
  fullDescription: string
  status: "draft" | "ready" | "published"
  category: string
  tourType: string
  tags: string[]
  dates: TourDate[]
  basePrice: number
  discountPercent: number
  minPassengers: number
  maxPassengers: number
  itinerary: ItineraryDay[]
  hotels: TourHotelRelation[]
  services: TourService[]
}

export const defaultTourState: TourFormState = {
  title: "",
  slug: "",
  destination: "",
  shortDescription: "",
  fullDescription: "",
  status: "draft",
  category: "",
  tourType: "",
  tags: [],
  dates: [],
  basePrice: 0,
  discountPercent: 0,
  minPassengers: 1,
  maxPassengers: 50,
  itinerary: [],
  hotels: [],
  services: defaultServices.map((s) => ({ ...s })),
}
