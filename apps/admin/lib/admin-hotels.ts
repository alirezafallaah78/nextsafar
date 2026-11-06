export interface HotelPriceRange {
  min: number
  max: number
}

export interface HotelRecord {
  id: string
  name: string
  slug: string
  city: string
  country: string
  address: string
  stars: number
  status: "active" | "inactive" | "pending"
  source: "manual" | "wordpress"
  description: string
  amenities: string[]
  roomsCount: number
  priceRange: HotelPriceRange
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "nextsafar_admin_hotels_v1"

export const hotelStatusMap: Record<
  string,
  { label: string; variant: "success" | "secondary" | "outline" }
> = {
  active: { label: "فعال", variant: "success" },
  inactive: { label: "غیرفعال", variant: "secondary" },
  pending: { label: "در انتظار بررسی", variant: "outline" },
}

export const cities = [
  "تهران", "شیراز", "مشهد", "کیش", "قشم", "اصفهان",
  "استانبول", "آنتالیا", "دبی", "ابوظبی", "تفلیس", "باتومی", "ایروان", "بانکوک",
]

/* ─── امکانات هتل ─── */
export const hotelAmenities = [
  { id: "wifi", name: "وای‌فای رایگان" },
  { id: "pool", name: "استخر" },
  { id: "spa", name: "اسپا و سونا" },
  { id: "gym", name: "باشگاه ورزشی" },
  { id: "restaurant", name: "رستوران" },
  { id: "cafe", name: "کافه" },
  { id: "parking", name: "پارکینگ" },
  { id: "airport", name: "ترانسفر فرودگاهی" },
  { id: "laundry", name: "خشکشویی" },
  { id: "conference", name: "سالن کنفرانس" },
  { id: "kids", name: "زمین بازی کودکان" },
  { id: "beach", name: "دسترسی به ساحل" },
]

function rec(id: string, over: Partial<HotelRecord>): HotelRecord {
  const now = new Date().toISOString()
  return {
    id,
    name: "",
    slug: "",
    city: "",
    country: "ایران",
    address: "",
    stars: 4,
    status: "active",
    source: "manual",
    description: "",
    amenities: ["wifi"],
    roomsCount: 0,
    priceRange: { min: 0, max: 0 },
    createdAt: now,
    updatedAt: now,
    ...over,
  }
}

function seed(): HotelRecord[] {
  return [
    rec("h1", { name: "هتل اسپیناس پالاس", slug: "espina-palace", city: "تهران", stars: 5, roomsCount: 350, source: "wordpress", amenities: ["wifi", "pool", "spa", "gym", "restaurant", "parking"], priceRange: { min: 8500000, max: 32000000 } }),
    rec("h2", { name: "هتل هما شیراز", slug: "homa-shiraz", city: "شیراز", stars: 5, roomsCount: 280, source: "wordpress", amenities: ["wifi", "pool", "restaurant", "parking"], priceRange: { min: 6200000, max: 18000000 } }),
    rec("h3", { name: "هتل درویشی مشهد", slug: "darvishi-mashhad", city: "مشهد", stars: 5, roomsCount: 420, source: "wordpress", amenities: ["wifi", "restaurant", "cafe", "parking", "conference"], priceRange: { min: 7400000, max: 26000000 } }),
    rec("h4", { name: "هتل ترنج کیش", slug: "toranj-kish", city: "کیش", stars: 4, roomsCount: 120, source: "manual", amenities: ["wifi", "beach", "restaurant", "cafe"], priceRange: { min: 9800000, max: 28000000 } }),
    rec("h5", { name: "هتل سوئیس‌اتل استانبول", slug: "swissotel-istanbul", city: "استانبول", country: "ترکیه", stars: 5, roomsCount: 560, source: "wordpress", amenities: ["wifi", "pool", "spa", "gym", "restaurant", "airport"], priceRange: { min: 42000000, max: 95000000 } }),
    rec("h6", { name: "هتل رویال باتومی", slug: "royal-batumi", city: "باتومی", country: "گرجستان", stars: 4, status: "pending", roomsCount: 180, source: "manual", amenities: ["wifi", "beach", "cafe"], priceRange: { min: 28000000, max: 62000000 } }),
  ]
}

function write(list: HotelRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function listHotels(): HotelRecord[] {
  if (typeof window === "undefined") return seed()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const s = seed()
      write(s)
      return s
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seed()
  } catch {
    return seed()
  }
}

export function getHotel(id: string): HotelRecord | null {
  return listHotels().find((h) => h.id === id) || null
}

export function createHotel(data: Omit<HotelRecord, "id" | "createdAt" | "updatedAt">): HotelRecord {
  const now = new Date().toISOString()
  const record: HotelRecord = { ...data, id: `h${Date.now()}`, createdAt: now, updatedAt: now }
  write([record, ...listHotels()])
  return record
}

export function updateHotel(id: string, data: Omit<HotelRecord, "id" | "createdAt" | "updatedAt">): void {
  write(
    listHotels().map((h) =>
      h.id === id ? { ...h, ...data, updatedAt: new Date().toISOString() } : h
    )
  )
}

export function deleteHotel(id: string): void {
  write(listHotels().filter((h) => h.id !== id))
}
