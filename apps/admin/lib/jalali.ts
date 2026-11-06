/**
 * توابع کاربردی برای تبدیل و کار با تاریخ شمسی (جلالی)
 * مطابق با فرانت‌اند اصلی Nextsafar
 */
import * as faCal from "date-fns-jalali"
import { faIR } from "date-fns-jalali/locale"
import { isValid } from "date-fns-jalali"
import { differenceInCalendarDays } from "date-fns"

const JALALI_FMT = "yyyy/MM/dd"

/**
 * تبدیل رشته تاریخ شمسی (YYYY/MM/DD) به شی Date
 */
export function parseJalaliDate(s: string | undefined | null): Date | undefined {
  if (!s) return undefined
  try {
    const d = faCal.parse(s, JALALI_FMT, new Date())
    return isValid(d) ? d : undefined
  } catch {
    return undefined
  }
}

/**
 * تبدیل شی Date به رشته تاریخ شمسی (YYYY/MM/DD)
 */
export function formatJalaliDate(d: Date | undefined | null): string {
  if (!d || !isValid(d)) return ""
  return faCal.format(d, JALALI_FMT)
}

/**
 * نمایش تاریخ شمسی به فرمت خوانا: "۱۵ آبان ۱۴۰۴"
 */
export function formatJalaliLong(d: Date | undefined | null): string {
  if (!d || !isValid(d)) return ""
  return faCal.format(d, "d MMMM yyyy", { locale: faIR })
}

/**
 * تاریخ امروز به صورت Date (بدون ساعت)
 */
export function todayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * تاریخ امروز به صورت رشته شمسی (YYYY/MM/DD)
 */
export function todayJalali(): string {
  return formatJalaliDate(todayStart())
}

/**
 * محاسبه تعداد شب‌های بین دو تاریخ شمسی
 */
export function calcNights(from?: string, to?: string): number | null {
  if (!from || !to) return null
  const f = parseJalaliDate(from)
  const t = parseJalaliDate(to)
  if (!f || !t) return null
  const diff = differenceInCalendarDays(t, f)
  return diff > 0 ? diff : null
}

/**
 * تبدیل مقدار به عدد امن — null, undefined, NaN را به 0 تبدیل می‌کند
 */
export function toSafeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }
  return 0
}

/**
 * تبدیل اعداد انگلیسی به فارسی با جداکننده ۳ رقمی
 * ✅ مقاوم در برابر null/undefined/NaN
 */
export function faNum(n: number | string | null | undefined): string {
  const num = toSafeNumber(n)
  try {
    return num.toLocaleString("fa-IR")
  } catch {
    return "۰"
  }
}

/**
 * فرمت قیمت با واحد ریال و جداکننده ۳ رقمی
 * ✅ مقاوم در برابر null/undefined/NaN
 */
export function faPrice(value: number | string | null | undefined): string {
  const num = toSafeNumber(value)
  return `${faNum(num)} ریال`
}
