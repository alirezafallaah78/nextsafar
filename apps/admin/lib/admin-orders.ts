/* ═══ مدل داده — مطابق سند مرجع: چرخه سفارش + پرداخت + استرداد ═══ */

export type OrderStatus = "pending" | "confirmed" | "processing" | "completed" | "cancelled"
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded"
export type PaymentState = "success" | "failed" | "pending" | "refunded"
export type RefundStatus = "requested" | "approved" | "rejected" | "completed"

export interface OrderPassenger {
  name: string
  type: "adult" | "child" | "infant"
  price: number
}

export interface OrderRecord {
  id: string
  customer: { name: string; mobile: string }
  tourTitle: string
  tourId?: string
  departureDate: string
  passengers: OrderPassenger[]
  totalAmount: number
  paidAmount: number
  discount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
}

export interface PaymentRecord {
  id: string
  orderId: string
  amount: number
  gateway: "zarinpal" | "mock"
  status: PaymentState
  trackingCode: string
  createdAt: string
}

export interface RefundRecord {
  id: string
  orderId: string
  amount: number
  reason: string
  status: RefundStatus
  createdAt: string
}

interface OrdersDB {
  orders: OrderRecord[]
  payments: PaymentRecord[]
  refunds: RefundRecord[]
}

const KEY = "nextsafar_admin_orders_v1"

/* ─── نگاشت وضعیت‌ها ─── */
export const orderStatusMap: Record<OrderStatus, { label: string; variant: "outline" | "info" | "secondary" | "success" | "destructive" }> = {
  pending: { label: "در انتظار پرداخت", variant: "outline" },
  confirmed: { label: "تأیید شده", variant: "info" },
  processing: { label: "در حال انجام", variant: "secondary" },
  completed: { label: "انجام شده", variant: "success" },
  cancelled: { label: "لغو شده", variant: "destructive" },
}

export const paymentStatusMap: Record<PaymentStatus, { label: string; variant: "outline" | "info" | "secondary" | "success" | "destructive" }> = {
  unpaid: { label: "پرداخت نشده", variant: "destructive" },
  partial: { label: "پرداخت جزئی", variant: "outline" },
  paid: { label: "پرداخت شده", variant: "success" },
  refunded: { label: "مسترد شده", variant: "secondary" },
}

export const paymentStateMap: Record<PaymentState, { label: string; variant: "outline" | "info" | "secondary" | "success" | "destructive" }> = {
  success: { label: "موفق", variant: "success" },
  failed: { label: "ناموفق", variant: "destructive" },
  pending: { label: "در انتظار", variant: "outline" },
  refunded: { label: "مسترد", variant: "secondary" },
}

export const refundStatusMap: Record<RefundStatus, { label: string; variant: "outline" | "info" | "secondary" | "success" | "destructive" }> = {
  requested: { label: "درخواست شده", variant: "outline" },
  approved: { label: "تأیید شده", variant: "info" },
  completed: { label: "انجام شده", variant: "success" },
  rejected: { label: "رد شده", variant: "destructive" },
}

/* ─── داده نمونه ─── */
function seed(): OrdersDB {
  return {
    orders: [
      { id: "ORD-1024", customer: { name: "علی رضایی", mobile: "09121234567" }, tourTitle: "تور استانبول ۵ روزه", departureDate: "۱۴۴/۰۸/۱۲", passengers: [ { name: "علی رضایی", type: "adult", price: 18500000 }, { name: "مریم رضایی", type: "adult", price: 18500000 }, { name: "آرمین رضایی", type: "child", price: 14000000 } ], totalAmount: 51000000, paidAmount: 51000000, discount: 0, status: "confirmed", paymentStatus: "paid", createdAt: "۱۴۴/۰۸/۰۵ ۱۰:۲۰" },
      { id: "ORD-1023", customer: { name: "مریم کریمی", mobile: "09351112233" }, tourTitle: "تور شمال ۳ روزه", departureDate: "۱۴۰۴/۰۸/۲۰", passengers: [ { name: "مریم کریمی", type: "adult", price: 5900000 } ], totalAmount: 5900000, paidAmount: 0, discount: 0, status: "pending", paymentStatus: "unpaid", createdAt: "۱۴۰۴/۰۸/۰۴ ۱۸:۴۵" },
      { id: "ORD-1022", customer: { name: "حسین موسوی", mobile: "09903334455" }, tourTitle: "تور مشهد زیارتی", departureDate: "۱۴۴/۰۸/۱۵", passengers: [ { name: "حسین موسوی", type: "adult", price: 12400000 }, { name: "زهرا موسوی", type: "adult", price: 12400000 } ], totalAmount: 24800000, paidAmount: 24800000, discount: 0, status: "processing", paymentStatus: "paid", createdAt: "۱۴۰۴/۰۸/۰۳ ۰۹:۱۰" },
      { id: "ORD-1021", customer: { name: "زهرا احمدی", mobile: "09127778899" }, tourTitle: "تور کیش لوکس", departureDate: "۱۴۰۴/۰۸/۱۰", passengers: [ { name: "زهرا احمدی", type: "adult", price: 24800000 } ], totalAmount: 24800000, paidAmount: 24800000, discount: 0, status: "cancelled", paymentStatus: "refunded", createdAt: "۱۴۴/۰۸/۰۲ ۱۴:۳۰" },
      { id: "ORD-1020", customer: { name: "امیر تهرانی", mobile: "09364445566" }, tourTitle: "تور شیراز و پرسپولیس", departureDate: "۱۴۰۴/۰۸/۱۸", passengers: [ { name: "امیر تهرانی", type: "adult", price: 7200000 }, { name: "سارا تهرانی", type: "child", price: 5200000 } ], totalAmount: 12400000, paidAmount: 6200000, discount: 0, status: "confirmed", paymentStatus: "partial", createdAt: "۱۴۰۴/۰۸/۰۱ ۱۱:۰۰" },
      { id: "ORD-1019", customer: { name: "نگار محمدی", mobile: "09120001122" }, tourTitle: "تور استانبول ۵ روزه", departureDate: "۱۴۴/۰۷/۲۸", passengers: [ { name: "نگار محمدی", type: "adult", price: 18500000 } ], totalAmount: 18500000, paidAmount: 18500000, discount: 0, status: "completed", paymentStatus: "paid", createdAt: "۱۴۰۴/۰۷/۲۵ ۱۶:۲۰" },
    ],
    payments: [
      { id: "PAY-2041", orderId: "ORD-1024", amount: 51000000, gateway: "zarinpal", status: "success", trackingCode: "888123456", createdAt: "۱۴۰۴/۰۸/۰۵ ۱۰:۲۲" },
      { id: "PAY-2040", orderId: "ORD-1023", amount: 5900000, gateway: "zarinpal", status: "failed", trackingCode: "-", createdAt: "۱۴۴/۰۸/۰۴ ۱۸:۵۰" },
      { id: "PAY-2039", orderId: "ORD-1022", amount: 24800000, gateway: "zarinpal", status: "success", trackingCode: "888123111", createdAt: "۱۴۰۴/۰۸/۰۳ ۰۹:۱۲" },
      { id: "PAY-2038", orderId: "ORD-1021", amount: 24800000, gateway: "zarinpal", status: "refunded", trackingCode: "888122999", createdAt: "۱۴۰۴/۰۸/۰۲ ۱۴:۳۲" },
      { id: "PAY-2037", orderId: "ORD-1020", amount: 6200000, gateway: "zarinpal", status: "success", trackingCode: "888122777", createdAt: "۱۴۰۴/۰۸/۰۱ ۱۱:۰۵" },
      { id: "PAY-2036", orderId: "ORD-1019", amount: 18500000, gateway: "zarinpal", status: "success", trackingCode: "888122555", createdAt: "۱۴۰۴/۰۷/۲۵ ۱۶:۲۲" },
    ],
    refunds: [
      { id: "REF-301", orderId: "ORD-1021", amount: 24800000, reason: "لغو سفر به دلیل بیماری", status: "completed", createdAt: "۱۴۰۴/۰۸/۰۲ ۱۵:۰۰" },
      { id: "REF-302", orderId: "ORD-1020", amount: 6200000, reason: "انصراف مسافر دوم", status: "requested", createdAt: "۱۴۰۴/۰۸/۰۶ ۰۸:۳۰" },
    ],
  }
}

function read(): OrdersDB {
  if (typeof window === "undefined") return seed()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const s = seed()
      localStorage.setItem(KEY, JSON.stringify(s))
      return s
    }
    return JSON.parse(raw)
  } catch {
    return seed()
  }
}

function write(db: OrdersDB) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(db))
}

/* ─── دسترسی‌ها ─── */
export const listOrders = () => read().orders
export const getOrder = (id: string) => read().orders.find((o) => o.id === id) || null
export const listPayments = () => read().payments
export const listRefunds = () => read().refunds
export const paymentsOf = (orderId: string) => read().payments.filter((p) => p.orderId === orderId)
export const refundsOf = (orderId: string) => read().refunds.filter((r) => r.orderId === orderId)

/* ─── عملیات ─── */
export function updateOrderStatus(id: string, status: OrderStatus): void {
  const db = read()
  db.orders = db.orders.map((o) => (o.id === id ? { ...o, status } : o))
  if (status === "cancelled") {
    db.orders = db.orders.map((o) => (o.id === id ? { ...o, paymentStatus: o.paidAmount > 0 ? "refunded" : "unpaid" } : o))
  }
  write(db)
}

export function approveRefund(id: string): void {
  const db = read()
  const refund = db.refunds.find((r) => r.id === id)
  if (!refund) return
  db.refunds = db.refunds.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
  db.orders = db.orders.map((o) => (o.id === refund.orderId ? { ...o, paymentStatus: "refunded" } : o))
  db.payments = db.payments.map((p) => (p.orderId === refund.orderId && p.status === "success" ? { ...p, status: "refunded" } : p))
  write(db)
}

export function rejectRefund(id: string): void {
  const db = read()
  db.refunds = db.refunds.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
  write(db)
}

/* ─── ساخت سفارش از Lead (تبدیل درخواست به سفارش) ─── */
export function createOrder(data: Omit<OrderRecord, "id" | "createdAt">): OrderRecord {
  const db = read()
  const maxNum = db.orders.reduce((m, o) => {
    const n = parseInt(o.id.replace("ORD-", ""), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 1000)
  const record: OrderRecord = {
    ...data,
    id: `ORD-${maxNum + 1}`,
    createdAt: new Date().toLocaleString("fa-IR"),
  }
  db.orders = [record, ...db.orders]
  write(db)
  return record
}
