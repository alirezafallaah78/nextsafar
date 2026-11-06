/* ═══ ماژول کاربران و مسافران ═══ */

export type UserRole = 
  | "user"           // مشتری عادی
  | "support"        // پشتیبانی
  | "tour_agent"     // آژانس تور
  | "visa_agent"     // کارشناس ویزا
  | "hotel_agent"    // کارشناس هتل
  | "finance"        // مالی
  | "content"        // محتوا
  | "admin"          // مدیر
  | "super_admin"    // سوپر ادمین

export type UserStatus = "active" | "blocked" | "pending_verification"

export interface Passenger {
  id: string
  userId: string
  firstName: string
  lastName: string
  nationalId: string
  passportNumber?: string
  birthDate: string
  gender: "male" | "female"
  relationship: "self" | "spouse" | "child" | "parent" | "other"
}

export interface UserRecord {
  id: string
  firstName: string
  lastName: string
  mobile: string
  email?: string
  role: UserRole
  status: UserStatus
  registeredAt: string
  lastLoginAt?: string
  ordersCount: number
  totalSpent: number
  passengers: Passenger[]
  // فیلدهای ادمین
  isTwoFactorEnabled?: boolean
  lastLoginIp?: string
}

const KEY = "nextsafar_admin_users_v1"

export const roleMap: Record<UserRole, { label: string; desc: string; color: string; perms: string[] }> = {
  user: {
    label: "کاربر",
    desc: "مشتری عادی پلتفرم",
    color: "bg-gray-100 text-gray-700",
    perms: [
      "مشاهده تورها و هتل‌ها",
      "رزرو آنلاین تور و هتل",
      "پرداخت و ثبت سفارش",
      "مدیریت پروفایل شخصی",
      "ارسال درخواست و مشاوره",
      "مشاهده سفارش‌ها و فاکتورها",
      "بارگذاری مدارک ویزا",
    ],
  },
  support: {
    label: "پشتیبانی",
    desc: "تیم پاسخ‌گویی و پیگیری",
    color: "bg-blue-100 text-blue-700",
    perms: [
      "مشاهده سفارش‌های مشتریان",
      "پاسخ به درخواست‌های جدید",
      "پیگیری لیدها و یادداشت‌گذاری",
      "ارسال اعلان به مشتریان",
      "مشاهده پرونده‌های ویزا (بدون ویرایش)",
      "ثبت تماس و تعاملات",
    ],
  },
  tour_agent: {
    label: "آژانس تور",
    desc: "مجریان و تأمین‌کنندگان تور",
    color: "bg-purple-100 text-purple-700",
    perms: [
      "ساخت و ویرایش تورهای خود",
      "مدیریت تاریخ‌ها و قیمت‌ها",
      "تنظیم ظرفیت و هتل‌ها",
      "مشاهده سفارش‌های مرتبط",
      "مدیریت لیست مسافران",
      "ارسال مدارک ویزای گروهی",
    ],
  },
  visa_agent: {
    label: "کارشناس ویزا",
    desc: "بررسی پرونده‌های ویزا",
    color: "bg-indigo-100 text-indigo-700",
    perms: [
      "مشاهده و ویرایش پرونده‌های ویزا",
      "تأیید یا رد مدارک مشتریان",
      "تغییر وضعیت پرونده ویزا",
      "ثبت وقت سفارت",
      "ارسال پیام به متقاضی",
      "تخصیص پرونده به خود",
    ],
  },
  hotel_agent: {
    label: "کارشناس هتل",
    desc: "مدیریت هتل‌ها و اتاق‌ها",
    color: "bg-teal-100 text-teal-700",
    perms: [
      "ساخت و ویرایش هتل‌ها",
      "مدیریت اتاق‌ها و ظرفیت‌ها",
      "تنظیم قیمت‌های فصلی",
      "همگام‌سازی با وردپرس",
      "مدیریت تصاویر و امکانات",
      "مشاهده رزروهای مرتبط",
    ],
  },
  finance: {
    label: "مالی",
    desc: "مدیریت پرداخت و استرداد",
    color: "bg-green-100 text-green-700",
    perms: [
      "مشاهده همه پرداخت‌ها",
      "تأیید یا رد درخواست استرداد",
      "صدور فاکتور و رسید",
      "مشاهده گزارش‌های مالی",
      "خروجی گرفتن از تراکنش‌ها",
      "مدیریت درگاه پرداخت",
    ],
  },
  content: {
    label: "محتوا",
    desc: "مدیریت مقالات و سئو",
    color: "bg-orange-100 text-orange-700",
    perms: [
      "نوشتن و ویرایش مقالات",
      "مدیریت دسته‌بندی‌ها و برچسب‌ها",
      "تنظیم سئو و متادیتا",
      "مدیریت تصاویر و رسانه‌ها",
      "ایجاد صفحه لندینگ",
      "مشاهده آمار بازدید",
    ],
  },
  admin: {
    label: "مدیر",
    desc: "مدیریت عملیات روزانه",
    color: "bg-red-100 text-red-700",
    perms: [
      "دسترسی به همه بخش‌های کاتالوگ",
      "مدیریت سفارش‌ها و استردادها",
      "ساخت و ویرایش کدهای تخفیف",
      "مشاهده گزارش‌ها و تحلیل‌ها",
      "مدیریت اطلاع‌رسانی‌ها",
      "همگام‌سازی وردپرس",
    ],
  },
  super_admin: {
    label: "سوپر ادمین",
    desc: "دسترسی کامل به سیستم",
    color: "bg-pink-100 text-pink-700",
    perms: [
      "تمام دسترسی‌های مدیر",
      "مدیریت کاربران و نقش‌ها",
      "تنظیمات سیستم و پروایدرها",
      "مشاهده لاگ عملیات و ورود",
      "پشتیبان‌گیری و بازیابی",
      "تنظیمات امنیتی و 2FA",
    ],
  },
}

export const statusMap: Record<UserStatus, { label: string; variant: "success" | "destructive" | "outline" }> = {
  active: { label: "فعال", variant: "success" },
  blocked: { label: "مسدود", variant: "destructive" },
  pending_verification: { label: "در انتظار تأیید", variant: "outline" },
}

export const relationshipMap: Record<string, string> = {
  self: "خود",
  spouse: "همسر",
  child: "فرزند",
  parent: "والد",
  other: "سایر",
}

function seed(): UserRecord[] {
  return [
    {
      id: "u1",
      firstName: "Super",
      lastName: "Admin",
      mobile: "09120000000",
      email: "admin@nextsafar.ir",
      role: "super_admin",
      status: "active",
      registeredAt: "۱۴۰۴/۰۶/۰۱",
      lastLoginAt: "۱۴۰۴/۰۸/۰۸",
      ordersCount: 0,
      totalSpent: 0,
      passengers: [],
      isTwoFactorEnabled: true,
      lastLoginIp: "192.168.1.1",
    },
    {
      id: "u2",
      firstName: "علی",
      lastName: "رضایی",
      mobile: "09121234567",
      email: "ali@example.com",
      role: "user",
      status: "active",
      registeredAt: "۱۴۰۴/۰۶/۱۵",
      lastLoginAt: "۱۴۰۴/۰۸/۰۵",
      ordersCount: 3,
      totalSpent: 51000000,
      passengers: [
        { id: "p1", userId: "u2", firstName: "علی", lastName: "رضایی", nationalId: "0012345678", birthDate: "۱۳۷۰/۰۵/۱۰", gender: "male", relationship: "self" },
        { id: "p2", userId: "u2", firstName: "مریم", lastName: "رضایی", nationalId: "0023456789", birthDate: "۱۳۷۵/۰۳/۲۰", gender: "female", relationship: "spouse" },
        { id: "p3", userId: "u2", firstName: "آرمین", lastName: "رضایی", nationalId: "0034567890", birthDate: "۱۳۹۵/۰۸/۱۵", gender: "male", relationship: "child" },
      ],
    },
    {
      id: "u3",
      firstName: "مریم",
      lastName: "کریمی",
      mobile: "09351112233",
      role: "user",
      status: "active",
      registeredAt: "۱۴۰۴/۰۷/۰۲",
      lastLoginAt: "۱۴۰۴/۰۸/۰۴",
      ordersCount: 1,
      totalSpent: 5900000,
      passengers: [
        { id: "p4", userId: "u3", firstName: "مریم", lastName: "کریمی", nationalId: "0045678901", birthDate: "۱۳۸۰/۰۲/۱۰", gender: "female", relationship: "self" },
      ],
    },
    {
      id: "u4",
      firstName: "حسین",
      lastName: "موسوی",
      mobile: "09903334455",
      email: "hossein@nextsafar.ir",
      role: "support",
      status: "active",
      registeredAt: "۱۴۰۴/۰۶/۲۰",
      lastLoginAt: "۱۴۰۴/۰۸/۰۸",
      ordersCount: 0,
      totalSpent: 0,
      passengers: [],
      lastLoginIp: "192.168.1.50",
    },
    {
      id: "u5",
      firstName: "زهرا",
      lastName: "احمدی",
      mobile: "09127778899",
      email: "zahra@nextsafar.ir",
      role: "tour_agent",
      status: "active",
      registeredAt: "۱۴۰۴/۰۷/۱۰",
      lastLoginAt: "۱۴۰۴/۰۸/۰۷",
      ordersCount: 0,
      totalSpent: 0,
      passengers: [],
      lastLoginIp: "192.168.1.100",
    },
    {
      id: "u6",
      firstName: "امیر",
      lastName: "تهرانی",
      mobile: "09364445566",
      role: "user",
      status: "blocked",
      registeredAt: "۱۴۰۴/۰۷/۲۲",
      ordersCount: 2,
      totalSpent: 12400000,
      passengers: [
        { id: "p5", userId: "u6", firstName: "امیر", lastName: "تهرانی", nationalId: "0056789012", birthDate: "۱۳۸۵/۱۱/۰۵", gender: "male", relationship: "self" },
        { id: "p6", userId: "u6", firstName: "سارا", lastName: "تهرانی", nationalId: "0067890123", birthDate: "۱۳۹۰/۰۶/۲۰", gender: "female", relationship: "child" },
      ],
    },
    {
      id: "u7",
      firstName: "نگار",
      lastName: "محمدی",
      mobile: "09120001122",
      role: "user",
      status: "active",
      registeredAt: "۱۴۰۴/۰۷/۲۵",
      lastLoginAt: "۱۴۰۴/۰۸/۰۸",
      ordersCount: 1,
      totalSpent: 18500000,
      passengers: [
        { id: "p7", userId: "u7", firstName: "نگار", lastName: "محمدی", nationalId: "0078901234", birthDate: "۱۳۷۸/۰۹/۱۵", gender: "female", relationship: "self" },
      ],
    },
  ]
}

function normalizeUser(u: any): UserRecord {
  return {
    ...u,
    ordersCount: typeof u.ordersCount === "number" ? u.ordersCount : 0,
    totalSpent: typeof u.totalSpent === "number" ? u.totalSpent : 0,
    passengers: Array.isArray(u.passengers) ? u.passengers : [],
    status: u.status || "active",
    role: u.role || "user",
  }
}

function read(): UserRecord[] {
  if (typeof window === "undefined") return seed()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed()))
      return seed()
    }
    const p = JSON.parse(raw)
    if (!Array.isArray(p)) return seed()
    return p.map(normalizeUser)
  } catch {
    return seed()
  }
}

function write(list: UserRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export const listUsers = () => read()
export const getUser = (id: string) => read().find((u) => u.id === id) || null

export function updateUserRole(id: string, role: UserRole): void {
  write(read().map((u) => (u.id === id ? { ...u, role } : u)))
}

export function toggleUserBlock(id: string): void {
  write(read().map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "blocked" : "active" } : u)))
}

export function addPassenger(userId: string, passenger: Omit<Passenger, "id" | "userId">): void {
  const users = read()
  const user = users.find((u) => u.id === userId)
  if (!user) return
  const newPassenger: Passenger = {
    ...passenger,
    id: `p-${Date.now()}`,
    userId,
  }
  user.passengers.push(newPassenger)
  write(users)
}

export function updatePassenger(userId: string, passengerId: string, data: Partial<Passenger>): void {
  const users = read()
  const user = users.find((u) => u.id === userId)
  if (!user) return
  user.passengers = user.passengers.map((p) => (p.id === passengerId ? { ...p, ...data } : p))
  write(users)
}

export function deletePassenger(userId: string, passengerId: string): void {
  const users = read()
  const user = users.find((u) => u.id === userId)
  if (!user) return
  user.passengers = user.passengers.filter((p) => p.id !== passengerId)
  write(users)
}

// فیلتر کاربران بر اساس نوع
export function filterUsersByType(type: "all" | "customers" | "admins" | "staff"): UserRecord[] {
  const users = read()
  switch (type) {
    case "customers":
      return users.filter((u) => u.role === "user")
    case "admins":
      return users.filter((u) => ["admin", "super_admin"].includes(u.role))
    case "staff":
      return users.filter((u) => ["support", "tour_agent", "visa_agent", "hotel_agent", "finance", "content"].includes(u.role))
    default:
      return users
  }
}

/* ═══ مدیریت پروفایل کاربر فعلی ═══ */

export interface ProfileUpdate {
  firstName?: string
  lastName?: string
  email?: string
  mobile?: string
}

export interface PasswordChange {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/** بروزرسانی پروفایل کاربر */
export function updateProfile(userId: string, data: ProfileUpdate): UserRecord | null {
  const users = read()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return null
  
  users[idx] = { ...users[idx], ...data }
  write(users)
  
  // بروزرسانی localStorage user (برای نمایش در هدر)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user.id === userId) {
          localStorage.setItem("user", JSON.stringify({ ...user, ...data }))
        }
      } catch {}
    }
  }
  
  return users[idx]
}

/** تغییر رمز عبور (شبیه‌سازی - در پروداکشن به API می‌رود) */
export function changePassword(userId: string, data: PasswordChange): { success: boolean; message: string } {
  if (data.newPassword !== data.confirmPassword) {
    return { success: false, message: "تکرار رمز عبور مطابقت ندارد" }
  }
  if (data.newPassword.length < 8) {
    return { success: false, message: "رمز عبور باید حداقل ۸ کاراکتر باشد" }
  }
  if (data.currentPassword === data.newPassword) {
    return { success: false, message: "رمز جدید نباید با رمز فعلی یکسان باشد" }
  }
  
  // در حالت واقعی: بررسی currentPassword با هش ذخیره‌شده
  // در حالت دمو: فقط لاگ می‌کنیم
  return { success: true, message: "رمز عبور با موفقیت تغییر کرد" }
}

/** تغییر وضعیت 2FA */
export function toggle2FA(userId: string, enabled: boolean): void {
  const users = read()
  write(users.map((u) => (u.id === userId ? { ...u, isTwoFactorEnabled: enabled } : u)))
}
