/* ═══ ماژول تنظیمات سیستم ═══ */

export interface GeneralSettings {
  siteName: string
  siteUrl: string
  supportPhone: string
  supportEmail: string
  address: string
  timezone: string
  language: string
  currency: string
  maintenanceMode: boolean
}

export interface SmsSettings {
  provider: "kavenegar" | "sms_ir" | "meli_payamak" | "disabled"
  apiKey: string
  senderNumber: string
  signature: string
  enabled: boolean
}

export interface EmailSettings {
  provider: "smtp" | "mailgun" | "sendgrid" | "disabled"
  host: string
  port: number
  username: string
  password: string
  fromEmail: string
  fromName: string
  encryption: "tls" | "ssl" | "none"
  enabled: boolean
}

export interface PaymentSettings {
  provider: "zarinpal" | "idpay" | "nextpay" | "disabled"
  merchantId: string
  sandboxMode: boolean
  callbackUrl: string
  minAmount: number
  maxAmount: number
  enabled: boolean
}

export interface SeoSettings {
  defaultTitle: string
  defaultDescription: string
  defaultKeywords: string
  googleAnalyticsId: string
  googleSearchConsole: string
  robotsTxt: string
  sitemapEnabled: boolean
}

export interface BackupSettings {
  autoBackup: boolean
  frequency: "daily" | "weekly" | "monthly"
  retentionDays: number
  lastBackup: string
  storage: "local" | "s3" | "dropbox"
}

export interface AllSettings {
  general: GeneralSettings
  sms: SmsSettings
  email: EmailSettings
  payment: PaymentSettings
  seo: SeoSettings
  backup: BackupSettings
}

const KEY = "nextsafar_admin_settings_v1"

/* ═══ مقادیر پیش‌فرض ═══ */
export const defaultSettings: AllSettings = {
  general: {
    siteName: "سفر بعدی ایرانیان",
    siteUrl: "https://nextsafar.ir",
    supportPhone: "021-91009090",
    supportEmail: "support@nextsafar.ir",
    address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
    timezone: "Asia/Tehran",
    language: "fa",
    currency: "IRR",
    maintenanceMode: false,
  },
  sms: {
    provider: "kavenegar",
    apiKey: "",
    senderNumber: "10004346",
    signature: "سفر بعدی ایرانیان",
    enabled: true,
  },
  email: {
    provider: "smtp",
    host: "smtp.gmail.com",
    port: 587,
    username: "",
    password: "",
    fromEmail: "noreply@nextsafar.ir",
    fromName: "سفر بعدی ایرانیان",
    encryption: "tls",
    enabled: true,
  },
  payment: {
    provider: "zarinpal",
    merchantId: "",
    sandboxMode: true,
    callbackUrl: "https://nextsafar.ir/payment/callback",
    minAmount: 10000,
    maxAmount: 5000000000,
    enabled: true,
  },
  seo: {
    defaultTitle: "سفر بعدی ایرانیان | تور، هتل، ویزا",
    defaultDescription: "پلتفرم جامع رزرو تور، هتل و خدمات ویزا برای ایرانیان",
    defaultKeywords: "تور، هتل، ویزا، سفر، رزرو آنلاین",
    googleAnalyticsId: "",
    googleSearchConsole: "",
    robotsTxt: "User-agent: *\nAllow: /",
    sitemapEnabled: true,
  },
  backup: {
    autoBackup: true,
    frequency: "daily",
    retentionDays: 30,
    lastBackup: "",
    storage: "local",
  },
}

/* ═══ نگاشت‌ها ═══ */
export const smsProviderMap = {
  kavenegar: { label: "کاوه‌نگار", url: "https://kavenegar.com" },
  sms_ir: { label: "SMS.ir", url: "https://sms.ir" },
  meli_payamak: { label: "ملی پیامک", url: "https://melipayamak.com" },
  disabled: { label: "غیرفعال", url: "" },
}

export const emailProviderMap = {
  smtp: { label: "SMTP", url: "" },
  mailgun: { label: "Mailgun", url: "https://mailgun.com" },
  sendgrid: { label: "SendGrid", url: "https://sendgrid.com" },
  disabled: { label: "غیرفعال", url: "" },
}

export const paymentProviderMap = {
  zarinpal: { label: "زرین‌پال", url: "https://zarinpal.com" },
  idpay: { label: "آی‌دی‌پی", url: "https://idpay.ir" },
  nextpay: { label: "نکست‌پی", url: "https://nextpay.org" },
  disabled: { label: "غیرفعال", url: "" },
}

export const timezoneOptions = [
  { value: "Asia/Tehran", label: "تهران (GMT+3:30)" },
  { value: "Asia/Dubai", label: "دبی (GMT+4)" },
  { value: "Europe/Istanbul", label: "استانبول (GMT+3)" },
  { value: "UTC", label: "UTC" },
]

export const currencyOptions = [
  { value: "IRR", label: "ریال ایران" },
  { value: "IRT", label: "تومان ایران" },
  { value: "USD", label: "دلار آمریکا" },
  { value: "EUR", label: "یورو" },
]

export const languageOptions = [
  { value: "fa", label: "فارسی" },
  { value: "en", label: "انگلیسی" },
]

/* ═══ خواندن/نوشتن ═══ */
export function getSettings(): AllSettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(defaultSettings))
      return defaultSettings
    }
    const saved = JSON.parse(raw)
    return { ...defaultSettings, ...saved }
  } catch {
    return defaultSettings
  }
}

export function saveSettings<K extends keyof AllSettings>(
  section: K,
  data: Partial<AllSettings[K]>
): AllSettings[K] {
  const current = getSettings()
  const merged = { ...current[section], ...data }
  const all = { ...current, [section]: merged }
  localStorage.setItem(KEY, JSON.stringify(all))
  return merged
}

/* ═══ تست اتصال (شبیه‌سازی) ═══ */
export function testSmsConnection(settings: SmsSettings): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!settings.enabled) {
        resolve({ success: false, message: "سرویس SMS غیرفعال است" })
        return
      }
      if (!settings.apiKey) {
        resolve({ success: false, message: "کلید API الزامی است" })
        return
      }
      resolve({ success: true, message: `اتصال به ${smsProviderMap[settings.provider].label} با موفقیت برقرار شد` })
    }, 1500)
  })
}

export function testEmailConnection(settings: EmailSettings): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!settings.enabled) {
        resolve({ success: false, message: "سرویس ایمیل غیرفعال است" })
        return
      }
      if (!settings.host || !settings.username) {
        resolve({ success: false, message: "هاست و نام کاربری الزامی است" })
        return
      }
      resolve({ success: true, message: `اتصال به SMTP ${settings.host} با موفقیت برقرار شد` })
    }, 1500)
  })
}

export function testPaymentConnection(settings: PaymentSettings): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!settings.enabled) {
        resolve({ success: false, message: "درگاه پرداخت غیرفعال است" })
        return
      }
      if (!settings.merchantId) {
        resolve({ success: false, message: "شناسه پذیرنده الزامی است" })
        return
      }
      const provider = paymentProviderMap[settings.provider].label
      resolve({ success: true, message: `اتصال به ${provider}${settings.sandboxMode ? " (محیط تست)" : ""} موفق بود` })
    }, 1500)
  })
}

export function runBackup(): Promise<{ success: boolean; message: string; size: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const size = (Math.random() * 50 + 10).toFixed(1)
      resolve({
        success: true,
        message: `پشتیبان‌گیری با موفقیت انجام شد`,
        size: `${size} مگابایت`,
      })
    }, 2500)
  })
}
