/* ═══ ماژول کدهای تخفیف ═══ */

export type CouponType = "percent" | "fixed"
export type CouponStatus = "active" | "expired" | "inactive"

export interface CouponRecord {
  id: string
  code: string
  type: CouponType
  value: number              // درصد یا مبلغ ثابت
  minOrderAmount: number     // حداقل مبلغ سفارش
  maxDiscount: number        // سقف تخفیف (برای درصدی)
  usageLimit: number         // تعداد کل قابل استفاده
  usedCount: number          // تعداد استفاده شده
  perUserLimit: number       // محدودیت هر کاربر
  validTours: string[]       // لیست tour_id های مجاز
  startsAt: string           // تاریخ شروع (شمسی)
  expiresAt: string          // تاریخ انقضا (شمسی)
  status: CouponStatus
  description?: string
  createdAt: string
}

const KEY = "nextsafar_admin_coupons_v1"

export const couponStatusMap: Record<CouponStatus, { label: string; variant: "success" | "destructive" | "secondary" }> = {
  active: { label: "فعال", variant: "success" },
  expired: { label: "منقضی", variant: "destructive" },
  inactive: { label: "غیرفعال", variant: "secondary" },
}

export const couponTypeMap: Record<CouponType, string> = {
  percent: "درصدی",
  fixed: "مبلغ ثابت",
}

function seed(): CouponRecord[] {
  return [
    {
      id: "cpn-1",
      code: "WELCOME10",
      type: "percent",
      value: 10,
      minOrderAmount: 5000000,
      maxDiscount: 5000000,
      usageLimit: 1000,
      usedCount: 127,
      perUserLimit: 1,
      validTours: [],
      startsAt: "۱۴۰۴/۰۷/۰۱",
      expiresAt: "۱۴۰۴/۱۲/۲۹",
      status: "active",
      description: "کد تخفیف خوش‌آمدگویی ۱۰٪ برای کاربران جدید",
      createdAt: "۱۴۴/۰۷/۰۱",
    },
    {
      id: "cpn-2",
      code: "SUMMER500K",
      type: "fixed",
      value: 500000,
      minOrderAmount: 10000000,
      maxDiscount: 5000000,
      usageLimit: 500,
      usedCount: 89,
      perUserLimit: 2,
      validTours: [],
      startsAt: "۱۴۰۴/۰۴/۰۱",
      expiresAt: "۱۴۰۴/۰۶/۳۱",
      status: "expired",
      description: "۵۰۰ هزار تومان تخفیف تابستانی",
      createdAt: "۱۴۴/۰۴/۰۱",
    },
    {
      id: "cpn-3",
      code: "ISTANBUL20",
      type: "percent",
      value: 20,
      minOrderAmount: 15000000,
      maxDiscount: 10000000,
      usageLimit: 200,
      usedCount: 45,
      perUserLimit: 1,
      validTours: ["t1"],
      startsAt: "۱۴۰۴/۰۸/۰۱",
      expiresAt: "۱۴۰۴/۰۹/۳۰",
      status: "active",
      description: "تخفیف ویژه تور استانبول",
      createdAt: "۱۴۴/۰۸/۰۱",
    },
    {
      id: "cpn-4",
      code: "VIP30",
      type: "percent",
      value: 30,
      minOrderAmount: 50000000,
      maxDiscount: 20000000,
      usageLimit: 50,
      usedCount: 8,
      perUserLimit: 1,
      validTours: [],
      startsAt: "۱۴۰۴/۰۸/۱۵",
      expiresAt: "۱۴۰۴/۱۱/۳۰",
      status: "active",
      description: "کد تخفیف VIP برای مشتریان ویژه",
      createdAt: "۱۴۴/۰۸/۱۵",
    },
    {
      id: "cpn-5",
      code: "OLDYEAR",
      type: "percent",
      value: 15,
      minOrderAmount: 8000000,
      maxDiscount: 3000000,
      usageLimit: 100,
      usedCount: 100,
      perUserLimit: 1,
      validTours: [],
      startsAt: "۱۴۰۳/۱۲/۰۱",
      expiresAt: "۱۴۰۳/۱۲/۲۹",
      status: "expired",
      description: "تخفیف آخر سال ۱۴۰۳",
      createdAt: "۱۴۰۳/۱۲/۰۱",
    },
  ]
}

function read(): CouponRecord[] {
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

function write(list: CouponRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export const listCoupons = () => read()
export const getCoupon = (id: string) => read().find((c) => c.id === id) || null

export function createCoupon(data: Omit<CouponRecord, "id" | "usedCount" | "createdAt">): CouponRecord {
  const record: CouponRecord = {
    ...data,
    id: `cpn-${Date.now()}`,
    usedCount: 0,
    createdAt: new Date().toLocaleDateString("fa-IR"),
  }
  write([record, ...read()])
  return record
}

export function updateCoupon(id: string, data: Omit<CouponRecord, "id" | "createdAt">): void {
  write(read().map((c) => (c.id === id ? { ...c, ...data } : c)))
}

export function deleteCoupon(id: string): void {
  write(read().filter((c) => c.id !== id))
}

export function toggleCouponStatus(id: string): void {
  write(
    read().map((c) =>
      c.id === id
        ? { ...c, status: c.status === "active" ? "inactive" : "active" }
        : c
    )
  )
}
